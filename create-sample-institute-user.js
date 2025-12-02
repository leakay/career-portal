const admin = require('firebase-admin');
const serviceAccount = require('./backend/functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();
const auth = admin.auth();

async function createSampleInstituteUser() {
  try {
    console.log('Creating sample institute user...');

    // First, check if institutions exist
    const institutionsSnapshot = await db.collection('institutions').get();

    if (institutionsSnapshot.empty) {
      console.log('No institutions found. Please run add-sample-institutions.js first.');
      return;
    }

    // Get the first institution
    const institutionDoc = institutionsSnapshot.docs[0];
    const institutionData = institutionDoc.data();

    console.log(`Using institution: ${institutionData.name} (${institutionDoc.id})`);

    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail('institute@limkokwing.ac.ls');
      console.log('User already exists, updating profile...');

      // Update user profile in Firestore
      await db.collection('users').doc(existingUser.uid).set({
        email: 'institute@limkokwing.ac.ls',
        name: 'Limkokwing Institute Admin',
        role: 'institution',
        institutionId: institutionDoc.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Institute user profile updated successfully!');
      console.log('Email: institute@limkokwing.ac.ls');
      console.log('Password: institute123 (if newly created)');

    } catch (error) {
      // User doesn't exist, create new one
      console.log('Creating new institute user...');

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
        institutionId: institutionDoc.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Institute user created successfully!');
      console.log('Email: institute@limkokwing.ac.ls');
      console.log('Password: institute123');
    }

    // Add some sample faculties for testing
    console.log('Adding sample faculties...');

    const sampleFaculties = [
      {
        institutionId: institutionDoc.id,
        name: 'Faculty of Information Technology',
        code: 'FIT',
        description: 'Computer Science, Software Engineering, and IT courses',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        institutionId: institutionDoc.id,
        name: 'Faculty of Business',
        code: 'BUS',
        description: 'Business Administration, Marketing, and Finance courses',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        institutionId: institutionDoc.id,
        name: 'Faculty of Design',
        code: 'DES',
        description: 'Graphic Design, Multimedia, and Creative Arts courses',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const faculty of sampleFaculties) {
      const facultyRef = await db.collection('faculties').add(faculty);
      console.log(`Added faculty: ${faculty.name} (${facultyRef.id})`);
    }

    console.log('✅ Sample faculties added successfully!');
    console.log('\n🎉 Setup complete! You can now login with:');
    console.log('Email: institute@limkokwing.ac.ls');
    console.log('Password: institute123');

  } catch (error) {
    console.error('❌ Error creating sample institute user:', error);
    process.exit(1);
  }
}

createSampleInstituteUser();
