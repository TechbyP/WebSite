// adminScript.ts
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

const uid = process.env.USER1_UID; // e.g., get this from Firebase Auth

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Custom claim set: admin');
  })
  .catch(console.error);
