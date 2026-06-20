# 📋 DOCUMENTO TÉCNICO — ATTOS2 STORE

**Projeto:** Loja virtual completa de roupas gospel  
**Marca:** Attos2 Store  
**Domínio:** attos2.com.br  
**Versículo base:** Atos 2:4 — "E todos foram cheios do Espírito Santo"  
**Modelo de parceria:** Troca de serviço por 1 camiseta/mês  

---

## 1. TECNOLOGIAS

| Camada | Tecnologia | Finalidade |
|--------|-----------|------------|
| Frontend | HTML + CSS + JavaScript puro | Site rápido, sem frameworks pesados |
| Efeitos 3D | Three.js | Partículas flutuantes, efeitos visuais |
| Animações | GSAP | Transições cinematográficas |
| Backend | Firebase (Google) | Tudo integrado |
| Banco de dados | Firestore | Produtos, pedidos, clientes |
| Autenticação | Firebase Auth | Login obrigatório na finalização |
| Armazenamento | Cloud Storage | Imagens dos produtos |
| Hospedagem | Firebase Hosting | Site com SSL grátis |
| Automações | Cloud Functions | Emails, webhooks |
| Emails | Resend | Confirmações (grátis até 3.000/mês) |
| Frete | Melhor Envio | Cálculo automático |
| Pagamento | **Asaas** | Pix, boleto, cartão |

---

## 2. ARQUITETURA DO SITE

```
/attos2/
│
├── index.html              ← Home (página principal)
├── logo2.png               ← Logo sem fundo
├── DOCUMENTO_TECNICO.md    ← Este documento
├── css/
│   └── style.css           ← Estilos globais
├── js/
│   ├── app.js              ← JS principal (navegação, partículas, etc)
│   ├── auth.js             ← Login/cadastro (Firebase Auth)
│   ├── cart.js             ← Carrinho de compras
│   ├── checkout.js         ← Finalização de compra
│   ├── products.js         ← Catálogo e busca
│   └── admin.js            ← Painel administrativo
├── pages/
│   ├── produtos.html       ← Catálogo completo
│   ├── produto.html        ← Detalhe do produto
│   ├── carrinho.html       ← Carrinho
│   ├── checkout.html       ← Finalização
│   ├── login.html          ← Login/cadastro
│   ├── perfil.html         ← Perfil do cliente
│   ├── pedidos.html        ← Histórico de pedidos
│   └── admin/
│       ├── index.html      ← Painel admin
│       ├── produtos.html   ← CRUD produtos
│       ├── pedidos.html    ← Gerenciar pedidos
│       └── config.html     ← Configurações (cupons, frete)
├── images/                 ← Imagens dos produtos
└── functions/              ← Cloud Functions (futuro)
```

---

## 3. PÁGINAS E FUNCIONALIDADES

### 3.1 HOME (index.html) ✅ JÁ FEITA
- Hero com logo grande (700px) e versículo
- Partículas flutuando (Three.js)
- Grid de produtos em destaque (4 cards)
- Seção de versículo do dia
- Categorias (Masculino, Feminino, Infantil)
- Seção de números (clientes, modelos, etc)
- Newsletter
- Footer

### 3.2 CATÁLOGO (pages/produtos.html)
- Grid completo de produtos
- Filtros: categoria, tamanho, preço
- Busca por nome ou versículo
- Paginação ou scroll infinito
- Cards com hover 3D

### 3.3 DETALHE DO PRODUTO (pages/produto.html)
- Imagem grande do produto
- Nome, preço, versículo
- **Seleção de tamanho** (P, M, G, GG) — obrigatório
- **Seleção de corte** (Tradicional, Longline, Slim Fit, Oversized) — obrigatório
  - **Tradicional:** Modelo clássico reto
  - **Longline:** Modelo alongado (mais comprido)
  - **Slim Fit:** Modelo ajustado ao corpo
  - **Oversized:** Modelo largo e solto
- Cada combinação (tamanho + corte) tem seu próprio estoque
- Botão "Adicionar ao carrinho"

### 3.4 CARRINHO (pages/carrinho.html)
- Itens adicionados (persistente via localStorage)
- Quantidade, subtotal, frete, total
- Botão "Finalizar compra"

### 3.5 LOGIN/CADASTRO (pages/login.html)
- Email + senha
- Login com Google (futuro)
- Login obrigatório na finalização

### 3.6 CHECKOUT (pages/checkout.html)
- Escolher endereço (dos salvos ou novo)
- Calcular frete
- Resumo do pedido
- Finalizar (gera pedido como "aguardando_pagamento")

### 3.7 PERFIL (pages/perfil.html)
- Dados pessoais (nome, email, telefone)
- Endereços salvos (múltiplos)
- Histórico de pedidos

### 3.8 PAINEL ADMIN (pages/admin/)
- Login separado (role "admin")
- CRUD de produtos (nome, preço, categoria, tamanhos, estoque, imagem, versículo)
- Upload de imagens
- Gerenciar pedidos (status, código de rastreio)
- Marcar pagamento como confirmado manualmente
- Gerenciar cupons de desconto
- Configurar frete

---

## 4. REGRAS DE NEGÓCIO

| Ação | Exige login? |
|------|:---:|
| Navegar e ver produtos | ❌ Não |
| Adicionar ao carrinho | ❌ Não |
| **Finalizar compra** | ✅ **SIM** |
| Ver histórico de pedidos | ✅ SIM |
| Salvar endereços | ✅ SIM |
| Acessar painel admin | ✅ SIM (role admin) |

---

## 5. FLUXO DE COMPRA

