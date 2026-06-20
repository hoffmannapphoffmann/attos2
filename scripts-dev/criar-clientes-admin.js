const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "attos2-c2644",
    "private_key_id": "2e7e7a6e1e",
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": "firebase-adminsdk-fbsvc@attos2-c2644.iam.gserviceaccount.com",
    "client_id": "1021391388902",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40attos2-c2644.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  })
});

const db = admin.firestore();

async function run() {
  const users = [
    { uid: 'UdeYhgGfPkhfIbsg11aj46QWRrO2', nome: 'Cleverson Hoffmann', email: 'cleverson@attos2.com.br' },
    { uid: 'Zs9asJkugWeVvBUg8bw8VHvRIbm1', nome: 'Alykson Silva', email: 'alykson@attos2.com.br' },
    { uid: 'oUkGPCU6Ueebo0xxG2neejBqgtp1', nome: 'Leonardo Santos', email: 'leo@attos2.com.br' }
  ];
  for (const u of users) {
    await db.collection('clientes').doc(u.uid).set({
      nome: u.nome,
      email: u.email,
      telefone: '',
      enderecos: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('OK: ' + u.nome);
  }
  console.log('Pronto!');
}

run().catch(console.error);
