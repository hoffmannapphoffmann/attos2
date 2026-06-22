# PROJETO DE EXECUÇÃO — ATTOS2

> **Loja virtual de roupas gospel**  
> Marca: Attos2 Store  
> Versículo base: Atos 2:4 — "E todos foram cheios do Espírito Santo"  
> Backend: Firebase (Google)  
> Frontend: HTML/CSS/JS + Three.js + Tabler Icons + GSAP  
> Parceria: 1 camiseta/mês  
> Domínio: attos2.com.br

---

## 📋 STATUS GERAL

| Módulo | Status | Observação |
|--------|--------|------------|
| Home (index.html) | ✅ Completo | Hero, partículas, música, produtos, categorias, footer |
| Navbar | ✅ Completo | Mega-dropdown, user-dropdown, busca, carrinho badge |
| Login/Cadastro | ✅ Completo | Firebase Auth + Google + Firestore clientes |
| Carrinho | ✅ Completo | Módulo central com 25 testes; validação de estoque ao adicionar/alterar; revalidação no checkout; reserva transacional + rollback; expiração 24h; limpeza Firestore; polling confirmação PIX/cartão; taxas automáticas cartão |
| Página de Produtos | ✅ Completo | Catálogo com filtros, busca, grid dinâmico |
| Detalhe do Produto | ✅ Completo | Arquivo: `pages/produto-detalhe.html` com seleção de corte/tamanho e estoque por combinação |
| Checkout (endereço + frete) | ✅ Completo (frete real) | Frete via Melhor Envio API real; polling confirmação PIX/cartão; cupom de desconto com validação Firestore; taxas automáticas cartão; retirada no local com endereço |
| Meus Pedidos | ✅ Completo | Histórico com status e rastreio |
| Painel Admin | ✅ Completo | Dashboard, CRUD produtos, pedidos, cupons, config, auditoria — ver `pages/admin/*` |
| Sistema de Auditoria | ✅ Completo | `js/audit.js`, já em uso no admin |
| Cloud Functions (pagamento) | ✅ Completo | `gerarCobranca`, `webhookAsaas` em `functions/index.js` |
| Cloud Functions (frete) | ✅ Completo | `calcularFrete` via Melhor Envio API |
| Cloud Functions (etiqueta) | ✅ Completo | `gerarEtiqueta` — gera etiqueta no Melhor Envio automaticamente e atualiza pedido para "enviado" |
| Cloud Functions (emails) | ✅ Completo | `onNewCliente` (boas-vindas), `onPedidoAtualizado` (confirmação/rastreio) via Resend |
| Perfil do Cliente | ✅ Completo | `pages/perfil.html` com dados pessoais, endereços e pedidos recentes |
| Integração Melhor Envio | ✅ Completo | Cloud Function `calcularFrete` com token via secret |
| Integração Asaas | ✅ Completo (PIX e cartão) | Checkout transparente PIX e cartão; taxas automáticas conforme tabela; antecipação configurável; webhook com simetria estoque |
| SEO | ✅ Completo | index.html e produtos.html com OG tags, keywords, canonical, description otimizada |
| Cupons de Desconto | ✅ Completo | Admin cadastra cupons (%); checkout valida e aplica desconto no total |
| Integração Resend (emails) | ✅ Completo | `onNewCliente` + `onPedidoAtualizado` com templates HTML |

---

## ✅ O QUE JÁ ESTÁ PRONTO

### 1. Home (index.html)
- [x] Hero com fire-ring SVG animado
- [x] Partículas Three.js (fundo cinematográfico)
- [x] Mouse glow
- [x] Grid de produtos em destaque (dinâmico via Firestore)
- [x] Categorias (Masculino, Feminino, Infantil)
- [x] Seção "Sobre" com cruz SVG
- [x] Newsletter
- [x] Footer com navegação e "ATOS 2:4"
- [x] Reveal on scroll
- [x] 3D tilt nos cards
- [x] Música de fundo (Gabriela Rocha - Atos 2)

### 2. Navbar (index.html)
- [x] Logo
- [x] Mega-dropdown (Masculino, Feminino, Infantil) com versículos e preços
- [x] Preview lateral (desktop) e portal (mobile)
- [x] Ícone de busca com barra deslizante
- [x] Ícone do carrinho com badge
- [x] Ícone do usuário com dropdown (login/sair)
- [x] Responsivo mobile (sem hambúrguer, scroll horizontal)

