/**
 * set-admin.js
 * Sets a user as admin in Firestore
 * Usage: node scripts/set-admin.js <user-email>
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '../.firebase/serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://e-commerce-frontend1.firebaseio.com'
  });
} catch (err) {
  console.error('Error: Service account key not found at:', serviceAccountPath);
  console.error('Please download it from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Please provide a user email: node scripts/set-admin.js <user-email>');
  process.exit(1);
}

async function setAdmin() {
  try {
    const db = admin.firestore();
    
    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', userEmail).get();
    
    if (snapshot.empty) {
      console.error(`User with email "${userEmail}" not found`);
      process.exit(1);
    }
    
    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;
    
    // Update role to admin
    await usersRef.doc(userId).update({
      role: 'admin'
    });
    
    console.log(`✅ User "${userEmail}" (${userId}) has been set as admin`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setAdmin();
