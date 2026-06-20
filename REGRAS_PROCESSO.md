# Regras de processo para a Cline — ATTOS2

> Regra permanente de processo para qualquer tarefa neste projeto.

---

## Regra geral (vale para TODA tarefa, em qualquer arquivo)

Depois de aplicar uma mudança em qualquer arquivo, **antes de seguir para a
próxima tarefa ou pedir aprovação**, a Cline deve:

1. Identificar o tipo do arquivo que mudou (ver categorias abaixo).
2. Rodar a checagem correspondente àquele tipo.
3. Se a checagem falhar: **parar**, mostrar o erro exato, corrigir, testar
   de novo. Só seguir adiante quando passar.
4. Se a checagem passar: mostrar o resultado (output do comando, não só
   "passou") e só então seguir para a próxima tarefa.
5. Nunca marcar uma tarefa como concluída sem ter mostrado o resultado de
   pelo menos uma checagem real (não vale "deve funcionar" sem rodar nada).

---

## Categoria 1 — Arquivos `.js` puros (módulos, sem depender do navegador)

Exemplos no projeto: `js/carrinho.js`, `js/audit.js`, scripts em
`scripts-dev/`.

**Checagem mínima (sempre):**
```bash
node --check caminho/do/arquivo.js
```
Isso só pega erro de sintaxe — é o mínimo, não é suficiente sozinho.

**Checagem real (obrigatória quando o arquivo expõe funções com lógica,
como `window.Carrinho`):**

A Cline deve criar um arquivo de teste ao lado do módulo (ex:
`js/carrinho.test.js`), que:
- Simula `window`, `localStorage` e `CustomEvent` em Node (eles não
  existem fora do navegador), carrega o módulo real com `require(...)`, e
  chama as funções exportadas com casos concretos.
- Usa `assert` (módulo nativo do Node, sem precisar instalar nada) para
  cada caso, não `console.log` solto — porque `console.log` não falha o
  processo, e o objetivo é que o teste **quebre com erro** se a lógica
  estiver errada, para a Cline não conseguir ignorar.
- Cobre, no mínimo, para qualquer função que mexe em quantidade/estoque:
  - Caminho feliz (adicionar/alterar dentro do limite).
  - Limite exato (na borda do estoque disponível).
  - Acima do limite (deve bloquear, e o estado não pode mudar).
  - Entrada ausente ou inválida (estoque não informado, índice
    inexistente, quantidade negativa ou zero) — a função deve recusar,
    nunca aceitar silenciosamente.
  - Persistência: depois de cada chamada, reler do "localStorage"
    simulado e confirmar que o estado salvo bate com o que a função
    disse que salvou.

**Comando para rodar:**
```bash
node js/carrinho.test.js
```
O script deve terminar com exit code `0` e imprimir algo como
`✔ todos os testes passaram (N casos)` no final. Se qualquer `assert`
falhar, o Node já encerra com erro e mostra qual assert quebrou — é esse
sinal que a Cline usa para saber que não pode avançar.

> Esse teste fica no repositório (não é descartável) — deve ser rodado de
> novo sempre que `carrinho.js` for alterado no futuro, não só agora.

---

## Categoria 2 — Páginas `.html` com `<script>` embutido

Exemplos: `pages/carrinho.html`, `pages/checkout.html`,
`pages/produtos.html`, `pages/produto-detalhe.html`.

Esses arquivos misturam HTML com JS inline, então `node --check` não
funciona neles diretamente. A checagem aqui é em camadas:

