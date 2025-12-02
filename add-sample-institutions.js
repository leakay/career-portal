const admin = require('firebase-admin');
const serviceAccount = require('./backend/functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

async function addSampleInstitutions() {
  try {
    const institutions = [
      {
        name: 'Limkokwing University of Creative Technology',
        code: 'LKUCT',
        type: 'University',
        location: 'Maseru, Lesotho',
        contactEmail: 'admissions@limkokwing.ac.ls',
        description: 'Leading creative technology university in Southern Africa',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'National University of Lesotho',
        code: 'NUL',
        type: 'University',
        location: 'Roma, Lesotho',
        contactEmail: 'admissions@nul.ls',
        description: 'Premier national university of Lesotho',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lesotho College of Education',
        code: 'LCE',
        type: 'College',
        location: 'Maseru, Lesotho',
        contactEmail: 'admissions@lce.edu.ls',
        description: 'Teacher training institution',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log('Adding sample institutions...');
    for (const institution of institutions) {
      const docRef = await db.collection('institutions').add(institution);
      console.log(`Added institution: ${institution.name} with ID: ${docRef.id}`);
    }

    console.log('Sample institutions added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding institutions:', error);
    process.exit(1);
  }
}

addSampleInstitutions();
