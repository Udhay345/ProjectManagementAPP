const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// You will need to download your Firebase Admin SDK private key JSON file 
// from the Firebase Console (Project Settings -> Service Accounts -> Generate new private key)
// and save it as 'serviceAccountKey.json' in the firebase-backend folder.

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully.');
} else {
  console.warn('WARNING: serviceAccountKey.json not found! Firebase operations will fail.');
  console.warn('Please generate it from Firebase Console -> Project Settings -> Service Accounts.');
}

const db = admin.firestore ? admin.firestore() : null;

module.exports = { admin, db };
