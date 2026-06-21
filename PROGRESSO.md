# Progresso — Correção do Carrinho ATTOS2

> Arquivo de acompanhamento de tarefas. Cada entrada registra data, tarefa,
> comandos rodados e resultado real.

| Tarefa | Status | Teste rodado | Resultado | Data |
|---|---|---|---|---|
| 1 — Módulo central | ✅ Concluída | node js/carrinho.test.js | 25/25 passaram | 21/06/2026 |
| 2 — Validação de estoque (3 entradas) | ⏳ Em andamento | — | — | — |
| 7 — Substituir .reduce | ✅ Concluída | grep reduce pages/checkout.html | 0 ocorrências; Carrinho.subtotal em 3 locais | 21/06/2026 |
| 3 — Revalidação no checkout | ⏳ Em andamento | — | — | — |
| 4 — Reserva transacional + webhook | ⏳ Pendente | — | — | — |
| 5 — Expiração agendada | ⏳ Pendente | — | — | — |
| 6 — Limpar carrinho no Firestore | ⏳ Pendente | — | — | — |
| 8 — Checklist final | ⏳ Pendente | — | — | — |

---

## Histórico anterior

## 20/06/2026 — Correção de emails transacionais (Resend)

**Tarefa:** Corrigir envio de emails via Resend — domínio `attos2.com.br` não verificado.

**Problema:** As Cloud Functions `onNewCliente` e `onPedidoAtualizado` estavam tentando enviar emails com `from: "ATTOS2 <contato@attos2.com.br>"`, mas o domínio `attos2.com.br` não está verificado no Resend, resultando em erro 403 `validation_error`.

**O que foi alterado:**
1. `functions/index.js` — `from` alterado de `contato@attos2.com.br` para `onboarding@resend.dev` (domínio padrão do Resend que funciona sem verificação)
2. Feito deploy das functions `onNewCliente` e `onPedidoAtualizado`

**Pendente (quando o domínio for configurado):**
- Verificar `attos2.com.br` no painel do Resend (adicionar registro DNS)
- Voltar o `from` para `contato@attos2.com.br`
- Fazer novo deploy das functions

## 20/06/2026 — Webhook do Asaas configurado e testado

**Tarefa:** Configurar webhook do Asaas para notificar pagamentos automaticamente.

**O que foi feito:**
1. Criado script `scripts-dev/configurar-webhook-asaas.js` para configurar via API
2. Webhook criado com sucesso (ID: `2f5b6b2d-aff7-4064-91c3-d4514d6a6cac`)
3. Eventos configurados: PAYMENT_RECEIVED, PAYMENT_CONFIRMED, PAYMENT_OVERDUE, PAYMENT_REFUNDED
4. Testado com pedido real — webhook funcionou, status atualizado automaticamente ✅

## 21/06/2026 — Navbar universal v2.0 (completa) implementada em todas as páginas

**Tarefa:** Replicar a navbar completa da home (mega dropdowns, preview, search, música, user menu, carrinho) em todas as páginas via `js/navbar.js`.

**O que foi alterado:**
1. `js/navbar.js` — reescrito de 84 para ~420 linhas, com 10 funções modulares:
   - `injetarHTML()`, `setupTablerIcons()`, `setupDropdownPortal()`, `setupPreviewPanel()`, `setupPreviewPortal()`, `setupCartBadge()`, `setupSearchBar()`, `setupUserDropdown()`, `setupAuth()`, `setupMusicPlayer()`
   - Aguarda `DOMContentLoaded` para injetar no body (corrige bug em subpáginas)
   - Detecta automaticamente subpasta (`pages/`, `admin/`) e ajusta caminhos
   - `ensureFirebase()` — evita reinicializar Firebase se a página já o fez
2. `index.html` — removido ~400 linhas de HTML/CSS/JS da navbar inline, carrega `js/navbar.js`
3. `pages/produtos.html` — removido navbar inline (~55 linhas), adicionado `<script src="../js/navbar.js">`
4. Demais páginas já usavam `navbar.js` ✅

