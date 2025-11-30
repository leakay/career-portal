const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = getFirestore();

// Test company names that were added
const testCompanyNames = [
  'TechCorp Solutions',
  'Lesotho Financial Services',
  'GreenTech Innovations',
  'EduTech Lesotho',
  'Logistics Plus'
];

async function removeTestCompanies() {
  try {
    console.log('Removing test companies from database...');

    // Get all companies
    const snapshot = await db.collection('companies').get();

    let removedCount = 0;

    for (const doc of snapshot.docs) {
      const companyData = doc.data();
      const companyName = companyData.companyName || companyData.name;

      // Check if this is one of our test companies
      if (testCompanyNames.includes(companyName)) {
        await db.collection('companies').doc(doc.id).delete();
        console.log(`🗑️ Removed test company: ${companyName} (ID: ${doc.id})`);
        removedCount++;
      }
    }

    console.log(`\n✅ Removed ${removedCount} test companies.`);
    console.log('Only your real registered companies should now appear in Company Management.');

  } catch (error) {
    console.error('❌ Error removing test companies:', error);
  }
}

removeTestCompanies().then(() => process.exit(0));
