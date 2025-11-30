const admin = require('../config/firebase-admin');

module.exports = {
  // Verify Firebase ID token
  verifyFirebaseToken: async (idToken) => {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return {
        success: true,
        user: decodedToken
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Create custom token for specific user
  createCustomToken: async (uid, additionalClaims = {}) => {
    try {
      const token = await admin.auth().createCustomToken(uid, additionalClaims);
      return {
        success: true,
        token
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get user by UID
  getUserByUid: async (uid) => {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return {
        success: true,
        user: userRecord
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Update user claims (roles/permissions)
  setCustomUserClaims: async (uid, claims) => {
    try {
      await admin.auth().setCustomUserClaims(uid, claims);
      return {
        success: true,
        message: 'Custom claims updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Create user in Firebase Auth
  createFirebaseUser: async (userData) => {
    try {
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.name,
        disabled: false
      });

      return {
        success: true,
        user: userRecord
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};