**1. Extrair e checar a sintaxe do JS embutido:**
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('pages/checkout.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
scripts.forEach((code, i) => {
  fs.writeFileSync('/tmp/check_' + i + '.js', code);
});
console.log(scripts.length + ' bloco(s) de script extraído(s)');
"
for f in /tmp/check_*.js; do node --check "$f" && echo "$f: sintaxe OK"; done
```
Isso pega erro de sintaxe (parênteses faltando, `await` fora de função
`async`, etc.) sem precisar abrir navegador.

**2. Checar que as funções que o HTML chama via `onclick="..."` realmente
existem no `<script>` correspondente:**
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('pages/checkout.html', 'utf8');
const chamadas = [...html.matchAll(/onclick=\"([a-zA-Z_]+)\(/g)].map(m => m[1]);
const definicoes = [...html.matchAll(/function\s+([a-zA-Z_]+)\s*\(/g)].map(m => m[1]);
const faltando = [...new Set(chamadas)].filter(c => !definicoes.includes(c));
if (faltando.length) {
  console.error('FUNÇÕES CHAMADAS NO HTML MAS NÃO DEFINIDAS:', faltando);
  process.exit(1);
}
console.log('Todas as funções chamadas por onclick existem.');
"
```

**3. Teste manual no navegador (obrigatório para qualquer página tocada
nas tarefas do carrinho), seguindo um roteiro fixo e documentando o
resultado:**

A Cline deve abrir a página (pode usar a extensão Live Server do VSCode,
ou `npx serve .`, o que já estiver disponível no projeto) e descrever,
por escrito, o resultado de cada passo do roteiro abaixo — não basta
dizer "testei e funcionou", precisa narrar o que apareceu na tela /
console:

- Abrir o DevTools (F12) → aba Console → confirmar que não há nenhum
  erro vermelho ao carregar a página.
- Repetir a ação que foi alterada (ex: clicar "+" no carrinho, adicionar
  produto, finalizar pedido) e conferir que o resultado bate com o
  esperado pela tarefa.
- Se a tarefa envolveu Firestore (ex: buscar estoque atual), conferir na
  aba Network do DevTools que a chamada ao Firestore realmente aconteceu
  (não ficou usando só o valor antigo em memória).

Se não for possível testar no navegador dentro do ambiente da Cline, ela
deve dizer isso explicitamente e listar o roteiro de teste manual para
você (Cleverson) rodar, em vez de assumir que está tudo certo.

---

## Categoria 3 — `functions/index.js` (Cloud Functions)

Esse arquivo roda no servidor (Firebase), não no navegador, mas também
não deve ser testado "no escuro" direto em produção.

**1. Sintaxe:**
```bash
node --check functions/index.js
```

**2. Lint / dependências (se o projeto já tiver isso configurado):**
```bash
cd functions && npm run lint 2>&1 || echo "sem script de lint configurado"
```

**3. Para qualquer função nova ou alterada que mexe em Firestore
(`gerarCobranca`, `webhookAsaas`, a nova `expirarPedidosNaoPagos`, e a
transação de reserva de estoque da Tarefa 4):**

> Conferido em 20/06/2026: o `firebase.json` deste projeto **não tem**
> seção `emulators` configurada ainda. Ou seja, a Cline vai cair no
> caminho "sem emulador" descrito abaixo, a não ser que configure o
> emulador antes (recomendado, dado que a Tarefa 4 mexe em decremento de
> estoque via transação — testar isso direto em produção é arriscado).

Como não dá para rodar Cloud Functions reais sem deploy, a Cline deve:
- Propor primeiro adicionar a seção `emulators` ao `firebase.json`
  (Firestore + Functions, no mínimo) e instalar o Firebase CLI local se
  ainda não houver, para então poder testar a transação de estoque sem
  risco. Isso é uma sub-tarefa de setup, não opcional, antes da Tarefa 4
  do prompt do carrinho.
- Com o emulador configurado, rodar a função localmente contra o
  emulador do Firestore antes de qualquer deploy:
  ```bash
  firebase emulators:start --only functions,firestore
  ```
  e então simular uma chamada HTTP real com `curl` contra a função local,
  com dados de teste (ex: um produto de teste com estoque baixo, simular
  duas requisições de reserva quase simultâneas com `curl` em background
  `&` para testar a corrida da Tarefa 4).
- Nunca fazer `firebase deploy --only functions` sem antes ter passado
  por sintaxe + emulador (não vale só teste manual documentado, para o
  caso específico da Tarefa 4 — decremento de estoque precisa ser
  validado com o emulador rodando, pela natureza concorrente do bug que
  está sendo corrigido).

---

## Resumo do "gate" (regra de bloqueio) que a Cline deve seguir

Para cada tarefa do `PROMPT_CLINE_corrigir_carrinho.md` (ou qualquer
tarefa futura no projeto):

```
1. Aplicar a mudança no(s) arquivo(s).
2. Identificar a categoria do arquivo (1, 2 ou 3, acima).
3. Rodar TODAS as checagens daquela categoria, nessa ordem:
   sintaxe → lógica automatizada (quando aplicável) → teste manual/emulador.
4. Mostrar o output real de cada checagem (não resumir como "ok").
5. Se algo falhar -> corrigir -> voltar ao passo 3. Não seguir adiante.
6. Só depois de tudo passar, marcar a tarefa como concluída e seguir
   para a próxima tarefa do prompt.
```

Esta regra vale para sempre neste projeto, não só para a tarefa do
carrinho — qualquer tarefa nova que você pedir à Cline daqui pra frente
deve seguir o mesmo gate, adaptando a checagem à categoria do arquivo
tocado.
