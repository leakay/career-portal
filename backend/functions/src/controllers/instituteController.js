const admin = require('firebase-admin');
const db = admin.firestore();

// Get all institutions
exports.getInstitutions = async (req, res) => {
  try {
    const institutionsRef = db.collection('institutions');
    const snapshot = await institutionsRef.orderBy('createdAt', 'desc').get();

    const institutions = [];
    snapshot.forEach(doc => {
      institutions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      message: 'Institutions retrieved successfully',
      data: institutions,
      count: institutions.length
    });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({
      error: 'Failed to fetch institutions',
      details: error.message
    });
  }
};

// Get institution by ID
exports.getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const institutionDoc = await db.collection('institutions').doc(id).get();

    if (!institutionDoc.exists) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    res.json({
      message: 'Institution retrieved successfully',
      data: {
        id: institutionDoc.id,
        ...institutionDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({
      error: 'Failed to fetch institution',
      details: error.message
    });
  }
};

// Create new institution
exports.createInstitution = async (req, res) => {
  try {
    const institutionData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      statistics: {
        totalStudents: 0,
        totalCourses: 0,
        totalReviews: 0,
        averageRating: 0,
        ...req.body.statistics
      },
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        ...req.body.colors
      }
    };

    const docRef = await db.collection('institutions').add(institutionData);

    res.status(201).json({
      message: 'Institution created successfully',
      data: {
        id: docRef.id,
        ...institutionData
      }
    });
  } catch (error) {
    console.error('Error creating institution:', error);
    res.status(500).json({
      error: 'Failed to create institution',
      details: error.message
    });
  }
};

// Update institution
exports.updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('institutions').doc(id).update(updateData);

    res.json({
      message: 'Institution updated successfully',
      data: {
        id,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating institution:', error);
    if (error.code === 'not-found') {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.status(500).json({
      error: 'Failed to update institution',
      details: error.message
    });
  }
};

// Delete institution
exports.deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('institutions').doc(id).delete();

    res.json({
      message: 'Institution deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting institution:', error);
    res.status(500).json({
      error: 'Failed to delete institution',
      details: error.message
    });
  }
};

// Get institution courses
exports.getInstitutionCourses = async (req, res) => {
  try {
    const { id } = req.params;
    const coursesRef = db.collection('courses');
    const snapshot = await coursesRef.where('institutionId', '==', id).get();

    const courses = [];
    snapshot.forEach(doc => {
      courses.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      message: 'Institution courses retrieved successfully',
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Error fetching institution courses:', error);
    res.status(500).json({
      error: 'Failed to fetch institution courses',
      details: error.message
    });
  }
};

// ==================== FACULTY MANAGEMENT ====================

// Get faculties by institution
exports.getFaculties = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const facultiesRef = db.collection('faculties');
    const snapshot = await facultiesRef.where('institutionId', '==', institutionId).get();

    const faculties = [];
    snapshot.forEach(doc => {
      faculties.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      message: 'Faculties retrieved successfully',
      data: faculties,
      count: faculties.length
    });
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({
      error: 'Failed to fetch faculties',
      details: error.message
    });
  }
};

// Add faculty to institution
exports.addFaculty = async (req, res) => {
  try {
    const { institutionId } = req.params;
    const facultyData = {
      ...req.body,
      institutionId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('faculties').add(facultyData);

    res.status(201).json({
      message: 'Faculty created successfully',
      data: {
        id: docRef.id,
        ...facultyData
      }
    });
  } catch (error) {
    console.error('Error creating faculty:', error);
    res.status(500).json({
      error: 'Failed to create faculty',
      details: error.message
    });
  }
};

// Update faculty
exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('faculties').doc(id).update(updateData);

    res.json({
      message: 'Faculty updated successfully',
      data: {
        id,
        ...updateData
      }
    });
  } catch (error) {
    console.error('Error updating faculty:', error);
    if (error.code === 'not-found') {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.status(500).json({
      error: 'Failed to update faculty',
      details: error.message
    });
  }
};

// Delete faculty
exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if faculty exists
    const facultyDoc = await db.collection('faculties').doc(id).get();
    if (!facultyDoc.exists) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    await db.collection('faculties').doc(id).delete();

    res.json({
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({
      error: 'Failed to delete faculty',
      details: error.message
    });
  }
};
