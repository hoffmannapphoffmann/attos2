// Teste direto da API do Melhor Envio - CEP Bocaiuva do Sul
const https = require('https');

const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNzQzNmViMDg0OWFlY2U0OTA4YzRiMGUwMWIyMTVhMTZlZTU4NjBkYTA3NjQ1MzA2YmI5YjRiYjA2YmUwMDkzOTExNTYwYjlmY2I0Njc5MGYiLCJpYXQiOjE3ODE5ODc2NjAuMTcxOTc0LCJuYmYiOjE3ODE5ODc2NjAuMTcxOTc2LCJleHAiOjE4MTM1MjM2NjAuMTU5NTc1LCJzdWIiOiJhMjEyMWU2OC00YWY4LTQzYjQtOGZkMS0yODQwOTk2MmNjY2YiLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY29tcGFuaWVzLXdyaXRlIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.EvDBnI6tAnPNrN9zMdVtvfrvQ4TlqwNPd8sOtqFWUeWYIIMPreZXZaSazxjSbWzp9QD1-kF1VSpN60nz7J0APYq2__mHmfS4J28bO64yI-_VUQkjuJJ9SM3DAh1Bop31tbZhWoEf9lJezFKNX5q0L13bKw02Saxo08j3XshpJFr7ZTqtZ_jit03uMoU7ZLbWkw8EKZjSg0pfe75xZD3A4k0Ve72hZGJI1alTlPcHVzLfbts1RusWEdguRK_fYgtczVINyeDjL6kRY2nas6nlzv7BXtQ4rU67GtXiuFuN4BgdrVNIozXQV_3cVCHYV8gQB1bsQ7SIdMp0yDRt6BQn1s1xiapKfAa6bSIfq5sTm01sOUEHMOUxL7E_UV2UGvEvmRRWrqNFBC3P-r4R_iIjucR0-ckCjhO9GaAhhFbek2XxJlLFpY9b0MALN9HNDNrD_4h-ttF_-OUz4SBkqF_crWA9702uoFy7rwU8xFM6xbGXkAvKHir8o9330mwxFCGLsbMeSAoXUnje9kbHDckEBHuE-sL5PvJEYBRZ0b8LVaT-pp6qFejlYBGHsMLHIsRR2OqVGVZT7mWFW-3InyytWWup00SEojMnIDlOVAUVpQj0crvKGyFPOs0W6e6efxOu2dOp7Ra-udCZ82PO2Rc4nVdh2MDeuTU5nLot0IVNj8o";

// Testar com CEP de Bocaiuva do Sul: 83458890
const payload = JSON.stringify({
  from: { postal_code: "83458890" },
  to: { postal_code: "01310100" },
  products: [
    {
      id: "produto",
      height: 2,
      width: 20,
      length: 30,
      weight: 0.2,
      insurance_value: 79.90,
      quantity: 1
    }
  ],
  options: { receipt: false, own_hand: false },
  services: "1,2,18"
});

console.log('Testando com CEP 83458890 (Bocaiuva do Sul-PR)...');

const options = {
  hostname: 'melhorenvio.com.br',
  path: '/api/v2/me/shipment/calculate',
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'ATTOS2 (contato@attos2.com.br)',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Resposta:', body);
  });
});

req.on('error', (e) => console.error('Erro:', e.message));
req.write(payload);
req.end();
