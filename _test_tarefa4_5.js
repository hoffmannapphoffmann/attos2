// ============================================
// TESTE TAREFAS 4 e 5 — Reserva transacional + webhook
// Roda com: node _test_tarefa4_5.js
// Emulador precisa estar rodando: firebase emulators:start --only functions,firestore
// ============================================

const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const assert = require('assert');

// Conectar ao emulador
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

// Função auxiliar: chamar gerarCobranca local
async function chamarGerarCobranca(pedidoId, clienteNome, clienteEmail, valor) {
  const url = 'http://127.0.0.1:5001/attos2-c2644/southamerica-east1/gerarCobranca';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pedidoId, clienteNome, clienteEmail,
      cpfCnpj: '12345678900', valor, descricao: 'Teste emulador'
    })
  });
  return await res.json();
}

// ============================================
// PREPARAÇÃO
// ============================================
async function preparar() {
  await db.collection('produtos').doc('teste1').set({
    nome: 'Produto Teste', preco: 50, categoria: 'masculino',
    versiculo: 'Teste 1:1',
    modelos: { 'Tradicional': { 'M': 3, 'G': 5 }, 'Slim Fit': { 'M': 1, 'G': 2 } },
    createdAt: FieldValue.serverTimestamp()
  });
  console.log('Produto teste1 criado: Tradicional/M=3, Slim Fit/M=1');

  await db.collection('produtos').doc('teste2').set({
    nome: 'Produto Simultaneo', preco: 100, categoria: 'feminino',
    versiculo: 'Teste 2:1',
    modelos: { 'Tradicional': { 'M': 1 } },
    createdAt: FieldValue.serverTimestamp()
  });
  console.log('Produto teste2 criado: Tradicional/M=1 (corrida)');
}

// ============================================
// TESTE 1: Reserva de estoque
// ============================================
async function testeReservaEstoque() {
  console.log('\n--- Teste 1: Reserva de estoque ---');

  await db.collection('pedidos').doc('pedido-teste-1').set({
    clienteId: 'user1', clienteNome: 'Teste', clienteEmail: 'teste@test.com',
    status: 'aguardando_pagamento', total: 150, subtotal: 150, frete: 0,
    itens: [
      { produtoId: 'teste1', nome: 'Produto Teste', quantidade: 2, preco: 50, tamanho: 'M', corte: 'Tradicional' },
      { produtoId: 'teste1', nome: 'Produto Teste', quantidade: 1, preco: 50, tamanho: 'M', corte: 'Slim Fit' }
    ],
    createdAt: FieldValue.serverTimestamp()
  });
  console.log('Pedido criado: 2x Tradicional/M + 1x Slim Fit/M');

  const result = await chamarGerarCobranca('pedido-teste-1', 'Teste', 'teste@test.com', 150);
  console.log('Resposta gerarCobranca:', JSON.stringify(result));

  // Nota: result.success pode ser false porque Asaas API não está disponível no emulador.
  // O que importa é que o estoque foi reservado (transação ocorreu antes da API).
  console.log('  Resposta da function: success=' + result.success + ' error=' + (result.error || ''));

  const prod = await db.collection('produtos').doc('teste1').get();
  const m = prod.data().modelos;

  caso('Tradicional/M: 3 → 1', () => assert.strictEqual(m['Tradicional']['M'], 1));
  caso('Slim Fit/M: 1 → 0', () => assert.strictEqual(m['Slim Fit']['M'], 0));
  caso('Tradicional/G: permanece 5', () => assert.strictEqual(m['Tradicional']['G'], 5));

  const pedido = await db.collection('pedidos').doc('pedido-teste-1').get();
  caso('estoqueReservado=true', () => assert.strictEqual(pedido.data().estoqueReservado, true));
  caso('reservas contem 2 itens', () => assert.strictEqual((pedido.data().reservas || []).length, 2));
}

// ============================================
// TESTE 2: Corrida simultânea (estoque=1)
// ============================================
async function testeCorridaSimultanea() {
  console.log('\n--- Teste 2: Corrida simultanea (estoque=1) ---');

  await db.collection('pedidos').doc('pedido-a').set({
    clienteId: 'userA', clienteNome: 'A', clienteEmail: 'a@test.com',
    status: 'aguardando_pagamento', total: 100, subtotal: 100, frete: 0,
    itens: [{ produtoId: 'teste2', nome: 'P', quantidade: 1, preco: 100, tamanho: 'M', corte: 'Tradicional' }],
    createdAt: FieldValue.serverTimestamp()
  });
  await db.collection('pedidos').doc('pedido-b').set({
    clienteId: 'userB', clienteNome: 'B', clienteEmail: 'b@test.com',
    status: 'aguardando_pagamento', total: 100, subtotal: 100, frete: 0,
    itens: [{ produtoId: 'teste2', nome: 'P', quantidade: 1, preco: 100, tamanho: 'M', corte: 'Tradicional' }],
    createdAt: FieldValue.serverTimestamp()
  });
  console.log('2 pedidos competindo por estoque=1');

  const [resA, resB] = await Promise.all([
    chamarGerarCobranca('pedido-a', 'A', 'a@test.com', 100),
    chamarGerarCobranca('pedido-b', 'B', 'b@test.com', 100)
  ]);

  console.log('pedido-a:', JSON.stringify(resA));
  console.log('pedido-b:', JSON.stringify(resB));

  var aOk = resA.success === true, bOk = resB.success === true;
  console.log('  A: success=' + aOk + ' B: success=' + bOk);

  var prod = await db.collection('produtos').doc('teste2').get();
  caso('estoque final = 0', function() { assert.strictEqual(prod.data().modelos['Tradicional']['M'], 0); });

  // Verificar qual pedido realmente reservou o estoque (independente da resposta da API Asaas)
  var docA = await db.collection('pedidos').doc('pedido-a').get();
  var docB = await db.collection('pedidos').doc('pedido-b').get();
  var aReservou = docA.data().estoqueReservado === true;
  var bReservou = docB.data().estoqueReservado === true;
  console.log('  A estoqueReservado=' + aReservou + ' B estoqueReservado=' + bReservou);

  caso('exatamente 1 pedido reservou o estoque', function() {
    assert.strictEqual(aReservou !== bReservou, true, 'A=' + aReservou + ' B=' + bReservou);
  });
}

