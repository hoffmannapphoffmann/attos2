// Teste direto da API Asaas
const https = require('https');

const ASAAS_KEY = process.env.ASAAS_API_KEY;
if (!ASAAS_KEY) {
  console.error('Defina ASAAS_API_KEY no seu ambiente local antes de rodar este script.');
  process.exit(1);
}

console.log('Testando path /api/v3/customers...');

const options = {
  hostname: 'api.asaas.com',
  path: '/api/v3/customers?limit=1',
  method: 'GET',
  headers: {
    'access_token': ASAAS_KEY,
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
      const parsed = JSON.parse(body);
      if (parsed.data !== undefined) {
        console.log('\n✅ Path /api/v3 funciona!');
      } else if (parsed.errors) {
        console.log('\n❌ Erro:', JSON.stringify(parsed.errors));
      }
    } catch (e) {
      console.log('Erro ao parsear:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Erro na requisição:', e.message);
});

req.end();
