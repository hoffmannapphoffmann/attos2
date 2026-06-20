// ============================================
// TESTE — js/carrinho.js
// Roda com: node js/carrinho.test.js
// Sai com exit code != 0 se qualquer assert falhar.
// ============================================
const assert = require('assert');

// --- Simular ambiente de navegador ---
global.window = global;
global.localStorage = (function() {
  let store = {};
  return {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v; },
    removeItem: k => { delete store[k]; },
    _dump: () => store
  };
})();
global.CustomEvent = class {
  constructor(name, opts) { this.name = name; this.detail = (opts || {}).detail; }
};
const eventosCapturados = [];
global.dispatchEvent = (e) => { eventosCapturados.push(e); };
global.firebase = { firestore: { FieldValue: { serverTimestamp: () => 'TIMESTAMP' } } };

require('./carrinho.js');
const C = window.Carrinho;

let totalTestes = 0;
function caso(nome, fn) {
  totalTestes++;
  try {
    fn();
    console.log(`  ✔ ${nome}`);
  } catch (err) {
    console.error(`  ✘ ${nome}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
    throw err; // interrompe no primeiro erro — a Cline não deve seguir adiante
  }
}

function resetar() {
  localStorage.setItem('attos2_carrinho', JSON.stringify([]));
  eventosCapturados.length = 0;
}

console.log('--- adicionar() ---');

caso('adiciona item novo dentro do estoque', () => {
  resetar();
  const r = C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 2, estoqueDisponivel: 5 });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(C.obter().length, 1);
  assert.strictEqual(C.obter()[0].quantidade, 2);
});

caso('soma quantidade ao adicionar o mesmo item de novo (id+tamanho+corte)', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 2, estoqueDisponivel: 5 });
  const r = C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 2, estoqueDisponivel: 5 });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(C.obter().length, 1);
  assert.strictEqual(C.obter()[0].quantidade, 4);
});

caso('permite exatamente no limite do estoque (borda)', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 4, estoqueDisponivel: 5 });
  const r = C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 1, estoqueDisponivel: 5 });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(C.obter()[0].quantidade, 5);
});

caso('bloqueia ao ultrapassar o estoque e NÃO altera o estado', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 4, estoqueDisponivel: 5 });
  const r = C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 5, estoqueDisponivel: 5 });
  assert.strictEqual(r.ok, false);
  assert.ok(r.motivo && r.motivo.length > 0, 'deve trazer motivo do bloqueio');
  assert.strictEqual(C.obter()[0].quantidade, 4, 'quantidade não deve mudar quando bloqueado');
});

caso('mesmo id+tamanho mas corte diferente NÃO soma (vira item separado)', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 1, estoqueDisponivel: 5 });
  C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Slim', quantidade: 1, estoqueDisponivel: 5 });
  assert.strictEqual(C.obter().length, 2);
});

caso('recusa quando estoqueDisponivel não é informado', () => {
  resetar();
  const r = C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 1 });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(C.obter().length, 0);
});

caso('recusa quando estoqueDisponivel é 0', () => {
  resetar();
  const r = C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 1, estoqueDisponivel: 0 });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(C.obter().length, 0);
});

caso('recusa quantidade negativa (item não entra no carrinho)', () => {
  resetar();
  const r = C.adicionar({ id: 'p9', nome: 'X', preco: 10, tamanho: 'M', corte: 'A', quantidade: -3, estoqueDisponivel: 5 });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(C.obter().length, 0, 'carrinho deve continuar vazio');
});

caso('recusa quantidade zero', () => {
  resetar();
  const r = C.adicionar({ id: 'p9', nome: 'X', preco: 10, tamanho: 'M', corte: 'A', quantidade: 0, estoqueDisponivel: 5 });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(C.obter().length, 0);
});

console.log('--- alterarQuantidade() ---');

caso('incrementa dentro do limite quando estoque é informado', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 2, estoqueDisponivel: 5 });
  const r = C.alterarQuantidade(0, 1, 5);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(C.obter()[0].quantidade, 3);
});

caso('REGRESSÃO: bloqueia incremento quando estoqueDisponivel NÃO é passado (bug original)', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 4, estoqueDisponivel: 5 });
  const r = C.alterarQuantidade(0, 100); // sem 3º argumento — antes disso, incrementava livremente
  assert.strictEqual(r.ok, false, 'sem estoqueDisponivel, incremento deve ser recusado por padrão');
  assert.strictEqual(C.obter()[0].quantidade, 4, 'quantidade não pode ter mudado para 104');
});

caso('bloqueia incremento além do estoque e não altera estado', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 4, estoqueDisponivel: 5 });
  const r = C.alterarQuantidade(0, 5, 5);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(C.obter()[0].quantidade, 4);
});

caso('decremento (delta negativo) não exige estoqueDisponivel', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 3, estoqueDisponivel: 5 });
  const r = C.alterarQuantidade(0, -1); // sem 3º argumento, mas delta < 0
  assert.strictEqual(r.ok, true);
  assert.strictEqual(C.obter()[0].quantidade, 2);
});

caso('decrementar até 0 remove o item do carrinho', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'Camisa', preco: 50, tamanho: 'M', corte: 'Tradicional', quantidade: 1, estoqueDisponivel: 5 });
  const r = C.alterarQuantidade(0, -1);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(C.obter().length, 0);
});

caso('índice inexistente retorna erro e não altera nada', () => {
  resetar();
  const r = C.alterarQuantidade(5, 1, 10);
  assert.strictEqual(r.ok, false);
});

console.log('--- remover() ---');

caso('remove item pelo índice correto', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'A', preco: 10, tamanho: 'M', corte: 'X', quantidade: 1, estoqueDisponivel: 5 });
  C.adicionar({ id: 'p2', nome: 'B', preco: 20, tamanho: 'G', corte: 'Y', quantidade: 1, estoqueDisponivel: 5 });
  const r = C.remover(0);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(C.obter().length, 1);
  assert.strictEqual(C.obter()[0].id, 'p2');
});

caso('remover com índice fora do range não quebra nem altera nada', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'A', preco: 10, tamanho: 'M', corte: 'X', quantidade: 1, estoqueDisponivel: 5 });
  const r = C.remover(99);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(C.obter().length, 1);
});

console.log('--- totalItens() / subtotal() ---');

caso('totalItens soma quantidades corretamente', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'A', preco: 10, tamanho: 'M', corte: 'X', quantidade: 3, estoqueDisponivel: 5 });
  C.adicionar({ id: 'p2', nome: 'B', preco: 20, tamanho: 'G', corte: 'Y', quantidade: 2, estoqueDisponivel: 5 });
  assert.strictEqual(C.totalItens(), 5);
});

caso('subtotal soma preco*quantidade corretamente', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'A', preco: 10, tamanho: 'M', corte: 'X', quantidade: 3, estoqueDisponivel: 5 });
  C.adicionar({ id: 'p2', nome: 'B', preco: 20, tamanho: 'G', corte: 'Y', quantidade: 2, estoqueDisponivel: 5 });
  assert.strictEqual(C.subtotal(), 70); // 3*10 + 2*20
});

console.log('--- obter() / robustez ---');

caso('localStorage com JSON corrompido não derruba a página (retorna [])', () => {
  localStorage.setItem('attos2_carrinho', '{isso nao e json valido');
  const itens = C.obter();
  assert.deepStrictEqual(itens, []);
});

caso('localStorage vazio retorna array vazio', () => {
  localStorage.removeItem('attos2_carrinho');
  assert.deepStrictEqual(C.obter(), []);
});

console.log('--- evento carrinhoAtualizado ---');

caso('dispara evento com total correto após adicionar', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'A', preco: 10, tamanho: 'M', corte: 'X', quantidade: 3, estoqueDisponivel: 5 });
  const ultimo = eventosCapturados[eventosCapturados.length - 1];
  assert.strictEqual(ultimo.name, 'carrinhoAtualizado');
  assert.strictEqual(ultimo.detail.total, 3);
});

caso('NÃO dispara evento quando adicionar é recusado (estado não mudou)', () => {
  resetar();
  const antes = eventosCapturados.length;
  C.adicionar({ id: 'p1', nome: 'A', preco: 10, tamanho: 'M', corte: 'X', quantidade: 1, estoqueDisponivel: 0 });
  assert.strictEqual(eventosCapturados.length, antes, 'não deveria ter disparado evento em caso de recusa');
});

console.log('--- limpar() / limparTudo() ---');

caso('limpar() esvazia o carrinho local', () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'A', preco: 10, tamanho: 'M', corte: 'X', quantidade: 1, estoqueDisponivel: 5 });
  C.limpar();
  assert.deepStrictEqual(C.obter(), []);
});

caso('limparTudo() funciona mesmo sem db/user (não quebra)', async () => {
  resetar();
  C.adicionar({ id: 'p1', nome: 'A', preco: 10, tamanho: 'M', corte: 'X', quantidade: 1, estoqueDisponivel: 5 });
  await C.limparTudo(null, null);
  assert.deepStrictEqual(C.obter(), []);
});

console.log(`\n✔ todos os testes passaram (${totalTestes} casos)`);