// ============================================
// TESTE 3: Webhook CANCELLED
// ============================================
async function testeWebhookCancelado() {
  console.log('\n--- Teste 3: Webhook CANCELLED ---');

  await db.collection('produtos').doc('teste1').update({
    'modelos.Tradicional.M': 5, 'modelos.Slim Fit.M': 3
  });
  console.log('Estoque resetado: T/M=5, S/M=3');

  await db.collection('pedidos').doc('pedido-cancel').set({
    clienteId: 'u1', clienteNome: 'C', clienteEmail: 'c@test.com',
    status: 'aguardando_pagamento', total: 100, subtotal: 100, frete: 0,
    estoqueReservado: true, estoqueDevolvido: false,
    reservas: [
      { produtoId: 'teste1', corte: 'Tradicional', tamanho: 'M', quantidade: 2 },
      { produtoId: 'teste1', corte: 'Slim Fit', tamanho: 'M', quantidade: 1 }
    ],
    itens: [
      { produtoId: 'teste1', nome: 'T', quantidade: 2, preco: 50, tamanho: 'M', corte: 'Tradicional' },
      { produtoId: 'teste1', nome: 'T', quantidade: 1, preco: 50, tamanho: 'M', corte: 'Slim Fit' }
    ],
    createdAt: FieldValue.serverTimestamp(), pagamentoData: { status: 'PENDING' }
  });

  await db.collection('produtos').doc('teste1').update({
    'modelos.Tradicional.M': FieldValue.increment(-2),
    'modelos.Slim Fit.M': FieldValue.increment(-1)
  });
  console.log('Estoque simulado: T/M=3, S/M=2 (apos reserva)');

  const url = 'http://127.0.0.1:5001/attos2-c2644/southamerica-east1/webhookAsaas';
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'PAYMENT_CANCELLED',
      payment: { id: 'pay_c', externalReference: 'pedido-cancel', status: 'CANCELLED', value: 100 }
    })
  });
  console.log('Webhook CANCELLED:', res.status, await res.text());

  const prod = await db.collection('produtos').doc('teste1').get();
  const m = prod.data().modelos;

  caso('T/M devolvido: 3→5', () => assert.strictEqual(m['Tradicional']['M'], 5));
  caso('S/M devolvido: 2→3', () => assert.strictEqual(m['Slim Fit']['M'], 3));

  const pedido = await db.collection('pedidos').doc('pedido-cancel').get();
  caso('estoqueDevolvido=true', () => assert.strictEqual(pedido.data().estoqueDevolvido, true));
}

// ============================================
// TESTE 4: Idempotência CANCELLED
// ============================================
async function testeWebhookIdempotente() {
  console.log('\n--- Teste 4: Idempotencia CANCELLED ---');

  const url = 'http://127.0.0.1:5001/attos2-c2644/southamerica-east1/webhookAsaas';
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'PAYMENT_CANCELLED',
      payment: { id: 'pay_c', externalReference: 'pedido-cancel', status: 'CANCELLED', value: 100 }
    })
  });
  console.log('2o webhook CANCELLED:', res.status, await res.text());

  const prod = await db.collection('produtos').doc('teste1').get();
  const m = prod.data().modelos;

  caso('idempotencia: T/M continua 5 (nao 7)', () => assert.strictEqual(m['Tradicional']['M'], 5));
  caso('idempotencia: S/M continua 3 (nao 4)', () => assert.strictEqual(m['Slim Fit']['M'], 3));
}

// ============================================
// EXECUTAR
// ============================================
async function main() {
  try {
    await preparar();
    await testeReservaEstoque();
    await testeCorridaSimultanea();
    await testeWebhookCancelado();
    await testeWebhookIdempotente();
    console.log('\n✔ todos os testes passaram (' + totalTestes + ' casos)');
  } catch (err) {
    console.error('\n✘ Erro:', err.message);
    process.exit(1);
  } finally {
    await deleteApp(app);
  }
}

main();