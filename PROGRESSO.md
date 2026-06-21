# PROGRESSO — ATTOS2

> Arquivo de acompanhamento de tarefas. Cada entrada registra data, tarefa,
> comandos rodados e resultado real.

---

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