**Resultado:** Todas as 8 páginas agora exibem a navbar completa idêntica à home.

## 21/06/2026 — Correção de validação de estoque no carrinho

**Tarefa:** Corrigir bug onde páginas manipulavam o carrinho sem validar estoque real do Firestore.

**Problema:** O módulo `js/carrinho.js` existia com 25 testes passando e validação completa de estoque, mas **nenhuma página o utilizava**. Cada página tinha sua própria implementação inline de `adicionarAoCarrinho()` que:
- Não validava estoque (permitia adicionar quantidade ilimitada)
- Não verificava `estoqueDisponivel` (ignorava se o produto estava esgotado)
- Usava cache em memória (estoque do momento do carregamento da página, não do clique)

**O que foi alterado:**
1. `pages/carrinho.html` — substituiu funções inline por chamadas ao módulo `Carrinho`:
   - Adicionado `<script src="../js/carrinho.js">`
   - `alterarQtd()` agora busca estoque real do Firestore via `await db.collection('produtos').doc(id).get()` antes de incrementar
   - Toast de erro visível (`mostrarErro()`) quando `{ ok: false }` — não falha silenciosamente
2. `pages/produto-detalhe.html` — mesma correção:
   - Adicionado `<script src="../js/carrinho.js">`
   - `adicionarAoCarrinho()` agora busca estoque do Firestore no momento do clique e chama `Carrinho.adicionar()`
3. `pages/produtos.html` — mesma correção:
   - Adicionado `<script src="../js/carrinho.js">`
   - `adicionarAoCarrinho()` usa `Carrinho.adicionar()` com validação e toast de erro

**Testes:** `node js/carrinho.test.js` — 25/25 passando ✅

## 20/06/2026 — Atualização do PROJETO_EXECUCAO.md

**Tarefa:** Sincronizar `PROJETO_EXECUCAO.md` com o código real do repositório.

**O que foi alterado:**
1. Tabela "STATUS GERAL" — corrigida para refletir a realidade:
   - Carrinho: ✅ → 🔧 Em correção
   - Detalhe do Produto: ❌ → ✅ (arquivo real: `produto-detalhe.html`)
   - Painel Admin: ❌ → ✅ (dashboard, CRUD, pedidos, cupons, config, auditoria)
   - Cloud Functions: ❌ → dividido em "pagamento ✅" e "estoque/reserva 🔧"
   - Integração Asaas: ❌ A definir → ✅ Completo (PIX e cartão)
   - Adicionado: Sistema de Auditoria ✅
2. Seção "O QUE JÁ ESTÁ PRONTO" — adicionados itens 8 (Detalhe do Produto) e 9 (Painel Administrativo)
3. Seção "PRÓXIMAS ETAPAS" — removidas Fases 3 (Painel Admin) e 4 (Detalhe do Produto), renumeradas:
   - Fase 3: Perfil do Cliente
   - Fase 4: Cloud Functions restantes (Resend)
   - Fase 5: Integrações restantes (Melhor Envio, Resend)
4. Tabela "PÁGINAS DO SITE" — corrigidos status de Detalhe do Produto e Admin pages para ✅
5. Seção "NOTAS" — atualizada para refletir que Asaas já está implementado

**Checagem:**
```bash
node -e "const fs=require('fs');const c=fs.readFileSync('PROJETO_EXECUCAO.md','utf8');console.log('produto.html:',(c.match(/produto\.html/g)||[]).length,'(deve ser 0)');console.log('perfil.html:',(c.match(/pages\/perfil\.html/g)||[]).length,'(deve ser 2)');console.log('produto-detalhe.html:',(c.match(/produto-detalhe\.html/g)||[]).length,'(deve aparecer)');"
```
Resultado: produto.html=0, perfil.html=2, produto-detalhe.html=3 ✅
