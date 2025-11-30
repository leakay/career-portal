const { auth, db } = require('../config/firebase');

exports.register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });
    
    // Create user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: userRecord.uid
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  // Firebase Auth login logic
  res.json({ message: 'Login endpoint' });
};