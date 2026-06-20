# PROGRESSO — ATTOS2

> Arquivo de acompanhamento de tarefas. Cada entrada registra data, tarefa,
> comandos rodados e resultado real.

---

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
