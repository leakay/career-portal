const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Load service account
const serviceAccount = require('./serviceAccountKey.json');

let db;
try {
  console.log('Initializing Firebase with project:', serviceAccount.project_id);
  
  // Initialize Firebase Admin
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });

  db = getFirestore();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('Please make sure serviceAccountKey.json exists in the functions folder');
  process.exit(1);
}

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.collection('applications').limit(1).get();
    
    res.json({
      status: 'OK',
      firebase: 'Connected',
      timestamp: new Date().toISOString(),
      projectId: serviceAccount.project_id
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      firebase: 'Disconnected',
      error: error.message
    });
  }
});

// ==================== INSTITUTIONS MANAGEMENT ====================

// Get all institutions
app.get('/institutions', async (req, res) => {
  try {
    console.log('Fetching all institutions...');
    const snapshot = await db.collection('institutions').get();
    
    const institutions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${institutions.length} institutions`);
    res.json({
      success: true,
      data: institutions
    });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add new institution
app.post('/institutions', async (req, res) => {
  try {
    const { name, code, type, location, contactEmail, description } = req.body;
    
    console.log('Adding new institution:', { name, code, type });
    
    // Check if institution with same code already exists
    const existingInstitution = await db.collection('institutions')
      .where('code', '==', code.toUpperCase())
      .get();
    
    if (!existingInstitution.empty) {
      return res.status(400).json({
        success: false,
        error: 'Institution with this code already exists'
      });
    }

    const institutionData = {
      name,
      code: code.toUpperCase(),
      type,
      location,
      contactEmail,
      description: description || '',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('institutions').add(institutionData);
    
    res.json({
      success: true,
      message: 'Institution added successfully',
      data: {
        id: docRef.id,
        ...institutionData
      }
    });
  } catch (error) {
    console.error('Error adding institution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update institution
app.put('/institutions/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    console.log(`Updating institution ${institutionId}:`, updateData);
    
    await db.collection('institutions').doc(institutionId).update(updateData);
    
    res.json({
      success: true,
      message: 'Institution updated successfully'
    });
  } catch (error) {
    console.error('Error updating institution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete institution
app.delete('/institutions/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    
    console.log(`Deleting institution: ${institutionId}`);
    
    await db.collection('institutions').doc(institutionId).delete();
    
    res.json({
      success: true,
      message: 'Institution deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting institution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== FACULTIES MANAGEMENT ====================

// Get faculties by institution
app.get('/institutions/:institutionId/faculties', async (req, res) => {
  try {
    const { institutionId } = req.params;
    
    console.log(`Fetching faculties for institution: ${institutionId}`);
    
    const snapshot = await db.collection('faculties')
      .where('institutionId', '==', institutionId)
      .get();
    
    const faculties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${faculties.length} faculties`);
    res.json({
      success: true,
      data: faculties
    });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add faculty to institution
app.post('/institutions/:institutionId/faculties', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { name, description, code } = req.body;

    console.log(`Adding faculty to institution ${institutionId}:`, { name, code });

    const facultyData = {
      institutionId,
      name,
      code: code.toUpperCase(),
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('faculties').add(facultyData);

    res.json({
      success: true,
      message: 'Faculty added successfully',
      data: {
        id: docRef.id,
        ...facultyData
      }
    });
  } catch (error) {
    console.error('Error adding faculty:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update faculty
app.put('/faculties/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    console.log(`Updating faculty ${facultyId}:`, updateData);

    // Check if faculty exists
    const facultyDoc = await db.collection('faculties').doc(facultyId).get();
    if (!facultyDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Faculty not found'
      });
    }

    await db.collection('faculties').doc(facultyId).update(updateData);

    res.json({
      success: true,
      message: 'Faculty updated successfully'
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete faculty
app.delete('/faculties/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;

    console.log(`Deleting faculty: ${facultyId}`);

    // Check if faculty exists
    const facultyDoc = await db.collection('faculties').doc(facultyId).get();
    if (!facultyDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Faculty not found'
      });
    }

    await db.collection('faculties').doc(facultyId).delete();

    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== COURSES MANAGEMENT ====================

// Get all available courses
app.get('/courses', async (req, res) => {
  try {
    console.log('Fetching all available courses...');

    const snapshot = await db.collection('courses')
      .where('status', '==', 'active')
      .get();

    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get institution names for each course
    const coursesWithInstitutions = await Promise.all(
      courses.map(async (course) => {
        try {
          const institutionDoc = await db.collection('institutions').doc(course.institutionId).get();
          const institutionName = institutionDoc.exists ? institutionDoc.data().name : 'Unknown Institution';

          return {
            ...course,
            institutionName
          };
        } catch (error) {
          console.error(`Error fetching institution for course ${course.id}:`, error);
          return {
            ...course,
            institutionName: 'Unknown Institution'
          };
        }
      })
    );

    console.log(`Found ${coursesWithInstitutions.length} available courses`);
    res.json({
      success: true,
      data: coursesWithInstitutions
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get courses by faculty
app.get('/faculties/:facultyId/courses', async (req, res) => {
  try {
    const { facultyId } = req.params;

    console.log(`Fetching courses for faculty: ${facultyId}`);

    const snapshot = await db.collection('courses')
      .where('facultyId', '==', facultyId)
      .get();

    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${courses.length} courses`);
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add course to faculty
app.post('/faculties/:facultyId/courses', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { name, code, duration, requirements, description, capacity } = req.body;

    console.log(`Adding course to faculty ${facultyId}:`, { name, code });

    const courseData = {
      facultyId,
      name,
      code: code.toUpperCase(),
      duration: duration || '4 years',
      requirements: requirements || '',
      description: description || '',
      capacity: capacity || 100,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('courses').add(courseData);

    res.json({
      success: true,
      message: 'Course added successfully',
      data: {
        id: docRef.id,
        ...courseData
      }
    });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update course
app.put('/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    console.log(`Updating course ${courseId}:`, updateData);

    // Check if course exists
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    await db.collection('courses').doc(courseId).update(updateData);

    res.json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== COMPANIES MANAGEMENT ====================

// Get all companies (from users collection where role is 'company')
app.get('/companies', async (req, res) => {
  try {
    const { status } = req.query;

    console.log('Fetching companies with status:', status);

    let query = db.collection('users').where('role', '==', 'company');

    const snapshot = await query.get();

    // Get jobs count and company profile for each company user
    const companiesWithJobsCount = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const userData = doc.data();

        try {
          // Count active jobs for this company (using employer field)
          const jobsSnapshot = await db.collection('jobs')
            .where('employer', '==', doc.id)
            .where('status', '==', 'active')
            .get();

          // Get company profile if it exists
          let companyProfile = {};
          try {
            const companyDoc = await db.collection('companies').doc(doc.id).get();
            if (companyDoc.exists) {
              companyProfile = companyDoc.data();
            }
          } catch (profileError) {
            console.log(`No company profile found for ${doc.id}`);
          }

          return {
            id: doc.id,
            name: userData.companyName || userData.name || 'N/A',
            email: userData.email || 'N/A',
            status: companyProfile.status || userData.status || 'pending',
            jobsPosted: jobsSnapshot.size,
            createdAt: userData.createdAt || companyProfile.createdAt,
            industry: companyProfile.industry || 'N/A',
            location: companyProfile.location || 'N/A',
            website: companyProfile.website || 'N/A',
            description: companyProfile.description || 'N/A'
          };
        } catch (error) {
          console.error(`Error fetching data for company ${doc.id}:`, error);
          return {
            id: doc.id,
            name: userData.companyName || userData.name || 'N/A',
            email: userData.email || 'N/A',
            status: userData.status || 'pending',
            jobsPosted: 0,
            createdAt: userData.createdAt,
            industry: 'N/A',
            location: 'N/A',
            website: 'N/A',
            description: 'N/A'
          };
        }
      })
    );

    // Filter by status if provided
    let filteredCompanies = companiesWithJobsCount;
    if (status) {
      filteredCompanies = companiesWithJobsCount.filter(company => company.status === status);
    }

    console.log(`Found ${filteredCompanies.length} companies`);
    res.json({
      success: true,
      data: filteredCompanies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Company authentication middleware
const verifyCompanyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required"
      });
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({
        success: false,
        error: "Invalid token"
      });
    }

    const userId = decodedToken.uid;

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        error: "User not found"
      });
    }

    const userData = userDoc.data();

    // Check if user is a company
    if (userData.role !== 'company') {
      return res.status(403).json({
        success: false,
        error: "Access denied. Company role required."
      });
    }

    // Get company data if it exists
    const companyId = userData.companyId || userId;
    const companyDoc = await db.collection('companies').doc(companyId).get();

    req.company = {
      id: companyId,
      userId: userId,
      exists: companyDoc.exists,
      ...userData
    };

    if (companyDoc.exists) {
      const company = companyDoc.data();
      // Check if approved
      if (company.status !== 'approved') {
        return res.status(401).json({
          success: false,
          error: "Company account not approved"
        });
      }
      req.company = {
        ...req.company,
        ...company
      };
    }

    next();
  } catch (error) {
    console.error('Company token verification error:', error);
    return res.status(401).json({
      success: false,
      error: "Authentication failed"
    });
  }
};

// Get company profile
app.get('/api/company/profile', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required'
      });
    }

    console.log('Fetching company profile for user:', userId);

    // Get user data to find company
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    if (userData.role !== 'company') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Company role required.'
      });
    }

    const companyId = userData.companyId || userId;
    const companyDoc = await db.collection('companies').doc(companyId).get();

    // If company profile doesn't exist, create it
    if (!companyDoc.exists) {
      console.log('Company profile not found, creating new profile...');

      const companyData = {
        companyName: userData.companyName || '',
        industry: '',
        size: '',
        website: '',
        description: '',
        contactEmail: userData.email || '',
        phone: '',
        address: '',
        foundedYear: '',
        benefits: '',
        culture: '',
        logo: '',
        linkedin: '',
        twitter: '',
        facebook: '',
        status: 'pending', // Set to pending initially, admin needs to approve
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('companies').doc(companyId).set(companyData);

      // Update user with companyId
      await db.collection('users').doc(userId).update({
        companyId: companyId,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        data: {
          id: companyId,
          ...companyData
        }
      });
    } else {
      const company = companyDoc.data();
      res.json({
        success: true,
        data: {
          id: companyId,
          ...company
        }
      });
    }
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



// Update company profile
app.put('/api/company/profile', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required'
      });
    }

    // Get user data to find company
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    if (userData.role !== 'company') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Company role required.'
      });
    }

    const companyId = userData.companyId || userId;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    console.log(`Updating company profile ${companyId}:`, updateData);

    await db.collection('companies').doc(companyId).update(updateData);

    res.json({
      success: true,
      message: 'Company profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get company dashboard stats (no authentication required)
app.get('/api/company/stats', async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'companyId query parameter is required'
      });
    }

    console.log(`Fetching stats for company: ${companyId}`);

    // Get jobs count
    const jobsSnapshot = await db.collection('jobs')
      .where('companyId', '==', companyId)
      .where('status', '==', 'active')
      .get();

    // Get applications count
    const applicationsSnapshot = await db.collection('jobApplications')
      .where('companyId', '==', companyId)
      .get();

    const applications = applicationsSnapshot.docs.map(doc => doc.data());

    const stats = {
      jobs: jobsSnapshot.size,
      applicants: applicationsSnapshot.size,
      interviews: applications.filter(app => app.status === 'interview').length,
      offers: applications.filter(app => app.status === 'accepted').length
    };

    console.log('Company stats:', stats);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update company status (approve, suspend, delete)
app.patch('/companies/:companyId/status', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.body;

    console.log(`Updating company ${companyId} status to: ${status}`);

    // First check if user exists and is a company
    const userDoc = await db.collection('users').doc(companyId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    const userData = userDoc.data();

    if (userData.role !== 'company') {
      return res.status(400).json({
        success: false,
        error: 'User is not a company'
      });
    }

    const updateData = {
      status: status,
      updatedAt: new Date()
    };

    // If approving, set approved date
    if (status === 'approved') {
      updateData.approvedAt = new Date();
    }

    // Update or create company profile (primary storage for status)
    try {
      const companyProfileData = {
        companyName: userData.companyName || userData.name || '',
        industry: '',
        size: '',
        website: '',
        description: '',
        contactEmail: userData.email || '',
        phone: '',
        address: '',
        foundedYear: '',
        benefits: '',
        culture: '',
        logo: '',
        linkedin: '',
        twitter: '',
        facebook: '',
        status: status,
        userId: companyId,
        createdAt: new Date(),
        updatedAt: new Date(),
        approvedAt: status === 'approved' ? new Date() : null
      };

      // Use set with merge to update existing or create new
      await db.collection('companies').doc(companyId).set(companyProfileData, { merge: true });
      console.log(`Updated/created company profile for ${companyId}`);
    } catch (profileError) {
      console.error(`Error updating company profile for ${companyId}:`, profileError);
      // Continue with user update even if profile update fails
    }

    // Also update user document for consistency
    try {
      await db.collection('users').doc(companyId).update({
        status: status,
        updatedAt: new Date()
      });
      console.log(`Updated user status for ${companyId}`);
    } catch (userError) {
      console.error(`Error updating user status for ${companyId}:`, userError);
      // This is critical, so if user update fails, we should fail the whole operation
      throw userError;
    }

    res.json({
      success: true,
      message: `Company status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete company
app.delete('/companies/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;

    console.log(`Deleting company: ${companyId}`);

    // Check if company exists
    const companyDoc = await db.collection('companies').doc(companyId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Delete the company document
    await db.collection('companies').doc(companyId).delete();

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ADMISSIONS MANAGEMENT ====================

// Publish admissions for institution
app.post('/institutions/:institutionId/publish-admissions', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { academicYear, deadline } = req.body;

    console.log(`Publishing admissions for institution ${institutionId}`);

    // Find institution by ID, code, or name
    let institutionDoc;
    let institutionIdToUse = institutionId;

    // First try to find by document ID
    const docById = await db.collection('institutions').doc(institutionId).get();
    if (docById.exists) {
      institutionDoc = docById;
    } else {
      // Try to find by code
      const docByCode = await db.collection('institutions')
        .where('code', '==', institutionId.toUpperCase())
        .get();

      if (!docByCode.empty) {
        institutionDoc = docByCode.docs[0];
        institutionIdToUse = institutionDoc.id;
      } else {
        // Try to find by name (case insensitive)
        const docByName = await db.collection('institutions')
          .where('name', '>=', institutionId)
          .where('name', '<=', institutionId + '\uf8ff')
          .get();

        if (!docByName.empty) {
          institutionDoc = docByName.docs[0];
          institutionIdToUse = institutionDoc.id;
        }
      }
    }

    if (!institutionDoc) {
      return res.status(404).json({
        success: false,
        error: `Institution not found: ${institutionId}`
      });
    }

    const admissionData = {
      institutionId: institutionIdToUse,
      academicYear: academicYear || new Date().getFullYear(),
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      status: 'published',
      publishedAt: new Date(),
      createdAt: new Date()
    };

    await db.collection('admissions').add(admissionData);

    // Update institution to show admissions are published
    await db.collection('institutions').doc(institutionIdToUse).update({
      admissionsPublished: true,
      admissionsUpdatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Admissions published successfully'
    });
  } catch (error) {
    console.error('Error publishing admissions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Publish admission decisions for approved applications
app.post('/institutions/:institutionId/publish-admissions-decisions', async (req, res) => {
  try {
    const { institutionId } = req.params;
    const { applicationIds } = req.body;

    console.log(`Publishing admission decisions for institution ${institutionId}, applications:`, applicationIds);

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'applicationIds array is required and cannot be empty'
      });
    }

    // Verify that all applications belong to this institution and are approved
    const batch = db.batch();
    let publishedCount = 0;

    for (const applicationId of applicationIds) {
      const applicationDoc = await db.collection('applications').doc(applicationId).get();

      if (!applicationDoc.exists) {
        console.log(`Application ${applicationId} not found, skipping`);
        continue;
      }

      const application = applicationDoc.data();

      // Verify the application belongs to this institution and is approved
      if (application.institutionId === institutionId && application.status === 'approved') {
        batch.update(applicationDoc.ref, {
          admissionPublished: true,
          admissionPublishedAt: new Date(),
          updatedAt: new Date()
        });
        publishedCount++;
      } else {
        console.log(`Application ${applicationId} does not belong to institution ${institutionId} or is not approved, skipping`);
      }
    }

    if (publishedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid approved applications found to publish'
      });
    }

    await batch.commit();

    console.log(`Successfully published ${publishedCount} admission decisions`);

    res.json({
      success: true,
      message: `Successfully published ${publishedCount} admission decisions`,
      publishedCount: publishedCount
    });
  } catch (error) {
    console.error('Error publishing admission decisions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== SYSTEM REPORTS ====================

// Get system statistics
app.get('/admin/stats', async (req, res) => {
  try {
    console.log('Generating system statistics...');
    
    // Get counts from all collections
    const [
      applicationsSnapshot,
      institutionsSnapshot,
      companiesSnapshot,
      usersSnapshot
    ] = await Promise.all([
      db.collection('applications').get(),
      db.collection('institutions').get(),
      db.collection('companies').get(),
      db.collection('users').get()
    ]);

    const applications = applicationsSnapshot.docs.map(doc => doc.data());
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const approvedApplications = applications.filter(app => app.status === 'approved').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

    const companies = companiesSnapshot.docs.map(doc => doc.data());
    const pendingCompanies = companies.filter(company => company.status === 'pending').length;
    const activeCompanies = companies.filter(company => company.status === 'approved').length;
    const suspendedCompanies = companies.filter(company => company.status === 'suspended').length;

    const stats = {
      totalUsers: usersSnapshot.size,
      totalInstitutions: institutionsSnapshot.size,
      totalCompanies: companiesSnapshot.size,
      totalApplications: applicationsSnapshot.size,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      pendingCompanies,
      activeCompanies,
      suspendedCompanies
    };

    console.log('System stats generated:', stats);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error generating system stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== EXISTING APPLICATION ENDPOINTS (KEEP THESE) ====================

// Get ALL applications
app.get('/applications', async (req, res) => {
  try {
    console.log('Fetching all applications...');
    const snapshot = await db.collection('applications').get();
    
    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${applications.length} applications`);
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get applications by institute
app.get('/applications/institute/:instituteId', async (req, res) => {
  try {
    const { instituteId } = req.params;
    console.log(`Fetching applications for institute: ${instituteId}`);
    
    const snapshot = await db
      .collection('applications')
      .where('institutionId', '==', instituteId)
      .get();
    
    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${applications.length} applications for institute ${instituteId}`);
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications by institute:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get applications by institution
app.get('/applications/institution/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    console.log(`Fetching applications for institution: ${institutionId}`);
    
    const snapshot = await db
      .collection('applications')
      .where('institutionId', '==', institutionId)
      .get();
    
    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${applications.length} applications for institution ${institutionId}`);
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications by institution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update application status
app.patch('/applications/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    
    console.log(`Updating application ${applicationId} to status: ${status}`);
    
    await db.collection('applications').doc(applicationId).update({
      status: status,
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      message: `Application status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get application by ID
app.get('/applications/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    const doc = await db.collection('applications').doc(applicationId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get applications by student
app.get('/applications/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`Fetching applications for student: ${studentId}`);

    const snapshot = await db
      .collection('applications')
      .where('studentId', '==', studentId)
      .get();

    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort applications by appliedAt in descending order (most recent first)
    applications.sort((a, b) => {
      let dateA, dateB;

      // Handle different date formats
      if (a.appliedAt?.toDate) {
        dateA = a.appliedAt.toDate();
      } else if (a.appliedAt) {
        dateA = new Date(a.appliedAt);
      } else {
        dateA = new Date(0); // Default to epoch if no date
      }

      if (b.appliedAt?.toDate) {
        dateB = b.appliedAt.toDate();
      } else if (b.appliedAt) {
        dateB = new Date(b.appliedAt);
      } else {
        dateB = new Date(0); // Default to epoch if no date
      }

      return dateB.getTime() - dateA.getTime();
    });

    console.log(`Found ${applications.length} applications for student ${studentId}`);
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications by student:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Submit new application
app.post('/applications', async (req, res) => {
  try {
    const applicationData = {
      ...req.body,
      appliedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Submitting new application:', applicationData);

    const docRef = await db.collection('applications').add(applicationData);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: docRef.id,
        ...applicationData
      }
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all unique institution IDs (from applications)
app.get('/institutions-list', async (req, res) => {
  try {
    console.log('Fetching all institutions from applications...');
    const snapshot = await db.collection('applications').get();
    
    const institutions = [...new Set(snapshot.docs.map(doc => doc.data().institutionId).filter(Boolean))];
    
    console.log(`Found ${institutions.length} institutions:`, institutions);
    res.json({
      success: true,
      data: institutions
    });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== JOB POSTING MANAGEMENT ====================

// Get all jobs
app.get('/jobs', async (req, res) => {
  try {
    const { companyId, status } = req.query;
    
    console.log('Fetching jobs with filters:', { companyId, status });
    
    let query = db.collection('jobs');
    
    if (companyId) {
      query = query.where('companyId', '==', companyId);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${jobs.length} jobs`);
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get job by ID
app.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const doc = await db.collection('jobs').doc(jobId).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new job posting
app.post('/jobs', async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      category,
      companyId,
      companyName,
      requirements,
      salaryRange,
      jobType,
      applicationDeadline,
      contactEmail
    } = req.body;

    console.log('Creating new job posting:', { title, companyId, companyName });

    // Validation
    if (!title || !description || !companyId) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and companyId are required'
      });
    }

    const jobData = {
      title,
      description,
      location: location || 'Remote',
      category: category || 'Other',
      companyId,
      companyName: companyName || 'Unknown Company',
      requirements: requirements || '',
      salaryRange: salaryRange || 'Negotiable',
      jobType: jobType || 'Full-time',
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      contactEmail: contactEmail || '',
      status: 'active',
      views: 0,
      applications: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('jobs').add(jobData);

    console.log('Job created successfully with ID:', docRef.id);

    // Immediately fetch updated company stats from Firebase after job creation
    let updatedStats = null;
    try {
      // Get updated jobs count for the company
      const jobsSnapshot = await db.collection('jobs')
        .where('companyId', '==', companyId)
        .where('status', '==', 'active')
        .get();

      // Get applications count for the company
      const applicationsSnapshot = await db.collection('jobApplications')
        .where('companyId', '==', companyId)
        .get();

      const applications = applicationsSnapshot.docs.map(doc => doc.data());

      updatedStats = {
        jobs: jobsSnapshot.size,
        applicants: applicationsSnapshot.size,
        interviews: applications.filter(app => app.status === 'interview').length,
        offers: applications.filter(app => app.status === 'accepted').length
      };

      console.log('Updated company stats after job creation:', updatedStats);
    } catch (statsError) {
      console.error('Error fetching updated stats:', statsError);
      // Don't fail the job creation if stats fetch fails
    }

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: {
        id: docRef.id,
        ...jobData
      },
      // Include updated stats from Firebase for immediate dashboard update
      updatedStats: updatedStats
    });

  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update job posting
app.put('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    console.log(`Updating job ${jobId}:`, updateData);
    
    // Check if job exists
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    await db.collection('jobs').doc(jobId).update(updateData);
    
    res.json({
      success: true,
      message: 'Job updated successfully'
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update job status (active, closed, draft)
app.patch('/jobs/:jobId/status', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;
    
    console.log(`Updating job ${jobId} status to: ${status}`);
    
    const validStatuses = ['active', 'closed', 'draft'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: active, closed, or draft'
      });
    }
    
    const updateData = {
      status: status,
      updatedAt: new Date()
    };
    
    await db.collection('jobs').doc(jobId).update(updateData);
    
    res.json({
      success: true,
      message: `Job status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete job posting
app.delete('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    console.log(`Deleting job: ${jobId}`);
    
    await db.collection('jobs').doc(jobId).delete();
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get jobs by company
app.get('/companies/:companyId/jobs', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status } = req.query;
    
    console.log(`Fetching jobs for company: ${companyId}`);
    
    let query = db.collection('jobs')
      .where('companyId', '==', companyId)
      .orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.get();
    
    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${jobs.length} jobs for company ${companyId}`);
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== JOB APPLICATIONS ====================

// Apply for a job
app.post('/jobs/:jobId/apply', async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      studentId,
      studentName,
      studentEmail,
      coverLetter,
      resumeUrl
    } = req.body;
    
    console.log(`Student ${studentId} applying for job ${jobId}`);
    
    // Check if job exists
    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    const job = jobDoc.data();
    
    // Check if already applied
    const existingApplication = await db.collection('jobApplications')
      .where('jobId', '==', jobId)
      .where('studentId', '==', studentId)
      .get();
    
    if (!existingApplication.empty) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this job'
      });
    }
    
    const applicationData = {
      jobId,
      jobTitle: job.title,
      companyId: job.companyId,
      companyName: job.companyName,
      studentId,
      studentName,
      studentEmail,
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || '',
      status: 'pending',
      appliedAt: new Date(),
      createdAt: new Date()
    };

    // Create application
    const applicationRef = await db.collection('jobApplications').add(applicationData);

    // Increment application count on job
    await db.collection('jobs').doc(jobId).update({
      applications: (job.applications || 0) + 1,
      updatedAt: new Date()
    });

    console.log('Job application created with ID:', applicationRef.id);

    // Immediately fetch updated company stats from Firestore after application submission
    let updatedStats = null;
    try {
      // Get updated applications count for the company
      const applicationsSnapshot = await db.collection('jobApplications')
        .where('companyId', '==', job.companyId)
        .get();

      const applications = applicationsSnapshot.docs.map(doc => doc.data());

      updatedStats = {
        applicants: applicationsSnapshot.size,
        interviews: applications.filter(app => app.status === 'interview').length,
        offers: applications.filter(app => app.status === 'accepted').length
      };

      console.log('Updated company application stats after job application:', updatedStats);
    } catch (statsError) {
      console.error('Error fetching updated stats:', statsError);
      // Don't fail the application submission if stats fetch fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: applicationRef.id,
        ...applicationData
      },
      // Include updated stats from Firestore for immediate dashboard update
      updatedStats: updatedStats
    });
    
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get job applications for a company
app.get('/companies/:companyId/applications', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status, jobId } = req.query;
    
    console.log(`Fetching job applications for company: ${companyId}`);
    
    let query = db.collection('jobApplications')
      .where('companyId', '==', companyId)
      .orderBy('appliedAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (jobId) {
      query = query.where('jobId', '==', jobId);
    }
    
    const snapshot = await query.get();
    
    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${applications.length} job applications for company ${companyId}`);
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update job application status
app.patch('/job-applications/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    console.log(`Updating job application ${applicationId} to status: ${status}`);

    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected', 'interview'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    await db.collection('jobApplications').doc(applicationId).update({
      status: status,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: `Application status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating job application:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== STUDENT PROFILE ACCESS FOR COMPANIES ====================

// Get student profile for companies (protected route)
app.get('/students/:studentId/profile', verifyCompanyToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log(`Company ${req.company.id} requesting student profile: ${studentId}`);

    // Get student user data
    const userDoc = await db.collection('users').doc(studentId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const userData = userDoc.data();

    // Ensure the user is a student
    if (userData.role !== 'student') {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Get student profile data (qualifications, etc.)
    const studentProfile = {
      id: studentId,
      name: userData.name || userData.displayName || 'Unknown Student',
      email: userData.email,
      phone: userData.phone || '',
      course: userData.course || '',
      year: userData.year || '',
      gpa: userData.gpa || '',
      institution: userData.institution || '',
      qualifications: userData.qualifications || {},
      skills: userData.skills || [],
      experience: userData.experience || '',
      portfolio: userData.portfolio || '',
      linkedin: userData.linkedin || '',
      github: userData.github || '',
      resumeUrl: userData.resumeUrl || '',
      bio: userData.bio || '',
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };

    // Get student's job applications to this company (for context)
    const applicationsSnapshot = await db.collection('jobApplications')
      .where('studentId', '==', studentId)
      .where('companyId', '==', req.company.id)
      .orderBy('appliedAt', 'desc')
      .get();

    const applications = applicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      jobTitle: doc.data().jobTitle,
      status: doc.data().status,
      appliedAt: doc.data().appliedAt,
      coverLetter: doc.data().coverLetter || ''
    }));

    res.json({
      success: true,
      data: {
        profile: studentProfile,
        applications: applications
      }
    });

  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



// ==================== ADMIN AUTH ====================

// Admin login
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Admin login attempt:', email);
    
    // For demo - in production, use proper authentication
    const demoAdmins = [
      {
        email: "admin@limkokwing.ac.ls",
        password: "admin123",
        name: "System Administrator",
        role: "admin"
      },
      {
        email: "liteboho.molaoa@limkokwing.ac.ls",
        password: "lecturer123",
        name: "Mr. Liteboho Molaoa",
        role: "admin"
      },
      {
        email: "tsekiso.thokoana@limkokwing.ac.ls",
        password: "lecturer123",
        name: "Mr. Tsekiso Thokoana",
        role: "admin"
      }
    ];

    const admin = demoAdmins.find(a => a.email === email && a.password === password);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // In production, generate a proper JWT token
    const token = `admin-token-${Date.now()}`;

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ==================== ADMIN AUTH ====================

// Create initial admin account (run once)
app.post('/admin/setup', async (req, res) => {
  try {
    const adminData = {
      email: "admin@limkokwing.ac.ls",
      password: "$2b$10$8A2B7C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2", // admin123
      name: "System Administrator",
      role: "super_admin",
      createdAt: new Date(),
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await db.collection('admins')
      .where('email', '==', adminData.email)
      .get();

    if (!existingAdmin.empty) {
      return res.json({
        success: true,
        message: 'Admin account already exists'
      });
    }

    await db.collection('admins').add(adminData);

    res.json({
      success: true,
      message: 'Admin account created successfully'
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin login with real authentication
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Admin login attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required"
      });
    }

    // Find admin in Firestore
    const adminSnapshot = await db.collection('admins')
      .where('email', '==', email)
      .where('isActive', '==', true)
      .get();

    if (adminSnapshot.empty) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    const adminDoc = adminSnapshot.docs[0];
    const admin = adminDoc.data();

    // In production, use bcrypt for password verification
    // For now, using simple password check (replace with bcrypt in production)
    const validPassword = await verifyPassword(password, admin.password);
    
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Generate token (in production, use JWT)
    const token = generateAdminToken(adminDoc.id, admin.role);

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      admin: {
        id: adminDoc.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Password verification helper (replace with bcrypt in production)
async function verifyPassword(inputPassword, storedPassword) {
  // Simple demo verification - REPLACE WITH BCRYPT IN PRODUCTION
  const demoPasswords = {
    "admin123": "$2b$10$8A2B7C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2",
    "lecturer123": "$2b$10$9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T0U9V8W7X6Y5Z4"
  };
  
  for (const [plain, hashed] of Object.entries(demoPasswords)) {
    if (storedPassword === hashed && inputPassword === plain) {
      return true;
    }
  }
  return false;
}

// Token generation helper
function generateAdminToken(adminId, role) {
  // In production, use jsonwebtoken library
  const payload = {
    adminId: adminId,
    role: role,
    timestamp: Date.now()
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Verify admin token middleware
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access token required"
      });
    }

    // In production, verify JWT token
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if admin exists and is active
    const adminDoc = await db.collection('admins').doc(payload.adminId).get();
    
    if (!adminDoc.exists) {
      return res.status(401).json({
        success: false,
        error: "Invalid token"
      });
    }

    const admin = adminDoc.data();
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        error: "Admin account deactivated"
      });
    }

    req.admin = {
      id: adminDoc.id,
      ...admin
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      error: "Invalid token"
    });
  }
};

// Get current admin profile
app.get('/admin/profile', verifyAdminToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.admin.id,
        email: req.admin.email,
        name: req.admin.name,
        role: req.admin.role,
        createdAt: req.admin.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new admin account (protected)
app.post('/admin/accounts', verifyAdminToken, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: "Only super admins can create admin accounts"
      });
    }

    // Check if admin already exists
    const existingAdmin = await db.collection('admins')
      .where('email', '==', email)
      .get();

    if (!existingAdmin.empty) {
      return res.status(400).json({
        success: false,
        error: "Admin with this email already exists"
      });
    }

    const adminData = {
      email,
      password: `$2b$10${Buffer.from(password).toString('base64')}`, // Simple hashing
      name,
      role: role || 'admin',
      createdAt: new Date(),
      isActive: true,
      createdBy: req.admin.id
    };

    const docRef = await db.collection('admins').add(adminData);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        id: docRef.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const functions = require('firebase-functions');

// Export for Firebase Functions
exports.api = functions.https.onRequest(app);

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🎉 Admin Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 All jobs: http://localhost:${PORT}/jobs`);
    console.log(`📍 Post job: POST http://localhost:${PORT}/jobs`);
    console.log(`📍 All applications: http://localhost:${PORT}/applications`);
    console.log(`📍 All institutions: http://localhost:${PORT}/institutions`);
    console.log(`📍 All companies: http://localhost:${PORT}/companies`);
    console.log(`📍 System stats: http://localhost:${PORT}/admin/stats`);
    console.log(`📍 Institute apps: http://localhost:${PORT}/applications/institute/limkokwing`);
  });
}
