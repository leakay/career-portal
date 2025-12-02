const admin = require('firebase-admin');
const serviceAccount = require('./backend/functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();
const auth = admin.auth();

async function addSampleInstituteUser() {
  try {
    console.log('Adding sample institute user...');

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: 'institute@limkokwing.ac.ls',
      password: 'institute123',
      displayName: 'Limkokwing Institute Admin'
    });

    console.log('Created user in Auth:', userRecord.uid);

    // Add user profile to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: 'institute@limkokwing.ac.ls',
      name: 'Limkokwing Institute Admin',
      role: 'institution',
      institutionId: 'limkokwing', // This should match an existing institution
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Added user profile to Firestore');

    // Try to find the Limkokwing institution
    const institutionsRef = db.collection('institutions');
    const snapshot = await institutionsRef.where('code', '==', 'LKUCT').get();

    if (!snapshot.empty) {
      const institutionDoc = snapshot.docs[0];
      console.log('Found Limkokwing institution:', institutionDoc.id);

      // Update user with correct institutionId
      await db.collection('users').doc(userRecord.uid).update({
        institutionId: institutionDoc.id
      });

      console.log('Updated user with correct institution ID');
    } else {
      console.log('Limkokwing institution not found, using default ID');
    }

    console.log('Sample institute user created successfully!');
    console.log('Email: institute@limkokwing.ac.ls');
    console.log('Password: institute123');

    process.exit(0);
  } catch (error) {
    console.error('Error adding institute user:', error);
    process.exit(1);
  }
}

addSampleInstituteUser();
