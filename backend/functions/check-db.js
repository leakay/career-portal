const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = getFirestore();

async function checkApplications() {
  try {
    console.log('Checking jobApplications collection...');
    const snapshot = await db.collection('jobApplications').get();
    console.log(`Found ${snapshot.size} applications`);

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Application ${doc.id}:`, {
        jobId: data.jobId,
        companyId: data.companyId,
        studentId: data.studentId,
        status: data.status,
        appliedAt: data.appliedAt?.toDate?.() || data.appliedAt
      });
    });

    console.log('\nChecking jobs collection...');
    const jobsSnapshot = await db.collection('jobs').get();
    console.log(`Found ${jobsSnapshot.size} jobs`);

    jobsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Job ${doc.id}:`, {
        title: data.title,
        companyId: data.companyId,
        status: data.status,
        applications: data.applications || 0
      });
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkApplications();
