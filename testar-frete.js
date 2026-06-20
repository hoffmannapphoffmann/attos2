// Teste da Cloud Function calcularFrete (via URL pública)
const https = require('https');

const data = JSON.stringify({
  cepDestino: "01310100",
  itens: [
    {
      peso: 0.2,
      altura: 2,
      largura: 20,
      comprimento: 30,
      valor: 79.90,
      quantidade: 1
    }
  ]
});

const options = {
  hostname: 'calcularfrete-cnr5sutmlq-rj.a.run.app',
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Resposta:', JSON.parse(body));
  });
});

req.on('error', (e) => console.error('Erro:', e.message));
req.write(data);
req.end();
