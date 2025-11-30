const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = getFirestore();

async function checkCompanies() {
  try {
    console.log('Checking companies in database...');
    const snapshot = await db.collection('companies').get();
    console.log(`Found ${snapshot.size} companies in database:`);

    if (snapshot.size === 0) {
      console.log('No companies found. You may need to add some test data.');
    } else {
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`Company ID: ${doc.id}`);
        console.log(`  Name: ${data.companyName || data.name || 'N/A'}`);
        console.log(`  Email: ${data.contactEmail || data.email || 'N/A'}`);
        console.log(`  Status: ${data.status || 'pending'}`);
        console.log(`  Location: ${data.location || 'N/A'}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error checking companies:', error);
  }
}

checkCompanies().then(() => process.exit(0));
