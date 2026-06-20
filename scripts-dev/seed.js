// ============================================
// SCRIPT PARA POPULAR O FIRESTORE
// ATTOS2 - Produtos de Teste
// ============================================
// Para executar: node seed.js
// (precisa ter firebase-admin instalado)

const admin = require('firebase-admin');
const serviceAccount = require('./attos2-c2644-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const produtos = [
  // === MASCULINO ===
  {
    nome: "Eu Sou do Meu Amado",
    preco: 79.90,
    categoria: "masculino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 10, M: 5, G: 8, GG: 3 },
    versiculo: "Cânticos 2:16",
    destaque: true,
    descricao: "Camiseta masculina com estampa exclusiva. 'O meu amado é meu, e eu sou dele.'",
    cores: ["Preto", "Branco"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Luz do Mundo",
    preco: 89.90,
    categoria: "masculino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 8, M: 12, G: 6, GG: 4 },
    versiculo: "João 8:12",
    destaque: true,
    descricao: "'Eu sou a luz do mundo; quem me segue nunca andará em trevas.'",
    cores: ["Preto", "Cinza"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Sal da Terra",
    preco: 69.90,
    categoria: "masculino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 15, M: 10, G: 7, GG: 5 },
    versiculo: "Mateus 5:13",
    destaque: false,
    descricao: "'Vós sois o sal da terra.' Camiseta casual com design minimalista.",
    cores: ["Branco", "Azul Marinho"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Fiel Até o Fim",
    preco: 99.90,
    categoria: "masculino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 6, M: 9, G: 11, GG: 2 },
    versiculo: "Apocalipse 2:10",
    destaque: true,
    descricao: "'Sê fiel até a morte, e dar-te-ei a coroa da vida.' Edição especial.",
    cores: ["Preto", "Vinho"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Guerreiro da Fé",
    preco: 84.90,
    categoria: "masculino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 7, M: 8, G: 10, GG: 4 },
    versiculo: "Efésios 6:13",
    destaque: false,
    descricao: "'Tomai toda a armadura de Deus.' Estampa com design de armadura espiritual.",
    cores: ["Preto", "Branco"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Montanhas e Vale",
    preco: 74.90,
    categoria: "masculino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 12, M: 15, G: 9, GG: 6 },
    versiculo: "Salmos 121:1-2",
    destaque: false,
    descricao: "'Elevo os meus olhos para os montes.' Design com paisagem bíblica.",
    cores: ["Azul", "Cinza"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },

  // === FEMININO ===
  {
    nome: "Amada do Rei",
    preco: 79.90,
    categoria: "feminino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 15, M: 12, G: 8, GG: 4 },
    versiculo: "Salmos 45:11",
    destaque: true,
    descricao: "'O Rei se encantou com a tua beleza.' Camiseta feminina com detalhes em dourado.",
    cores: ["Branco", "Rosa Claro"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Princesa do Rei",
    preco: 89.90,
    categoria: "feminino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 18, M: 14, G: 6, GG: 3 },
    versiculo: "1 Pedro 3:4",
    destaque: true,
    descricao: "'O ornamento interior do coração.' Design delicado com coroa.",
    cores: ["Preto", "Lavanda"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Cheia de Graça",
    preco: 69.90,
    categoria: "feminino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 20, M: 16, G: 10, GG: 5 },
    versiculo: "Lucas 1:28",
    destaque: false,
    descricao: "'Alegra-te, cheia de graça.' Camiseta leve e confortável.",
    cores: ["Branco", "Azul Bebê"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Flor de Cristo",
    preco: 99.90,
    categoria: "feminino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 10, M: 8, G: 12, GG: 6 },
    versiculo: "Cantares 2:1",
    destaque: true,
    descricao: "'Eu sou a rosa de Sarom, o lírio dos vales.' Edição premium com bordado.",
    cores: ["Vinho", "Rosa"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Filha do Altíssimo",
    preco: 84.90,
    categoria: "feminino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 12, M: 10, G: 7, GG: 4 },
    versiculo: "Gálatas 3:26",
    destaque: false,
    descricao: "'Todos sois filhos de Deus pela fé.' Design moderno e elegante.",
    cores: ["Preto", "Dourado"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Paz como Rio",
    preco: 74.90,
    categoria: "feminino",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 14, M: 11, G: 9, GG: 5 },
    versiculo: "Isaías 66:12",
    destaque: false,
    descricao: "'Estenderei a paz como um rio.' Estampa fluida e suave.",
    cores: ["Azul Claro", "Branco"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },

  // === INFANTIL ===
  {
    nome: "Pequeno Samuel",
    preco: 59.90,
    categoria: "infantil",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 20, M: 18, G: 15, GG: 10 },
    versiculo: "1 Samuel 3",
    destaque: true,
    descricao: "'Fala, Senhor, que o teu servo ouve.' Camiseta infantil com design divertido.",
    cores: ["Azul", "Verde"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Pequena Débora",
    preco: 59.90,
    categoria: "infantil",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 22, M: 16, G: 12, GG: 8 },
    versiculo: "Juízes 4",
    destaque: false,
    descricao: "Inspirado na profetisa Débora. Coragem desde pequena!",
    cores: ["Rosa", "Lilás"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Davinho",
    preco: 49.90,
    categoria: "infantil",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 25, M: 20, G: 18, GG: 12 },
    versiculo: "Salmos 23",
    destaque: true,
    descricao: "'O Senhor é meu pastor.' Design com ovelhas e fundo verde.",
    cores: ["Verde", "Branco"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Ana Clara",
    preco: 59.90,
    categoria: "infantil",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 18, M: 14, G: 10, GG: 6 },
    versiculo: "1 Samuel 1",
    destaque: false,
    descricao: "Inspirado na fé de Ana. 'O meu coração se alegra no Senhor.'",
    cores: ["Rosa", "Branco"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "José do Egito",
    preco: 54.90,
    categoria: "infantil",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 16, M: 12, G: 14, GG: 8 },
    versiculo: "Gênesis 39:2",
    destaque: false,
    descricao: "'O Senhor estava com José.' Design com sonhos e estrelas.",
    cores: ["Azul", "Amarelo"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "Noé e a Arca",
    preco: 49.90,
    categoria: "infantil",
    tamanhos: ["P", "M", "G", "GG"],
    estoque: { P: 30, M: 24, G: 20, GG: 14 },
    versiculo: "Gênesis 7",
    destaque: false,
    descricao: "Design colorido com animais e arca. 'Entrou Noé na arca.'",
    cores: ["Azul", "Colorido"],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seed() {
  console.log(`🌱 Iniciando seed de ${produtos.length} produtos...\n`);

  for (const p of produtos) {
    try {
      const docRef = await db.collection('produtos').add(p);
      console.log(`✅ ${p.categoria.toUpperCase()} - ${p.nome} (${p.versiculo}) → ID: ${docRef.id}`);
    } catch (err) {
      console.error(`❌ Erro ao adicionar ${p.nome}:`, err.message);
    }
  }

  console.log(`\n🎉 Seed concluído! ${produtos.length} produtos adicionados.`);
  console.log(`📊 Categorias:`);
  const cats = {};
  produtos.forEach(p => { cats[p.categoria] = (cats[p.categoria] || 0) + 1; });
  Object.entries(cats).forEach(([cat, qtd]) => console.log(`   ${cat}: ${qtd} produtos`));
  console.log(`\n🔥 Acesse: https://attos2-c2644.web.app`);
  process.exit(0);
}

seed();
