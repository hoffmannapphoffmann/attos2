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
| Carrinho | ✅ Completo | LocalStorage + Firestore, CRUD itens |
| Página de Produtos | ✅ Completo | Catálogo com filtros, busca, grid dinâmico |
| Checkout (endereço + frete) | ✅ Completo | Endereço, frete simulado, geração de pedido |
| Meus Pedidos | ✅ Completo | Histórico com status e rastreio |
| Perfil do Cliente | ❌ Não iniciado | Dados pessoais, endereços |
| Detalhe do Produto | ❌ Não iniciado | Página individual com seleção de corte/tamanho |
| Painel Admin | ❌ Não iniciado | CRUD produtos, pedidos, cupons, config |
| Cloud Functions | ❌ Não iniciado | Emails, webhook, estoque |
| Integração Melhor Envio | ❌ Não iniciado | API de frete |
| Integração Asaas | ❌ A definir | Pix, boleto, cartão |
| Integração Resend | ❌ Não iniciado | Emails transacionais |

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
- [x] Cálculo de frete simulado por estado (Melhor Envio futuro)
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

---

## 🔧 PRÓXIMAS ETAPAS

### Fase 3 — Painel Administrativo (AGORA)
- [ ] Criar `pages/admin/index.html` — Dashboard com resumo
- [ ] Login separado com role "admin" (custom claim)
- [ ] CRUD de produtos (nome, preço, categoria, modelos/cortes, estoque, imagem, versículo, destaque)
- [ ] Upload de imagens para Cloud Storage
- [ ] Lista de pedidos com status
- [ ] Atualizar status do pedido (pago, enviado, entregue)
- [ ] Inserir código de rastreio
- [ ] Gerenciamento de cupons
- [ ] Configuração de frete (valor base, regiões)
- [ ] Versículo do dia

### Fase 4 — Detalhe do Produto
- [ ] Criar `pages/produto.html` — Página individual
- [ ] Imagem grande do produto
- [ ] Seleção de tamanho (P, M, G, GG) — obrigatório
- [ ] Seleção de corte (Tradicional, Longline, Slim Fit, Oversized) — obrigatório
- [ ] Cada combinação (tamanho + corte) tem seu próprio estoque
- [ ] Botão "Adicionar ao carrinho"

### Fase 5 — Perfil do Cliente
- [ ] Criar `pages/perfil.html`
- [ ] Dados pessoais (nome, email, telefone)
- [ ] Endereços salvos (múltiplos)
- [ ] Histórico de pedidos

### Fase 6 — Cloud Functions
- [ ] `onCreate` cliente → email de boas-vindas (Resend)
- [ ] `onUpdate` pedido → email de confirmação/rastreio
- [ ] Webhook Asaas (quando definir)
- [ ] Atualização automática de estoque ao confirmar pedido

### Fase 7 — Integrações
- [ ] Melhor Envio (cálculo de frete real)
- [ ] Asaas (Pix, boleto, cartão)
- [ ] Resend (emails transacionais)

---

## 🗺️ FLUXO DO USUÁRIO (COMPLETO)

```
Home → Produtos → [Detalhe do Produto] → Adicionar ao carrinho
  → Carrinho → Finalizar Compra
    → [Não logado] → Login/Cadastro
    → [Logado] → Escolher endereço
      → Calcular frete (Melhor Envio)
      → Confirmar pedido
        → Status: aguardando_pagamento
        → Cliente paga via Asaas (Pix, boleto ou cartão)
        → Webhook Asaas confirma → status "pago"
        → Email de confirmação
        → Lojista envia + código rastreio
        → Email de rastreio
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
| Detalhe do Produto | `pages/produto.html` | ❌ |
| Perfil do Cliente | `pages/perfil.html` | ❌ |
| Painel Admin | `pages/admin/index.html` | ❌ |
| Admin - Produtos | `pages/admin/produtos.html` | ❌ |
| Admin - Pedidos | `pages/admin/pedidos.html` | ❌ |
| Admin - Config | `pages/admin/config.html` | ❌ |

---

## 🚀 DEPLOY

- **Hospedagem:** Firebase Hosting (gratuito)
- **URL:** https://attos2-c2644.web.app
- **Domínio próprio:** attos2.com.br (futuro)
- **Comando:** `firebase deploy --only hosting`

---

## 📝 NOTAS

- **Música:** Gabriela Rocha - Atos 2 (toca na Home)
- **Pagamento:** Asaas (Pix, boleto, cartão) — a integrar
- **Frete:** Melhor Envio (API gratuita) — a integrar
- **Emails:** Resend (3.000/mês grátis) — a integrar
- **Manutenção:** 1 camiseta/mês (ajustes, correções, suporte)
- **Custo fixo mensal:** R$ 3,33 (domínio)
