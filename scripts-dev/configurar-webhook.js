// Configurar webhook do Asaas via API
const https = require('https');

const ASAAS_TOKEN = process.env.ASAAS_API_KEY;
if (!ASAAS_TOKEN) {
  console.error('Defina ASAAS_API_KEY no seu ambiente local antes de rodar este script.');
  process.exit(1);
}

const data = JSON.stringify({
  name: 'ATTOS2 Webhook',
  url: 'https://southamerica-east1-attos2-c2644.cloudfunctions.net/webhookAsaas',
  email: 'cleverson@email.com',
  enabled: true,
  interrupted: false,
  apiVersion: 3,
  sendType: 'SEQUENTIALLY',
  events: [
    'PAYMENT_RECEIVED',
    'PAYMENT_CONFIRMED',
    'PAYMENT_OVERDUE',
    'PAYMENT_REFUNDED'
  ]
});

const options = {
  hostname: 'api.asaas.com',
  path: '/v3/webhooks',
  method: 'POST',
  headers: {
    'access_token': ASAAS_TOKEN,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'User-Agent': 'ATTOS2/1.0'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Resposta:', body);
    try {
      const json = JSON.parse(body);
      if (json.id) {
        console.log('\n✅ Webhook cadastrado com sucesso! ID:', json.id);
      } else if (json.errors) {
        console.log('\n❌ Erros:', JSON.stringify(json.errors, null, 2));
      }
    } catch (e) {
      console.log('Resposta bruta:', body);
    }
  });
});

req.on('error', (err) => {
  console.error('Erro na requisição:', err.message);
});

req.write(data);
req.end();
