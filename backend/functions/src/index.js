const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body Parsing Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import Controllers (updated for Firebase)
const authController = require('./controllers/authController');
const studentController = require('./controllers/studentController');
const instController = require('./controllers/instituteController');
const compController = require('./controllers/companyController');
const adminController = require('./controllers/adminController');

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Firebase Firestore'
  });
});

// Firebase Authentication Middleware
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    req.user.uid = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Optional: Role-based middleware
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Get user role from Firestore
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      if (!userDoc.exists) {
        return res.status(403).json({ error: 'User not found' });
      }

      const userData = userDoc.data();
      if (!roles.includes(userData.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user.role = userData.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// API Routes

// Auth Routes
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/logout', authController.logout);
app.post('/auth/refresh', authController.refreshToken);
app.get('/auth/verify', authenticateFirebaseToken, authController.verifyToken);

// Student Routes (Protected)
app.get('/student/applications', authenticateFirebaseToken, requireRole(['student', 'admin']), studentController.getApplications);
app.post('/student/applications', authenticateFirebaseToken, requireRole(['student']), studentController.submitApplication);
app.put('/student/applications/:id', authenticateFirebaseToken, requireRole(['student']), studentController.updateApplication);
app.delete('/student/applications/:id', authenticateFirebaseToken, requireRole(['student']), studentController.deleteApplication);
app.get('/student/profile', authenticateFirebaseToken, requireRole(['student', 'admin']), studentController.getProfile);
app.put('/student/profile', authenticateFirebaseToken, requireRole(['student']), studentController.updateProfile);

// Institution Routes
app.get('/institutions', instController.getInstitutions);
app.post('/institutions', authenticateFirebaseToken, requireRole(['admin', 'institution']), instController.createInstitution);
app.get('/institutions/:id', instController.getInstitutionById);
app.put('/institutions/:id', authenticateFirebaseToken, requireRole(['admin', 'institution']), instController.updateInstitution);
app.delete('/institutions/:id', authenticateFirebaseToken, requireRole(['admin']), instController.deleteInstitution);
app.get('/institutions/:id/courses', instController.getInstitutionCourses);

// Faculty Routes
app.get('/institutions/:institutionId/faculties', instController.getFaculties);
app.post('/institutions/:institutionId/faculties', authenticateFirebaseToken, requireRole(['admin', 'institution']), instController.addFaculty);
app.put('/faculties/:id', authenticateFirebaseToken, requireRole(['admin', 'institution']), instController.updateFaculty);
app.delete('/faculties/:id', authenticateFirebaseToken, requireRole(['admin', 'institution']), instController.deleteFaculty);

// Company Routes
app.get('/api/company/jobs', authenticateFirebaseToken, requireRole(['company', 'admin']), compController.getJobs);
app.post('/api/company/jobs', authenticateFirebaseToken, requireRole(['company', 'admin']), compController.createJob);
app.get('/api/company/jobs/:id', authenticateFirebaseToken, requireRole(['company', 'admin']), compController.getJobById);
app.put('/api/company/jobs/:id', authenticateFirebaseToken, requireRole(['company', 'admin']), compController.updateJob);
app.delete('/api/company/jobs/:id', authenticateFirebaseToken, requireRole(['company', 'admin']), compController.deleteJob);
app.get('/api/company/applicants/:jobId', authenticateFirebaseToken, requireRole(['company', 'admin']), compController.getJobApplicants);
app.get('/api/company/applicant/:applicantId', authenticateFirebaseToken, requireRole(['company', 'admin']), compController.getApplicantDetails);
app.post('/api/company/interview', authenticateFirebaseToken, requireRole(['company', 'admin']), compController.scheduleInterview);
app.get('/api/company/stats', authenticateFirebaseToken, requireRole(['company', 'admin']), compController.getCompanyStats);
app.get('/api/company/profile', authenticateFirebaseToken, requireRole(['company', 'admin']), compController.getCompanyProfile);
app.put('/api/company/profile', authenticateFirebaseToken, requireRole(['company', 'admin']), compController.updateCompanyProfile);
app.get('/companies', compController.getCompanies);
app.post('/companies', authenticateFirebaseToken, requireRole(['admin']), compController.createCompany);

// Admin Routes (Protected - Admin only)
app.get('/admin/overview', authenticateFirebaseToken, requireRole(['admin']), adminController.getOverview);
app.get('/admin/users', authenticateFirebaseToken, requireRole(['admin']), adminController.getUsers);
app.get('/admin/statistics', authenticateFirebaseToken, requireRole(['admin']), adminController.getStatistics);
app.put('/admin/users/:id/status', authenticateFirebaseToken, requireRole(['admin']), adminController.updateUserStatus);

// 404 Handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handling Middleware
app.use((error, req, res, next) => {
  console.error('🚨 Error Stack:', error.stack);
  
  // Firebase errors
  if (error.code === 'auth/email-already-exists') {
    return res.status(400).json({
      error: 'Email already exists'
    });
  }
  
  if (error.code === 'auth/invalid-email') {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }
  
  if (error.code === 'auth/user-not-found') {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  if (error.code === 'auth/wrong-password') {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }

  // Firestore errors
  if (error.code === 'permission-denied') {
    return res.status(403).json({
      error: 'Permission denied'
    });
  }

  if (error.code === 'not-found') {
    return res.status(404).json({
      error: 'Resource not found'
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: Firebase Firestore`);
  console.log(`🔐 Auth: Firebase Authentication`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
