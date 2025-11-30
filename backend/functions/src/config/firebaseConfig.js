const { db } = require('../config/firebase');

const setupFirebaseCollections = async () => {
  try {
    // Create initial collections with sample data structure
    const collections = ['users', 'applications', 'jobs', 'companies', 'institutions', 'courses'];
    
    for (const collection of collections) {
      const checkDoc = await db.collection(collection).limit(1).get();
      console.log(`✅ ${collection} collection: ${checkDoc.empty ? 'Empty' : 'Has data'}`);
    }
    
    console.log('🎉 Firebase collections setup completed!');
  } catch (error) {
    console.error('❌ Firebase setup error:', error);
  }
};

setupFirebaseCollections();