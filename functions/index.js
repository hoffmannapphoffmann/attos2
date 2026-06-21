/**
 * ATTOS2 — Cloud Functions
 * Integrações: Asaas (pagamentos), Melhor Envio (frete), Resend (emails)
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { FieldValue, Timestamp } = require("firebase-admin/firestore");
const axios = require("axios");

setGlobalOptions({ maxInstances: 10, region: "southamerica-east1" });

admin.initializeApp();
const db = admin.firestore();

// ============================================
// SEGREDOS (variáveis de ambiente seguras)
// ============================================
const ASAAS_API_KEY = defineSecret("ASAAS_API_KEY");
const SEED_KEY = defineSecret("SEED_KEY");
const MELHOR_ENVIO_TOKEN = defineSecret("MELHOR_ENVIO_TOKEN");
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");


// ============================================
// ASASS — GERAR COBRANÇA
// ============================================
// POST /api/gerar-cobranca
// Body: { pedidoId, clienteNome, clienteEmail, cpfCnpj, valor, descricao }
// Retorna: { success, pixCopiaECola, pixQrCode, linkPagamento, id }
exports.gerarCobranca = onRequest(
  { secrets: [ASAAS_API_KEY] },
  async (req, res) => {
    // CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");

    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    let reservas = []; // [{ produtoId, corte, tamanho, quantidade }]
    let pedidoId; // visível no catch para rollback
    try {
      const { pedidoId: pid, clienteNome, clienteEmail, cpfCnpj, valor, descricao } = req.body;
      pedidoId = pid;

      if (!pedidoId || !clienteNome || !clienteEmail || !cpfCnpj || !valor) {
        return res.status(400).json({ error: "Campos obrigatórios: pedidoId, clienteNome, clienteEmail, cpfCnpj, valor" });
      }

      // ============================================
      // TAREFA 4: RESERVAR ESTOQUE VIA TRANSAÇÃO
      // ============================================
      // Antes de criar cobrança no Asaas, reserva o estoque de cada item
      // para evitar que 2 compras simultâneas comprem o mesmo estoque.
      try {
        const pedidoDoc = await db.collection("pedidos").doc(pedidoId).get();
        if (!pedidoDoc.exists) {
          return res.status(404).json({ error: "Pedido não encontrado" });
        }
        const pedidoData = pedidoDoc.data();
        const itens = pedidoData.itens || [];

        for (const item of itens) {
          if (!item.produtoId || !item.corte || !item.tamanho || !item.quantidade) continue;

          const produtoRef = db.collection("produtos").doc(item.produtoId);
          const campoEstoque = "modelos." + item.corte + "." + item.tamanho;

          await db.runTransaction(async (transaction) => {
            const produtoSnap = await transaction.get(produtoRef);
            if (!produtoSnap.exists) {
              throw new Error("Produto " + item.produtoId + " não encontrado");
            }
            const data = produtoSnap.data();
            const modelos = data.modelos || {};
            const estoqueAtual = (modelos[item.corte] && modelos[item.corte][item.tamanho]) || 0;
            if (estoqueAtual < item.quantidade) {
              throw new Error("Estoque insuficiente para " + item.nome + " (" + item.corte + "/" + item.tamanho + "): " + estoqueAtual + " disponíveis, " + item.quantidade + " solicitados");
            }
            transaction.update(produtoRef, {
              [campoEstoque]: FieldValue.increment(-item.quantidade)
            });
          });

          reservas.push({
            produtoId: item.produtoId,
            corte: item.corte,
            tamanho: item.tamanho,
            quantidade: item.quantidade
          });
        }

        // Marca no pedido que o estoque foi reservado
        await db.collection("pedidos").doc(pedidoId).update({
          estoqueReservado: true,
          reservas: reservas
        });
        logger.info("Estoque reservado para pedido " + pedidoId + ": " + JSON.stringify(reservas));
      } catch (errReserva) {
        logger.error("Falha ao reservar estoque:", errReserva.message);
        return res.status(409).json({
          success: false,
          error: "Não foi possível reservar o estoque: " + errReserva.message
        });
      }
      // ============================================
      // FIM TAREFA 4 — RESERVA DE ESTOQUE
      // ============================================

      const ASAAS_BASE = "https://api.asaas.com/v3";
      const headers = {
        "access_token": ASAAS_API_KEY.value(),
        "Content-Type": "application/json",
        "User-Agent": "ATTOS2/1.0 (Firebase Cloud Function)"
      };

      // 1. Criar/obter cliente no Asaas
      let asaasCustomerId;

      // Buscar cliente pelo email
      const buscaCliente = await axios.get(`${ASAAS_BASE}/customers`, {
        headers,
        params: { email: clienteEmail }
      });

      if (buscaCliente.data.data && buscaCliente.data.data.length > 0) {
        asaasCustomerId = buscaCliente.data.data[0].id;
      } else {
        // Criar novo cliente
        const novoCliente = await axios.post(`${ASAAS_BASE}/customers`, {
          name: clienteNome,
          email: clienteEmail,
          cpfCnpj: cpfCnpj.replace(/\D/g, ""),
          notificationDisabled: false
        }, { headers });
        asaasCustomerId = novoCliente.data.id;
      }

      // 2. Determinar tipo de cobrança
      const billingType = req.body.billingType || "PIX"; // PIX ou CREDIT_CARD
      const parcelas = req.body.parcelas || 1;

      // 3. Criar cobrança
      const paymentData = {
        customer: asaasCustomerId,
        billingType: billingType,
        value: parseFloat(valor),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        description: descricao || "Pedido ATTOS2",
        externalReference: pedidoId,
        postalService: false
      };

      // Se for cartão de crédito, adicionar dados do cartão e parcelamento
      if (billingType === "CREDIT_CARD") {
        paymentData.installmentCount = parcelas;
        paymentData.installmentValue = parseFloat((parseFloat(valor) / parcelas).toFixed(2));

        // Dados do cartão para checkout transparente
        const cardData = req.body.creditCard;
        const holderInfo = req.body.creditCardHolderInfo;

        if (cardData && holderInfo) {
          paymentData.creditCard = {
            holderName: cardData.holderName,
            number: cardData.number.replace(/\s/g, ""),
            expiryMonth: cardData.expiryMonth,
            expiryYear: cardData.expiryYear,
            ccv: cardData.ccv
          };
          paymentData.creditCardHolderInfo = {
            name: holderInfo.name,
            email: holderInfo.email,
            cpfCnpj: holderInfo.cpfCnpj.replace(/\D/g, ""),
            postalCode: holderInfo.postalCode || "",
            addressNumber: holderInfo.addressNumber || "",
            phone: holderInfo.phone || ""
          };
        }
      }

      const cobranca = await axios.post(`${ASAAS_BASE}/payments`, paymentData, { headers });

      const paymentId = cobranca.data.id;

      // 4. Obter QR Code PIX (se for PIX)
      let pixInfo = { encodedImage: "", payload: "" };
      if (billingType === "PIX") {
        try {
          const pix = await axios.get(`${ASAAS_BASE}/payments/${paymentId}/pixQrCode`, { headers });
          pixInfo = {
            encodedImage: pix.data.encodedImage || "",
            payload: pix.data.payload || ""
          };
        } catch (e) {
          logger.warn("QR Code ainda não disponível:", e.message);
        }
      }

      // 5. Atualizar pedido no Firestore com ID do pagamento (se existir)
      const pedidoRef = db.collection("pedidos").doc(pedidoId);
      const pedidoSnap = await pedidoRef.get();
      if (pedidoSnap.exists) {
        await pedidoRef.update({
          pagamentoId: paymentId,
          asaasCustomerId: asaasCustomerId,
          pagamentoData: {
            valor: parseFloat(valor),
            billingType: billingType,
            parcelas: parcelas,
            status: cobranca.data.status,
            invoiceUrl: cobranca.data.invoiceUrl || "",
            pixCopiaECola: pixInfo.payload,
            pixQrCode: pixInfo.encodedImage,
            bankSlipUrl: cobranca.data.bankSlipUrl || ""
          }
        });
        logger.info(`Pedido ${pedidoId} atualizado com pagamento.`);
      } else {
        logger.warn(`Pedido ${pedidoId} não encontrado no Firestore. Pagamento criado no Asaas: ${paymentId}`);
      }

      logger.info(`Cobrança criada: ${paymentId} — R$ ${valor} — ${billingType}`);

      res.json({
        success: true,
        id: paymentId,
        status: cobranca.data.status,
        billingType: billingType,
        invoiceUrl: cobranca.data.invoiceUrl || "",
        bankSlipUrl: cobranca.data.bankSlipUrl || "",
        pixCopiaECola: pixInfo.payload,
        pixQrCode: pixInfo.encodedImage
      });

    } catch (err) {
      logger.error("Erro ao gerar cobrança:", err.response?.data || err.message);

      // Rollback: se a reserva de estoque já tinha acontecido antes do
      // Asaas falhar, devolver o estoque reservado imediatamente.
      if (reservas.length > 0) {
        try {
          for (const r of reservas) {
            const produtoRef = db.collection("produtos").doc(r.produtoId);
            const campoEstoque = "modelos." + r.corte + "." + r.tamanho;
            await produtoRef.update({
              [campoEstoque]: FieldValue.increment(r.quantidade)
            });
          }
          await db.collection("pedidos").doc(pedidoId).update({
            estoqueReservado: false,
            estoqueDevolvido: true,
            reservas: FieldValue.delete()
          });
          logger.info("Rollback de estoque aplicado para pedido " + pedidoId + " após falha no Asaas.");
        } catch (errRollback) {
          logger.error("Falha ao reverter estoque do pedido " + pedidoId + ":", errRollback.message);
        }
      }

      res.status(500).json({
        success: false,
        error: err.response?.data?.errors?.[0]?.description || err.message
      });
    }
  }
);

// ============================================
// ASASS — WEBHOOK (receber confirmação de pagamento)
// ============================================
// POST /api/webhook-asaas
// O Asaas chama essa URL quando o pagamento é confirmado
exports.webhookAsaas = onRequest(
  { secrets: [ASAAS_API_KEY] },
  async (req, res) => {
    // CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");

    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    try {
      const event = req.body;
      logger.info("Webhook Asaas recebido:", JSON.stringify(event));

      const payment = event.payment;
      if (!payment || !payment.externalReference) {
        return res.status(200).json({ received: true }); // Asaas espera 200
      }

      const pedidoId = payment.externalReference;
      const novoStatus = payment.status;

      // Mapear status do Asaas para status do sistema
      const statusMap = {
        "RECEIVED": "pago",
        "CONFIRMED": "pago",
        "OVERDUE": "cancelado",
        "REFUNDED": "cancelado",
        "CANCELLED": "cancelado"
      };

      const statusPedido = statusMap[novoStatus] || "aguardando_pagamento";

      const pedidoDoc = await db.collection("pedidos").doc(pedidoId).get();
      const pedidoData = pedidoDoc.exists ? pedidoDoc.data() : {};

      if (statusPedido === "pago") {
        // Se estoque já foi reservado no gerarCobranca, NÃO decrementar de novo
        if (!pedidoData.estoqueReservado) {
          // Fallback: decrementar estoque (comportamento antigo para pedidos sem reserva)
          const itens = pedidoData.itens || [];
          for (const item of itens) {
            if (item.produtoId && item.tamanho && item.quantidade && item.corte) {
              const prodRef = db.collection("produtos").doc(item.produtoId);
              const campoEstoque = "modelos." + item.corte + "." + item.tamanho;
              await prodRef.update({
                [campoEstoque]: FieldValue.increment(-item.quantidade)
              });
              logger.info("Estoque baixado (fallback): " + item.produtoId + " / " + item.corte + " / " + item.tamanho + " / -" + item.quantidade);
            }
          }
        } else {
          logger.info("Pedido " + pedidoId + " já teve estoque reservado — pulando decremento.");
        }

        await db.collection("pedidos").doc(pedidoId).update({
          status: statusPedido,
          pagamentoConfirmadoEm: FieldValue.serverTimestamp(),
          "pagamentoData.status": novoStatus
        });

        logger.info("Pedido " + pedidoId + " pago!");
      } else if (statusPedido === "cancelado") {
        // DEVOLVER ESTOQUE RESERVADO se o pedido for cancelado
        if (pedidoData.estoqueReservado && !pedidoData.estoqueDevolvido) {
          const reservas = pedidoData.reservas || [];
          for (const r of reservas) {
            const prodRef = db.collection("produtos").doc(r.produtoId);
            const campoEstoque = "modelos." + r.corte + "." + r.tamanho;
            await prodRef.update({
              [campoEstoque]: FieldValue.increment(r.quantidade)
            });
            logger.info("Estoque devolvido: " + r.produtoId + " / " + r.corte + " / " + r.tamanho + " / +" + r.quantidade);
          }
          await db.collection("pedidos").doc(pedidoId).update({
            estoqueDevolvido: true
          });
          logger.info("Pedido " + pedidoId + " cancelado — estoque devolvido.");
        }

        await db.collection("pedidos").doc(pedidoId).update({
          status: statusPedido,
          "pagamentoData.status": novoStatus
        });
      } else {
        await db.collection("pedidos").doc(pedidoId).update({
          status: statusPedido,
          "pagamentoData.status": novoStatus
        });
      }

      res.status(200).json({ received: true });

    } catch (err) {
      logger.error("Erro no webhook Asaas:", err.message);
      res.status(200).json({ received: true }); // Sempre 200 para o Asaas
    }
  }
);

// ============================================
// SEED — Popular banco com produtos de teste
// ============================================
exports.seed = onRequest(
  { secrets: [SEED_KEY] },
  async (req, res) => {
  const key = req.query.key;
  if (key !== SEED_KEY.value()) {
    return res.status(403).send("Chave inválida");
  }

  const produtos = [
    { nome: "Eu Sou do Meu Amado", preco: 79.90, categoria: "masculino", tamanhos: ["P","M","G","GG"], estoque: {P:10,M:5,G:8,GG:3}, versiculo: "Cânticos 2:16", destaque: true, descricao: "'O meu amado é meu, e eu sou dele.'", cores: ["Preto","Branco"] },
    { nome: "Luz do Mundo", preco: 89.90, categoria: "masculino", tamanhos: ["P","M","G","GG"], estoque: {P:8,M:12,G:6,GG:4}, versiculo: "João 8:12", destaque: true, descricao: "'Eu sou a luz do mundo.'", cores: ["Preto","Cinza"] },
    { nome: "Sal da Terra", preco: 69.90, categoria: "masculino", tamanhos: ["P","M","G","GG"], estoque: {P:15,M:10,G:7,GG:5}, versiculo: "Mateus 5:13", destaque: false, descricao: "'Vós sois o sal da terra.'", cores: ["Branco","Azul Marinho"] },
    { nome: "Fiel Até o Fim", preco: 99.90, categoria: "masculino", tamanhos: ["P","M","G","GG"], estoque: {P:6,M:9,G:11,GG:2}, versiculo: "Apocalipse 2:10", destaque: true, descricao: "'Sê fiel até a morte.' Edição especial.", cores: ["Preto","Vinho"] },
    { nome: "Guerreiro da Fé", preco: 84.90, categoria: "masculino", tamanhos: ["P","M","G","GG"], estoque: {P:7,M:8,G:10,GG:4}, versiculo: "Efésios 6:13", destaque: false, descricao: "'Tomai toda a armadura de Deus.'", cores: ["Preto","Branco"] },
    { nome: "Montanhas e Vale", preco: 74.90, categoria: "masculino", tamanhos: ["P","M","G","GG"], estoque: {P:12,M:15,G:9,GG:6}, versiculo: "Salmos 121:1-2", destaque: false, descricao: "'Elevo os meus olhos para os montes.'", cores: ["Azul","Cinza"] },
    { nome: "Amada do Rei", preco: 79.90, categoria: "feminino", tamanhos: ["P","M","G","GG"], estoque: {P:15,M:12,G:8,GG:4}, versiculo: "Salmos 45:11", destaque: true, descricao: "'O Rei se encantou com a tua beleza.'", cores: ["Branco","Rosa Claro"] },
    { nome: "Princesa do Rei", preco: 89.90, categoria: "feminino", tamanhos: ["P","M","G","GG"], estoque: {P:18,M:14,G:6,GG:3}, versiculo: "1 Pedro 3:4", destaque: true, descricao: "'O ornamento interior do coração.'", cores: ["Preto","Lavanda"] },
    { nome: "Cheia de Graça", preco: 69.90, categoria: "feminino", tamanhos: ["P","M","G","GG"], estoque: {P:20,M:16,G:10,GG:5}, versiculo: "Lucas 1:28", destaque: false, descricao: "'Alegra-te, cheia de graça.'", cores: ["Branco","Azul Bebê"] },
    { nome: "Flor de Cristo", preco: 99.90, categoria: "feminino", tamanhos: ["P","M","G","GG"], estoque: {P:10,M:8,G:12,GG:6}, versiculo: "Cantares 2:1", destaque: true, descricao: "'Eu sou a rosa de Sarom.' Premium bordado.", cores: ["Vinho","Rosa"] },
    { nome: "Filha do Altíssimo", preco: 84.90, categoria: "feminino", tamanhos: ["P","M","G","GG"], estoque: {P:12,M:10,G:7,GG:4}, versiculo: "Gálatas 3:26", destaque: false, descricao: "'Todos sois filhos de Deus.'", cores: ["Preto","Dourado"] },
    { nome: "Paz como Rio", preco: 74.90, categoria: "feminino", tamanhos: ["P","M","G","GG"], estoque: {P:14,M:11,G:9,GG:5}, versiculo: "Isaías 66:12", destaque: false, descricao: "'Estenderei a paz como um rio.'", cores: ["Azul Claro","Branco"] },
    { nome: "Pequeno Samuel", preco: 59.90, categoria: "infantil", tamanhos: ["P","M","G","GG"], estoque: {P:20,M:18,G:15,GG:10}, versiculo: "1 Samuel 3", destaque: true, descricao: "'Fala, Senhor, que o teu servo ouve.'", cores: ["Azul","Verde"] },
    { nome: "Pequena Débora", preco: 59.90, categoria: "infantil", tamanhos: ["P","M","G","GG"], estoque: {P:22,M:16,G:12,GG:8}, versiculo: "Juízes 4", destaque: false, descricao: "Coragem desde pequena!", cores: ["Rosa","Lilás"] },
    { nome: "Davinho", preco: 49.90, categoria: "infantil", tamanhos: ["P","M","G","GG"], estoque: {P:25,M:20,G:18,GG:12}, versiculo: "Salmos 23", destaque: true, descricao: "'O Senhor é meu pastor.'", cores: ["Verde","Branco"] },
    { nome: "Ana Clara", preco: 59.90, categoria: "infantil", tamanhos: ["P","M","G","GG"], estoque: {P:18,M:14,G:10,GG:6}, versiculo: "1 Samuel 1", destaque: false, descricao: "'O meu coração se alegra no Senhor.'", cores: ["Rosa","Branco"] },
    { nome: "José do Egito", preco: 54.90, categoria: "infantil", tamanhos: ["P","M","G","GG"], estoque: {P:16,M:12,G:14,GG:8}, versiculo: "Gênesis 39:2", destaque: false, descricao: "'O Senhor estava com José.'", cores: ["Azul","Amarelo"] },
    { nome: "Noé e a Arca", preco: 49.90, categoria: "infantil", tamanhos: ["P","M","G","GG"], estoque: {P:30,M:24,G:20,GG:14}, versiculo: "Gênesis 7", destaque: false, descricao: "Design colorido com animais.", cores: ["Azul","Colorido"] }
  ];

  try {
    let count = 0;
    for (const p of produtos) {
      await db.collection("produtos").add({
        ...p,
        createdAt: FieldValue.serverTimestamp()
      });
      count++;
    }
    logger.info(`Seed concluído: ${count} produtos`);
    res.json({ success: true, message: `${count} produtos adicionados!`, categorias: { masculino: 6, feminino: 6, infantil: 6 } });
  } catch (err) {
    logger.error("Erro no seed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// MELHOR ENVIO — CALCULAR FRETE
// ============================================
// POST /api/calcular-frete
// Body: { cepDestino, itens: [{ peso, altura, largura, comprimento, quantidade }] }
// Retorna: [{ servico, nome, prazo, valor }]
exports.calcularFrete = onRequest(
  { secrets: [MELHOR_ENVIO_TOKEN] },
  async (req, res) => {
    // CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");

    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    try {
      const { cepDestino, itens } = req.body;

      if (!cepDestino || !itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ error: "Campos obrigatórios: cepDestino, itens" });
      }

      const token = MELHOR_ENVIO_TOKEN.value();
      const ME_BASE = "https://melhorenvio.com.br";

      // Montar payload para a API do Melhor Envio (v2 - endpoint de produção)
      const payload = {
        from: { postal_code: "83458890" }, // CEP de origem (Bocaiuva do Sul-PR)

        to: { postal_code: cepDestino.replace(/\D/g, "") },
        products: itens.map(item => ({
          id: item.id || "produto",
          height: item.altura || 2,
          width: item.largura || 20,
          length: item.comprimento || 30,
          weight: item.peso || 0.2,
          insurance_value: item.valor || 0,
          quantity: item.quantidade || 1
        })),
        options: {
          receipt: false,
          own_hand: false
        },
        services: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50"
      };

      logger.info("Calculando frete Melhor Envio:", JSON.stringify({ cepDestino, qtdItens: itens.length }));

      const response = await axios.post(`${ME_BASE}/api/v2/me/shipment/calculate`, payload, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "User-Agent": "ATTOS2 (contato@attos2.com.br)"
        }
      });

      const fretes = response.data;

      // Filtrar e formatar resultados — apenas PAC e SEDEX (Correios)
      const servicosPermitidos = ["1", "2"]; // 1=PAC, 2=SEDEX
      const resultados = fretes
        .filter(f => !f.error && servicosPermitidos.includes(String(f.id)))
        .map(f => ({
          servico: String(f.id || ""),
          nome: f.name || "Transportadora",
          prazo: f.custom_delivery_time || f.delivery_time || 0,
          prazoMin: f.custom_delivery_range?.min || f.delivery_range?.min || 0,
          prazoMax: f.custom_delivery_range?.max || f.delivery_range?.max || 0,
          valor: parseFloat(f.custom_price || f.price || 0),
          empresa: f.company?.name || ""
        }))
        .filter(f => f.valor > 0)
        .sort((a, b) => a.valor - b.valor); // Mais barato primeiro


      logger.info(`Frete calculado: ${resultados.length} opções (PAC/SEDEX)`);

      res.json({
        success: true,
        fretes: resultados
      });

    } catch (err) {
      logger.error("Erro ao calcular frete Melhor Envio:", err.response?.data || err.message);
      res.status(500).json({
        success: false,
        error: "Erro ao calcular frete. Tente novamente.",
        fretes: []
      });
    }
  }
);

// ============================================
// RESEND — ENVIAR EMAIL (função auxiliar)
// ============================================
async function enviarEmail({ para, assunto, html }) {
  const apiKey = RESEND_API_KEY.value();
  if (!apiKey) {
    logger.warn("RESEND_API_KEY não configurada. Email não enviado.");
    return null;
  }

  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "ATTOS2 <onboarding@resend.dev>",
        to: para,
        subject: assunto,
        html: html
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );
    logger.info(`Email enviado para ${para}: ${assunto} (ID: ${response.data?.id})`);
    return response.data;
  } catch (err) {
    logger.error("Erro ao enviar email via Resend:", err.response?.data || err.message);
    return null;
  }
}

// ============================================
// EMAIL — BOAS-VINDAS (disparado ao criar cliente)
// ============================================
// Trigger: onCreate /clientes/{clienteId}
exports.onNewCliente = onDocumentCreated(
  { document: "clientes/{clienteId}", secrets: [RESEND_API_KEY] },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const cliente = snap.data();
    const email = cliente.email || snap.id;

    if (!email) {
      logger.warn("Cliente sem email, pulando boas-vindas.");
      return;
    }

    const nome = cliente.nome || "Cliente";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#050505;color:#fff;padding:40px 32px;border-radius:12px">
        <div style="text-align:center;margin-bottom:32px">
          <img src="https://attos2-c2644.web.app/logo2.png" alt="ATTOS2" style="height:48px;opacity:0.9">
        </div>
        <h1 style="color:#D4AF37;font-size:1.4rem;letter-spacing:2px;font-weight:400;text-align:center;margin-bottom:8px">
          Bem-vindo à <em style="font-style:italic">ATTOS2</em>!
        </h1>
        <p style="color:rgba(255,255,255,0.7);font-size:0.9rem;line-height:1.6;text-align:center;margin-bottom:24px">
          Olá <strong style="color:#fff">${nome}</strong>,<br><br>
          É com muita alegria que recebemos você em nossa loja.<br>
          Aqui cada peça é mais que uma roupa — é uma declaração de fé.
        </p>
        <div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.2);border-radius:10px;padding:20px;margin-bottom:24px;text-align:center">
          <p style="font-size:0.8rem;color:rgba(255,255,255,0.6);margin-bottom:8px;font-style:italic">
            "E todos foram cheios do Espírito Santo"
          </p>
          <p style="font-size:0.65rem;color:var(--gold);letter-spacing:2px">ATOS 2:4</p>
        </div>
        <div style="text-align:center">
          <a href="https://attos2-c2644.web.app/pages/produtos.html" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#D4AF37,#FFD700);border-radius:10px;color:#050505;font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;text-decoration:none">
            Conhecer a Loja
          </a>
        </div>
        <p style="color:rgba(255,255,255,0.3);font-size:0.6rem;text-align:center;margin-top:32px;letter-spacing:1px">
          ATTOS² — Vestindo a Chama do Espírito
        </p>
      </div>
    `;

    await enviarEmail({
      para: email,
      assunto: "Bem-vindo à ATTOS2! 🙏",
      html
    });
  }
);

// ============================================
// EMAIL — NOTIFICAÇÃO DE PEDIDO (disparado ao atualizar pedido)
// ============================================
// Trigger: onUpdate /pedidos/{pedidoId}
exports.onPedidoAtualizado = onDocumentUpdated(
  { document: "pedidos/{pedidoId}", secrets: [RESEND_API_KEY] },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (!before || !after) return;

    const statusAntes = before.status;
    const statusDepois = after.status;

    // Só enviar email se o status mudou
    if (statusAntes === statusDepois) return;

    const email = after.clienteEmail;
    const nome = after.clienteNome || "Cliente";
    const pedidoId = event.params.pedidoId;
    const total = after.total || 0;
    const freteInfo = after.freteInfo || {};
    const codigoRastreio = after.codigoRastreio || "";

    if (!email) {
      logger.warn(`Pedido ${pedidoId} sem email do cliente, pulando notificação.`);
      return;
    }

    let assunto, html;

    if (statusDepois === "pago") {
      assunto = `Pedido #${pedidoId.substring(0, 8)} confirmado! ✅`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#050505;color:#fff;padding:40px 32px;border-radius:12px">
          <div style="text-align:center;margin-bottom:32px">
            <img src="https://attos2-c2644.web.app/logo2.png" alt="ATTOS2" style="height:48px;opacity:0.9">
          </div>
          <h1 style="color:#4CAF50;font-size:1.4rem;letter-spacing:2px;font-weight:400;text-align:center;margin-bottom:8px">
            Pagamento Confirmado! 🎉
          </h1>
          <p style="color:rgba(255,255,255,0.7);font-size:0.9rem;line-height:1.6;text-align:center;margin-bottom:24px">
            Olá <strong style="color:#fff">${nome}</strong>,<br><br>
            O pagamento do seu pedido <strong>#${pedidoId.substring(0, 8)}</strong> foi confirmado com sucesso!
          </p>
          <div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.2);border-radius:10px;padding:20px;margin-bottom:24px">
            <p style="font-size:0.8rem;color:rgba(255,255,255,0.6);margin-bottom:4px">Total pago: <strong style="color:#D4AF37;font-size:1rem">R$ ${total.toFixed(2).replace('.',',')}</strong></p>
            ${freteInfo.servico ? `<p style="font-size:0.75rem;color:rgba(255,255,255,0.5)">Frete: ${freteInfo.servico} • ${freteInfo.prazo || ''}</p>` : ''}
          </div>
          <div style="text-align:center">
            <a href="https://attos2-c2644.web.app/pages/pedidos.html" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#D4AF37,#FFD700);border-radius:10px;color:#050505;font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;text-decoration:none">
              Acompanhar Pedido
            </a>
          </div>
          <p style="color:rgba(255,255,255,0.3);font-size:0.6rem;text-align:center;margin-top:32px;letter-spacing:1px">
            ATTOS² — Vestindo a Chama do Espírito
          </p>
        </div>
      `;
    } else if (statusDepois === "enviado") {
      assunto = `Pedido #${pedidoId.substring(0, 8)} enviado! 📦`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#050505;color:#fff;padding:40px 32px;border-radius:12px">
          <div style="text-align:center;margin-bottom:32px">
            <img src="https://attos2-c2644.web.app/logo2.png" alt="ATTOS2" style="height:48px;opacity:0.9">
          </div>
          <h1 style="color:#2196F3;font-size:1.4rem;letter-spacing:2px;font-weight:400;text-align:center;margin-bottom:8px">
            Pedido Enviado! 🚚
          </h1>
          <p style="color:rgba(255,255,255,0.7);font-size:0.9rem;line-height:1.6;text-align:center;margin-bottom:24px">
            Olá <strong style="color:#fff">${nome}</strong>,<br><br>
            Seu pedido <strong>#${pedidoId.substring(0, 8)}</strong> foi enviado!
          </p>
          ${codigoRastreio ? `
          <div style="background:rgba(33,150,243,0.06);border:1px solid rgba(33,150,243,0.2);border-radius:10px;padding:20px;margin-bottom:24px;text-align:center">
            <p style="font-size:0.7rem;color:rgba(255,255,255,0.5);letter-spacing:1px;margin-bottom:4px">CÓDIGO DE RASTREIO</p>
            <p style="font-size:1.1rem;color:#2196F3;font-weight:700;letter-spacing:2px">${codigoRastreio}</p>
          </div>
          ` : ''}
          <div style="text-align:center">
            <a href="https://attos2-c2644.web.app/pages/pedidos.html" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#D4AF37,#FFD700);border-radius:10px;color:#050505;font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;text-decoration:none">
              Rastrear Pedido
            </a>
          </div>
          <p style="color:rgba(255,255,255,0.3);font-size:0.6rem;text-align:center;margin-top:32px;letter-spacing:1px">
            ATTOS² — Vestindo a Chama do Espírito
          </p>
        </div>
      `;
    } else if (statusDepois === "cancelado") {
      assunto = `Pedido #${pedidoId.substring(0, 8)} cancelado`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#050505;color:#fff;padding:40px 32px;border-radius:12px">
          <div style="text-align:center;margin-bottom:32px">
            <img src="https://attos2-c2644.web.app/logo2.png" alt="ATTOS2" style="height:48px;opacity:0.9">
          </div>
          <h1 style="color:#f44336;font-size:1.4rem;letter-spacing:2px;font-weight:400;text-align:center;margin-bottom:8px">
            Pedido Cancelado
          </h1>
          <p style="color:rgba(255,255,255,0.7);font-size:0.9rem;line-height:1.6;text-align:center;margin-bottom:24px">
            Olá <strong style="color:#fff">${nome}</strong>,<br><br>
            O pedido <strong>#${pedidoId.substring(0, 8)}</strong> foi cancelado.<br>
            Se houver cobrança, o valor será estornado conforme a política da loja.
          </p>
          <div style="text-align:center">
            <a href="https://attos2-c2644.web.app/pages/produtos.html" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#D4AF37,#FFD700);border-radius:10px;color:#050505;font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;font-weight:700;text-decoration:none">
              Continuar Comprando
            </a>
          </div>
          <p style="color:rgba(255,255,255,0.3);font-size:0.6rem;text-align:center;margin-top:32px;letter-spacing:1px">
            ATTOS² — Vestindo a Chama do Espírito
          </p>
        </div>
      `;
    } else {
      return; // Não enviar email para outros status
    }

    await enviarEmail({ para: email, assunto, html });
  }
);

// ============================================
// MELHOR ENVIO — GERAR ETIQUETA
// ============================================
// POST /api/gerar-etiqueta
// Body: { pedidoId }
// Retorna: { success, tracking, urlEtiqueta, urlRastreamento }
exports.gerarEtiqueta = onRequest(
  { secrets: [MELHOR_ENVIO_TOKEN] },
  async (req, res) => {
    // CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");

    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

    try {
      const { pedidoId } = req.body;

      if (!pedidoId) {
        return res.status(400).json({ error: "Campo obrigatório: pedidoId" });
      }

      // Buscar dados do pedido
      const pedidoDoc = await db.collection("pedidos").doc(pedidoId).get();
      if (!pedidoDoc.exists) {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }

      const pedido = pedidoDoc.data();

      // Validar se o pedido está pago
      if (pedido.status !== "pago") {
        return res.status(400).json({ error: "Pedido precisa estar pago para gerar etiqueta" });
      }

      // Validar se já não tem etiqueta gerada
      if (pedido.codigoRastreio) {
        return res.status(400).json({ error: "Etiqueta já foi gerada para este pedido", codigoRastreio: pedido.codigoRastreio });
      }

      const token = MELHOR_ENVIO_TOKEN.value();
      const ME_BASE = "https://melhorenvio.com.br";

      // Dados do remetente (ATTOS2)
      const remetente = {
        name: "Cleverson Hoffmann",
        phone: "41999999999",
        email: "contato@attos2.com.br",
        document: "00000000000", // CPF do remetente
        company_document: "", // CNPJ se tiver
        state_register: "",
        address: "Rua Exemplo",
        complement: "",
        number: "100",
        district: "Centro",
        city: "Bocaiuva do Sul",
        state_abbr: "PR",
        country_id: "BRA",
        postal_code: "83458890",
        note: "ATTOS2"
      };

      // Dados do destinatário (cliente)
      const endereco = pedido.enderecoEntrega || {};
      const destinatario = {
        name: pedido.clienteNome || "Cliente",
        phone: (pedido.clienteTelefone || "").replace(/\D/g, ""),
        email: pedido.clienteEmail || "",
        document: (pedido.cpfCnpj || "").replace(/\D/g, ""),
        company_document: "",
        state_register: "",
        address: (endereco.logradouro || "").split(",")[0].trim(),
        complement: endereco.complemento || "",
        number: (endereco.logradouro || "").includes(",") ? (endereco.logradouro || "").split(",").pop().trim() : "s/n",
        district: endereco.bairro || "",
        city: endereco.cidade || "",
        state_abbr: endereco.estado || "",
        country_id: "BRA",
        postal_code: (endereco.cep || "").replace(/\D/g, ""),
        note: `Pedido #${pedidoId.substring(0, 8)}`
      };

      // Montar volumes (itens do pedido)
      const volumes = (pedido.itens || []).map(item => ({
        height: 2,
        width: 20,
        length: 30,
        weight: 0.2,
        insurance_value: item.preco || 0,
        quantity: item.quantidade || 1
      }));

      // Determinar serviço (PAC = 1, SEDEX = 2)
      const servicoId = pedido.freteInfo?.servico === "SEDEX" ? "2" : "1";

      logger.info(`Gerando etiqueta para pedido ${pedidoId}:`, JSON.stringify({
        servico: servicoId,
        destinatario: destinatario.name,
        cidade: `${destinatario.city}/${destinatario.state_abbr}`,
        volumes: volumes.length
      }));

      // PASSO 1: Comprar etiqueta (checkout)
      const checkoutPayload = {
        service: parseInt(servicoId),
        from: remetente,
        to: destinatario,
        products: volumes,
        volumes: volumes.map((v, i) => ({
          height: v.height,
          width: v.width,
          length: v.length,
          weight: v.weight,
          insurance_value: v.insurance_value,
          quantity: v.quantity
        })),
        options: {
          insurance_value: pedido.total || 0,
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: true,
          invoice: {
            key: ""
          }
        }
      };

      const checkoutResponse = await axios.post(
        `${ME_BASE}/api/v2/me/shipment/checkout`,
        checkoutPayload,
        {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "User-Agent": "ATTOS2 (contato@attos2.com.br)"
          }
        }
      );

      const checkoutData = checkoutResponse.data;

      // Verificar se a compra foi bem-sucedida
      if (!checkoutData.purchase || !checkoutData.purchase.id) {
        logger.error("Erro ao comprar etiqueta:", JSON.stringify(checkoutData));
        return res.status(500).json({
          success: false,
          error: "Erro ao gerar etiqueta no Melhor Envio",
          detalhes: checkoutData
        });
      }

      const purchaseId = checkoutData.purchase.id;
      const tracking = checkoutData.purchase.tracking || checkoutData.purchase.protocol || "";
      const pedidoMelhorEnvio = checkoutData.purchase.pedido || checkoutData.purchase.order || "";

      logger.info(`Etiqueta comprada! PurchaseID: ${purchaseId}, Tracking: ${tracking}`);

      // PASSO 2: Gerar PDF da etiqueta
      let urlEtiqueta = "";
      try {
        const printResponse = await axios.post(
          `${ME_BASE}/api/v2/me/shipment/print`,
          {
            orders: [purchaseId.toString()],
            mode: "private"
          },
          {
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              "User-Agent": "ATTOS2 (contato@attos2.com.br)"
            }
          }
        );

        const printData = printResponse.data;
        if (printData.url) {
          urlEtiqueta = printData.url;
        }
        logger.info(`PDF da etiqueta gerado: ${urlEtiqueta}`);
      } catch (printErr) {
        logger.warn("Erro ao gerar PDF da etiqueta (pode gerar manualmente):", printErr.message);
      }

      // PASSO 3: Atualizar pedido com código de rastreio
      const urlRastreio = tracking
        ? `https://rastreamento.correios.com.br/app/index.php?objeto=${tracking}`
        : "";

      await db.collection("pedidos").doc(pedidoId).update({
        codigoRastreio: tracking,
        status: "enviado",
        "freteInfo.tracking": tracking,
        "freteInfo.urlEtiqueta": urlEtiqueta,
        "freteInfo.purchaseId": purchaseId,
        "freteInfo.pedidoMelhorEnvio": pedidoMelhorEnvio,
        enviadoEm: FieldValue.serverTimestamp()
      });

      logger.info(`Pedido ${pedidoId} atualizado: status=enviado, tracking=${tracking}`);

      res.json({
        success: true,
        tracking: tracking,
        urlEtiqueta: urlEtiqueta,
        urlRastreamento: urlRastreio,
        purchaseId: purchaseId
      });

    } catch (err) {
      logger.error("Erro ao gerar etiqueta Melhor Envio:", err.response?.data || err.message);
      res.status(500).json({
        success: false,
        error: "Erro ao gerar etiqueta. Tente novamente.",
        detalhes: err.response?.data || err.message
      });
    }
  }
);

// ============================================
// TAREFA 5: EXPIRAR PEDIDOS NÃO PAGOS (função agendada)
// ============================================
// Roda a cada hora e expira pedidos com +24h sem pagamento.
// Devolve o estoque reservado (idempotente via estoqueDevolvido).
exports.expirarPedidosNaoPagos = onSchedule(
  { schedule: "every 1 hours", region: "southamerica-east1" },
  async (event) => {
    const agora = Timestamp.now();
    const limite = new Date(agora.toDate().getTime() - 24 * 60 * 60 * 1000);
    const limiteTs = Timestamp.fromDate(limite);

    try {
      const snapshot = await db.collection("pedidos")
        .where("status", "==", "aguardando_pagamento")
        .where("createdAt", "<=", limiteTs)
        .get();

      if (snapshot.empty) {
        logger.info("Nenhum pedido para expirar.");
        return;
      }

      let expirados = 0;
      for (const doc of snapshot.docs) {
        const pedido = doc.data();

        // Idempotência: só processa se estoqueReservado=true e estoqueDevolvido=false
        if (pedido.estoqueReservado && !pedido.estoqueDevolvido) {
          const reservas = pedido.reservas || [];
          for (const r of reservas) {
            const prodRef = db.collection("produtos").doc(r.produtoId);
            const campoEstoque = "modelos." + r.corte + "." + r.tamanho;
            await prodRef.update({
              [campoEstoque]: FieldValue.increment(r.quantidade)
            });
            logger.info("Expiracao: estoque devolvido " + r.produtoId + " / " + r.corte + " / " + r.tamanho + " / +" + r.quantidade);
          }
          await doc.ref.update({
            estoqueDevolvido: true
          });
        }

        // Marcar como expirado
        await doc.ref.update({
          status: "expirado",
          expiradoEm: FieldValue.serverTimestamp()
        });

        logger.info("Pedido " + doc.id + " expirado.");
        expirados++;
      }

      logger.info("Expiração concluída: " + expirados + " pedidos expirados.");
    } catch (err) {
      logger.error("Erro ao expirar pedidos:", err.message);
    }
  }
);


