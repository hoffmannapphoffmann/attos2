/**
 * Script para configurar o webhook do Asaas via API.
 *
 * Uso:
 *   ASAAS_API_KEY=seu_token_aqui node scripts-dev/configurar-webhook-asaas.js
 *
 * Ou crie um arquivo .env na raiz com:
 *   ASAAS_API_KEY=seu_token_aqui
 *
 * A URL do webhook aponta para a Cloud Function hospedada no Firebase.
 */

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
if (!ASAAS_API_KEY) {
  console.error('❌ Defina ASAAS_API_KEY no ambiente ou crie um arquivo .env');
  process.exit(1);
}

const WEBHOOK_URL = 'https://webhookasaas-cnr5sutmlq-rj.a.run.app';
const ASAAS_BASE = 'https://api.asaas.com/v3';

const headers = {
  'access_token': ASAAS_API_KEY,
  'Content-Type': 'application/json'
};

async function configurarWebhook() {
  console.log(`🔗 Configurando webhook do Asaas para:\n   ${WEBHOOK_URL}\n`);

  // 1. Listar webhooks existentes
  const listaRes = await fetch(`${ASAAS_BASE}/webhooks`, { headers });
  const lista = await listaRes.json();

  if (!listaRes.ok) {
    console.error('❌ Erro ao listar webhooks:', lista);
    process.exit(1);
  }

  // Verificar se já existe um webhook com essa URL
  const existente = (lista.data || []).find(w => w.url === WEBHOOK_URL);

  if (existente) {
    console.log(`ℹ️  Webhook já existe (ID: ${existente.id}). Atualizando...`);

    // Atualizar
    const updateRes = await fetch(`${ASAAS_BASE}/webhooks/${existente.id}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        url: WEBHOOK_URL,
        email: 'cleverson@hoffmannapp.com.br',
        enabled: true,
        interrupted: false,
        apiVersion: 3,
        name: 'ATTOS2 Webhook',
        sendType: 'SEQUENTIALLY',
        events: [
          'PAYMENT_RECEIVED',
          'PAYMENT_CONFIRMED',
          'PAYMENT_OVERDUE',
          'PAYMENT_REFUNDED'
        ]
      })
    });

    const update = await updateRes.json();
    if (updateRes.ok) {
      console.log('✅ Webhook atualizado com sucesso!');
    } else {
      console.error('❌ Erro ao atualizar:', update);
    }
  } else {
    console.log('ℹ️  Nenhum webhook encontrado. Criando novo...');

    // Criar
    const createRes = await fetch(`${ASAAS_BASE}/webhooks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        url: WEBHOOK_URL,
        email: 'cleverson@hoffmannapp.com.br',
        enabled: true,
        interrupted: false,
        apiVersion: 3,
        name: 'ATTOS2 Webhook',
        sendType: 'SEQUENTIALLY',
        events: [
          'PAYMENT_RECEIVED',
          'PAYMENT_CONFIRMED',
          'PAYMENT_OVERDUE',
          'PAYMENT_REFUNDED'
        ]
      })
    });

    const create = await createRes.json();
    if (createRes.ok) {
      console.log('✅ Webhook criado com sucesso!');
      console.log(`   ID: ${create.id}`);
    } else {
      console.error('❌ Erro ao criar:', create);
    }
  }

  console.log(`\n📌 Eventos configurados:`);
  console.log(`   - PAYMENT_RECEIVED (Pagamento recebido)`);
  console.log(`   - PAYMENT_CONFIRMED (Pagamento confirmado)`);
  console.log(`   - PAYMENT_OVERDUE (Pagamento vencido)`);
  console.log(`   - PAYMENT_REFUNDED (Pagamento estornado)`);
}

configurarWebhook().catch(err => {
  console.error('❌ Erro inesperado:', err);
  process.exit(1);
});
