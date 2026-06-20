const https = require('https');

function firestorePatch(uid, nome) {
  return new Promise((resolve, reject) => {
    const path = '/v1/projects/attos2-c2644/databases/(default)/documents/admins/' + uid + '?updateMask.fieldPaths=nome';
    const body = JSON.stringify({ fields: { nome: { stringValue: nome } } });

    const options = {
      hostname: 'firestore.googleapis.com',
      path: path,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({ error: data }); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  const updates = [
    { uid: 'UdeYhgGfPkhfIbsg11aj46QWRrO2', nome: 'Cleverson Hoffmann' },
    { uid: 'Zs9asJkugWeVvBUg8bw8VHvRIbm1', nome: 'Alykson Souza' },
    { uid: 'oUkGPCU6Ueebo0xxG2neejBqgtp1', nome: 'Leo Mackenzie' }
  ];

  for (const u of updates) {
    try {
      const data = await firestorePatch(u.uid, u.nome);
      console.log(u.nome + ': ' + (data.name || JSON.stringify(data.error || data)));
    } catch (err) {
      console.error(u.nome + ': ERRO - ' + err.message);
    }
  }
  console.log('Pronto!');
}

run().catch(console.error);
