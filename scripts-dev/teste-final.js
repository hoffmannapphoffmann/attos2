// Teste final da Cloud Function Asaas
const https = require('https');

const data = JSON.stringify({
  pedidoId: 'teste-' + Date.now(),
  clienteNome: 'Cliente Teste',
  clienteEmail: 'teste@email.com',
  cpfCnpj: '12345678909',
  valor: 79.90,
  descricao: 'Pedido teste ATTOS2',
  billingType: 'PIX'
});

console.log('📤 Enviando requisição para Cloud Function...');
console.log('Body:', data);

const options = {
  hostname: 'southamerica-east1-attos2-c2644.cloudfunctions.net',
  path: '/gerarCobranca',
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
    console.log('\n📥 Status:', res.statusCode);
    console.log('📥 Resposta:', body);
    try {
      const parsed = JSON.parse(body);
      if (parsed.success) {
        console.log('\n✅✅✅ COBRANÇA CRIADA COM SUCESSO!');
        console.log('ID:', parsed.id);
        console.log('Status:', parsed.status);
        console.log('Tipo:', parsed.billingType);
        if (parsed.pixCopiaECola) {
          console.log('\n📱 PIX Copia e Cola disponível!');
          console.log('   (primeiros 50 chars):', parsed.pixCopiaECola.substring(0, 50) + '...');
        }
        if (parsed.pixQrCode) {
          console.log('📱 QR Code PIX disponível! (base64)');
        }
        if (parsed.invoiceUrl) {
          console.log('🔗 Fatura:', parsed.invoiceUrl);
        }
      } else {
        console.log('\n❌ Erro:', parsed.error);
      }
    } catch (e) {
      console.log('Erro ao parsear resposta:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Erro na requisição:', e.message);
});

req.write(data);
req.end();