```
1. Cliente navega → adiciona ao carrinho
2. Clica "Finalizar compra"
3. Sistema verifica login
   ├── Não logado → redireciona para login/cadastro
   └── Logado → prossegue
4. Escolhe endereço (salvo ou novo)
5. Calcula frete (Melhor Envio)
6. Confirma pedido
7. Pedido gerado → status "aguardando_pagamento"
8. Cliente paga via Asaas (Pix, boleto ou cartão)
9. Webhook do Asaas confirma pagamento → status "pago"
10. Lojista envia produto → insere código de rastreio
11. Cliente recebe email com código de rastreio
```

---

## 6. ESTRUTURA DO BANCO (FIRESTORE)

```
/loja-gospel/
│
├── /produtos/{produtoId}
│   ├── nome: "Camiseta Eu Sou do Meu Amado"
│   ├── preco: 79.90
│   ├── categoria: "masculino" | "feminino" | "infantil"
│   ├── tamanhos: ["P","M","G","GG"]
│   ├── cortes: ["Tradicional","Longline","Slim Fit","Oversized"]
│   ├── estoque: { "P": 10, "M": 5, "G": 8, "GG": 3 }
│   ├── imagemUrl: "url da imagem"
│   ├── versiculo: "Cânticos 2:16"
│   ├── destaque: true/false
│   └── createdAt: timestamp
│
├── /clientes/{clienteId}
│   ├── nome: "Maria Silva"
│   ├── email: "maria@email.com"
│   ├── telefone: "(11) 99999-9999"
│   ├── enderecos: [ { id, apelido, cep, logradouro, bairro, cidade, estado, principal } ]
│   ├── createdAt: timestamp
│   └── ultimoPedido: timestamp
│
├── /pedidos/{pedidoId}
│   ├── clienteId: "referência"
│   ├── itens: [ { produtoId, nome, quantidade, preco, tamanho, corte } ]
│   ├── subtotal: 159.80
│   ├── frete: 15.00
│   ├── total: 174.80
│   ├── status: "aguardando_pagamento" | "pago" | "enviado" | "entregue" | "cancelado"
│   ├── enderecoEntrega: { ... }
│   ├── pagamentoId: ""
│   ├── codigoRastreio: ""
│   └── createdAt: timestamp
│
└── /config
    ├── frete: { valorBase: 15.00 }
    ├── cupons: { "DEUS10": 10 }
    └── versiculo_dia: { texto: "Efésios 6:13", referencia: "Efésios 6:13" }
```

---

## 7. CORES E IDENTIDADE VISUAL

| Elemento | Cor | Código |
|----------|:---:|:------:|
| Fundo principal | Preto | `#0A0A0A` |
| Destaque principal | Dourado | `#D4AF37` |
| Dourado claro | Ouro | `#FFD700` |
| Roxo profundo | Roxo | `#2E0A4A` |
| Vinho | Vinho | `#4A0E17` |
| Texto claro | Branco 60% | `rgba(255,255,255,0.6)` |
| Texto escuro | Preto | `#0A0A0A` |

**Fonte principal:** Georgia (serif) para títulos e corpo  
**Fonte secundária:** Arial (sans-serif) para menus e labels

---

## 8. CRONOGRAMA DE DESENVOLVIMENTO

| Fase | Atividade | Status |
|:----:|----------|:------:|
| 0 | Página de teste (Home) | ✅ **Concluída** |
| 1 | Configurar Firebase (Firestore, Auth, Storage, Hosting) | ⏳ Pendente |
| 2 | Separar CSS/JS em arquivos modulares | ⏳ Pendente |
| 3 | Página de Login/Cadastro | ⏳ Pendente |
| 4 | Catálogo de produtos + busca/filtros | ⏳ Pendente |
| 5 | Detalhe do produto | ⏳ Pendente |
| 6 | Carrinho de compras | ⏳ Pendente |
| 7 | Checkout + Endereços | ⏳ Pendente |
| 8 | Perfil do cliente + Histórico de pedidos | ⏳ Pendente |
| 9 | Painel administrativo completo | ⏳ Pendente |
| 10 | Integração Asaas (Pix, boleto, cartão) | ⏳ Pendente |
| 11 | Integração Melhor Envio (frete) | ⏳ Pendente |
| 12 | Cloud Functions + Emails (Resend) | ⏳ Pendente |
| 13 | Testes e ajustes | ⏳ Pendente |
| 14 | Deploy no Firebase Hosting + domínio | ⏳ Pendente |

---

## 9. CUSTOS

| Serviço | Custo |
|---------|:-----:|
| Firebase (plano gratuito) | R$ 0 |
| Domínio attos2.com.br (1 ano) | R$ 40 |
| Melhor Envio | Grátis (frete pago pelo cliente) |
| Resend (email) | Grátis até 3.000 emails/mês |
| Asaas | Taxa por transação |
| **Custo fixo mensal** | **R$ 3,33 (domínio)** |

---

## 10. MODELO DE PARCERIA

| Item | Descrição |
|------|-----------|
| Serviço prestado | Desenvolvimento completo do site |
| Valor de mercado | R$ 5.000 |
| Forma de pagamento | 1 camiseta por mês |
| Manutenção contínua | Mesmo modelo (1 camiseta/mês) |

---

## 11. ENTREGÁVEIS FINAIS

- [ ] Site completo hospedado em attos2.com.br
- [ ] Código-fonte organizado
- [ ] Banco de dados estruturado (Firestore)
- [ ] Regras de segurança do Firestore
- [ ] Painel administrativo
- [ ] Documentação de uso
- [ ] Treinamento (1 hora)

---

## 12. APROVAÇÃO

**Lojista (cliente):** ______________________________

**Desenvolvedor:** ______________________________

**Data:** ___ / ___ / ______

**Camiseta combinada (modelo/tamanho/cor):** ______________________________