### 3. Login/Cadastro (pages/login.html)
- [x] Tabs Entrar / Cadastrar
- [x] Login com email/senha
- [x] Cadastro com nome, email, telefone, senha
- [x] Login com Google
- [x] Esqueci senha
- [x] Cria documento do cliente no Firestore ao cadastrar
- [x] Redireciona se já logado
- [x] Glassmorphism, responsivo

### 4. Carrinho (pages/carrinho.html)
- [x] Lista de itens com imagem, nome, versículo, tamanho, corte
- [x] Controles de quantidade (+/-)
- [x] Remover item
- [x] Subtotal e total
- [x] Persistência LocalStorage + Firestore (se logado)
- [x] Badge atualizado via evento
- [x] Redireciona para login se não logado ao finalizar
- [x] Responsivo

### 5. Catálogo de Produtos (pages/produtos.html)
- [x] Grid de produtos vindo do Firestore
- [x] Filtros: categoria, tamanho, faixa de preço
- [x] Busca por nome ou versículo (via query string)
- [x] Preview/hover com informações
- [x] Adicionar ao carrinho direto do grid
- [x] Responsivo

### 6. Checkout (pages/checkout.html)
- [x] Selecionar endereço salvo ou adicionar novo
- [x] Formulário de endereço (CEP, logradouro, bairro, cidade, estado)
- [x] Cálculo de frete real via Melhor Envio API (Cloud Function)
- [x] Múltiplas opções de frete com seleção
- [x] Fallback para frete fixo em caso de erro
- [x] Resumo do pedido antes de confirmar
- [x] Gerar pedido no Firestore com status "aguardando_pagamento"
- [x] Carrinho redireciona para checkout
- [x] Proteção de login

### 7. Meus Pedidos (pages/pedidos.html)
- [x] Lista de pedidos do cliente ordenados por data
- [x] Status visual (Aguardando Pagamento, Pago, Enviado, Entregue, Cancelado)
- [x] Itens com imagem, tamanho, corte
- [x] Código de rastreio quando disponível
- [x] Proteção de login

### 8. Detalhe do Produto (pages/produto-detalhe.html)
- [x] Seleção de corte e tamanho
- [x] Estoque por combinação exibido em tempo real
- [x] Adicionar ao carrinho
- [x] Toast de confirmação

### 9. Painel Administrativo (pages/admin/*)
- [x] Login com custom claim `admin` (+ fallback por coleção `admins`)
- [x] Dashboard com resumo
- [x] CRUD de produtos com upload de imagem e modelos por corte
- [x] Gestão de pedidos com atualização de status
- [x] Cupons
- [x] Versículo do dia
- [x] Gerenciamento de outros admins
- [x] Log de auditoria de todas as ações

### 10. Perfil do Cliente (pages/perfil.html)
- [x] Dados pessoais (nome, email, telefone)
- [x] Endereços salvos (múltiplos) com CRUD
- [x] Busca de CEP automática (ViaCEP)
- [x] Histórico de pedidos recentes
- [x] Proteção de login

### 11. Cloud Functions
- [x] `gerarCobranca` — Gera cobrança no Asaas (PIX e cartão)
- [x] `webhookAsaas` — Recebe confirmação de pagamento e baixa estoque
- [x] `seed` — Popula banco com produtos de teste (protegido por SEED_KEY)
- [x] `calcularFrete` — Calcula frete via Melhor Envio API
- [x] `onNewCliente` — Email de boas-vindas via Resend
- [x] `onPedidoAtualizado` — Email de confirmação/rastreio/cancelamento via Resend

---

## 🗺️ FLUXO DO USUÁRIO (COMPLETO)

```
Home → Produtos → [Detalhe do Produto] → Adicionar ao carrinho
  → Carrinho → Finalizar Compra
    → [Não logado] → Login/Cadastro
    → [Logado] → Escolher forma de entrega:
      ├── Retirar no Local (grátis — Bocaiuva do Sul - PR)
      └── Receber em Casa → Calcular frete (Melhor Envio) → escolher PAC ou SEDEX
    → Confirmar pedido
      → Status: aguardando_pagamento
      → Cliente paga via Asaas (PIX ou cartão)
      → Webhook Asaas confirma → status "pago"
      → Email de confirmação (Resend)
      → [Se for entrega] Admin abre pedido → clica "Gerar Etiqueta (Melhor Envio)"
        → Cloud Function compra etiqueta, gera PDF, atualiza status "enviado" + código rastreio
        → Email de rastreio enviado automaticamente (Resend)
      → [Se for retirada] Admin marca como "enviado" manualmente
      → Cliente acompanha no histórico
```

