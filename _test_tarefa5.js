// ============================================
// TESTE TAREFA 5 — Expiração de pedidos não pagos
// Roda com: node _test_tarefa5.js
// Emulador precisa estar rodando: firebase emulators:start --only functions,firestore,pubsub
// ============================================

const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const assert = require('assert');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.GCLOUD_PROJECT = 'attos2-c2644';

const app = initializeApp({ projectId: 'attos2-c2644' });
const db = getFirestore(app);

let totalTestes = 0;
function caso(nome, fn) {
  totalTestes++;
  try {
    fn();
    console.log('  ✔ ' + nome);
  } catch (err) {
    console.error('  ✘ ' + nome + ': ' + err.message);
    process.exitCode = 1;
    throw err;
  }
}

// ============================================
// TESTE: Expiração de pedido não pago
// ============================================
async function main() {
  try {
    console.log('--- Teste 5: Expirar pedidos não pagos ---\n');

    // 1. Criar produto de teste
    await db.collection('produtos').doc('teste5').set({
      nome: 'Teste Expiracao', preco: 50, categoria: 'masculino',
      versiculo: 'Teste 5:1',
      modelos: { 'Tradicional': { 'M': 10 } },
      createdAt: FieldValue.serverTimestamp()
    });
    console.log('Produto teste5 criado: Tradicional/M=10');

    // 2. Decrementar estoque (simular reserva já feita)
    await db.collection('produtos').doc('teste5').update({
      'modelos.Tradicional.M': FieldValue.increment(-3)
    });
    console.log('Estoque decrementado para 7 (simulando reserva de 3)');

    // 3. Criar pedido com createdAt > 24h atrás
    const dataAntiga = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 horas atrás
    await db.collection('pedidos').doc('pedido-expirado-1').set({
      clienteId: 'u1', clienteNome: 'C', clienteEmail: 'c@test.com',
      status: 'aguardando_pagamento', total: 150, subtotal: 150, frete: 0,
      estoqueReservado: true, estoqueDevolvido: false,
      reservas: [
        { produtoId: 'teste5', corte: 'Tradicional', tamanho: 'M', quantidade: 3 }
      ],
      itens: [
        { produtoId: 'teste5', nome: 'Teste', quantidade: 3, preco: 50, tamanho: 'M', corte: 'Tradicional' }
      ],
      createdAt: Timestamp.fromDate(dataAntiga),
      pagamentoData: { status: 'PENDING' }
    });
    console.log('Pedido pedido-expirado-1 criado com createdAt=' + dataAntiga.toISOString() + ' (25h atrás)');

    // 4. Invocar a função de expiração (endpoint pubsub do emulador)
    const url = 'http://127.0.0.1:5001/attos2-c2644/southamerica-east1/expirarPedidosNaoPagos-0';
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    var body = await res.text();
    console.log('Invoke expirarPedidosNaoPagos: ' + res.status + ' ' + body);

    // 5. Verificar estoque devolvido
    var prod = await db.collection('produtos').doc('teste5').get();
    var m = prod.data().modelos;

    caso('estoque devolvido: 7→10 (+3)', function() {
      assert.strictEqual(m['Tradicional']['M'], 10);
    });

    // 6. Verificar status do pedido
    var pedido = await db.collection('pedidos').doc('pedido-expirado-1').get();
    caso('pedido status=expirado', function() {
      assert.strictEqual(pedido.data().status, 'expirado');
    });
    caso('estoqueDevolvido=true', function() {
      assert.strictEqual(pedido.data().estoqueDevolvido, true);
    });

    // 7. Criar pedido com status "pago" e createdAt antigo (NÃO deve ser expirado)
    console.log('\n--- Teste: pedido pago não deve ser tocado ---');
    const dataAntiga2 = new Date(Date.now() - 30 * 60 * 60 * 1000); // 30 horas atrás
    await db.collection('pedidos').doc('pedido-pago-antigo').set({
      clienteId: 'u2', clienteNome: 'Pago', clienteEmail: 'pago@test.com',
      status: 'pago', total: 200, subtotal: 200, frete: 0,
      estoqueReservado: true, estoqueDevolvido: false,
      reservas: [
        { produtoId: 'teste5', corte: 'Tradicional', tamanho: 'M', quantidade: 2 }
      ],
      itens: [
        { produtoId: 'teste5', nome: 'Teste Pago', quantidade: 2, preco: 100, tamanho: 'M', corte: 'Tradicional' }
      ],
      createdAt: Timestamp.fromDate(dataAntiga2),
      pagamentoData: { status: 'CONFIRMED' }
    });
    console.log('Pedido pedido-pago-antigo criado: status=pago, 30h atrás');

    var resPago = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log('Invoke (pedido pago): ' + resPago.status + ' ' + await resPago.text());

    var prodPago = await db.collection('produtos').doc('teste5').get();
    caso('pedido pago não mexe no estoque (continua 10)', function() {
      assert.strictEqual(prodPago.data().modelos['Tradicional']['M'], 10);
    });

    var pedidoPago = await db.collection('pedidos').doc('pedido-pago-antigo').get();
    caso('pedido pago continua com status=pago', function() {
      assert.strictEqual(pedidoPago.data().status, 'pago');
    });
    caso('pedido pago continua com estoqueDevolvido=false', function() {
      assert.strictEqual(pedidoPago.data().estoqueDevolvido, false);
    });

    // 8. Idempotência: invocar de novo e confirmar que estoque não duplica
    console.log('\n--- Teste idempotência ---');
    await db.collection('produtos').doc('teste5').update({
      'modelos.Tradicional.M': 10
    });
    console.log('Estoque resetado para 10');

    var res2 = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log('2o invoke: ' + res2.status + ' ' + await res2.text());

    var prod2 = await db.collection('produtos').doc('teste5').get();
    caso('idempotencia: estoque continua 10 (nao 13)', function() {
      assert.strictEqual(prod2.data().modelos['Tradicional']['M'], 10);
    });

    console.log('\n✔ todos os testes passaram (' + totalTestes + ' casos)');
  } catch (err) {
    console.error('\n✘ Erro:', err.message);
    process.exit(1);
  } finally {
    await deleteApp(app);
  }
}

main();