---

## 👕 MODELAGEM DAS CAMISETAS (CORTES)

Cada produto pode ter **múltiplos cortes/modelagens**, e cada corte tem seus próprios tamanhos e estoque.

### Cortes disponíveis:
| Corte | Descrição |
|-------|-----------|
| **Tradicional** | Modelagem reta, caimento clássico |
| **Slim Fit** | Modelagem ajustada ao corpo |
| **Oversized** | Modelagem larga e confortável |
| **Longline** | Modelagem alongada (mais comprida) |

### Tamanhos disponíveis (por corte):
`P`, `M`, `G`, `GG`

### Estrutura do produto no Firestore:
```
/produtos/{produtoId}
├── nome: "Eu Sou do Meu Amado"
├── preco: 79.90
├── categoria: "masculino" | "feminino" | "infantil"
├── versiculo: "Cânticos 2:16"
├── imagemUrl: "https://..."
├── destaque: true
├── createdAt: timestamp
├── modelos: {
│     "Tradicional": { "P": 10, "M": 5, "G": 8, "GG": 3 },
│     "Slim Fit":   { "P": 0, "M": 4, "G": 6, "GG": 2 },
│     "Oversized":  { "P": 0, "M": 0, "G": 3, "GG": 5 },
│     "Longline":   { "P": 0, "M": 2, "G": 4, "GG": 0 }
│   }
```

**Regra:** No cadastro do produto, o lojista define quais cortes estão disponíveis e o estoque de cada tamanho dentro de cada corte. Um produto pode ter só 1 corte ou todos os 4.

---

## 🗄️ ESTRUTURA DO BANCO (FIRESTORE)

```
/loja-gospel/
├── /produtos/{produtoId}
│   ├── nome, preco, categoria, modelos{ corte: { tam: qtd } }
│   ├── imagemUrl, versiculo, destaque, createdAt
│
├── /clientes/{clienteId}
│   ├── nome, email, telefone, enderecos[], createdAt
│
├── /pedidos/{pedidoId}
│   ├── clienteId, itens[], subtotal, frete, total
│   ├── status, enderecoEntrega, pagamentoId
│   ├── codigoRastreio, createdAt
│
└── /config
    ├── frete: { valorBase, regioes }
    ├── cupons: { "DEUS10": 10 }
    └── versiculo_dia: { texto, referencia }
```

---

## 📐 REGRAS DE NEGÓCIO

| Ação | Exige login? |
|------|-------------|
| Navegar e ver produtos | ❌ Não |
| Adicionar ao carrinho | ❌ Não |
| Finalizar compra | ✅ SIM |
| Ver histórico de pedidos | ✅ SIM |
| Salvar endereços | ✅ SIM |
| Acessar painel admin | ✅ SIM (role admin) |

---

## 🔗 PÁGINAS DO SITE

| Página | Arquivo | Status |
|--------|---------|--------|
| Home | `index.html` | ✅ |
| Login/Cadastro | `pages/login.html` | ✅ |
| Carrinho | `pages/carrinho.html` | ✅ |
| Produtos (catálogo) | `pages/produtos.html` | ✅ |
| Checkout | `pages/checkout.html` | ✅ |
| Meus Pedidos | `pages/pedidos.html` | ✅ |
| Detalhe do Produto | `pages/produto-detalhe.html` | ✅ |
| Perfil do Cliente | `pages/perfil.html` | ✅ |
| Painel Admin | `pages/admin/index.html` | ✅ |
| Admin - Produtos | `pages/admin/produtos.html` | ✅ |
| Admin - Pedidos | `pages/admin/pedidos.html` | ✅ |
| Admin - Config | `pages/admin/config.html` | ✅ |

---

## 🚀 DEPLOY

- **Hospedagem:** Firebase Hosting (gratuito)
- **URL:** https://attos2-c2644.web.app
- **Domínio próprio:** attos2.com.br (futuro)
- **Comando:** `firebase deploy --only hosting`

---

## 📝 NOTAS

- **Música:** Gabriela Rocha - Atos 2 (toca na Home)
- **Pagamento:** Asaas (Pix, boleto, cartão) — já implementado (PIX e cartão), falta testar em sandbox
- **Frete:** Melhor Envio (API gratuita) — já integrado via Cloud Function
- **Emails:** Resend (3.000/mês grátis) — a integrar
- **Manutenção:** 1 camiseta/mês (ajustes, correções, suporte)
- **Custo fixo mensal:** R$ 3,33 (domínio)
