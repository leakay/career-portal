const admin = require('firebase-admin');
const db = admin.firestore();

exports.getApplications = async (req, res) => {
  try {
    const userId = req.user.uid;
    const applicationsRef = db.collection('applications');
    const snapshot = await applicationsRef
      .where('studentId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const applications = [];
    snapshot.forEach(doc => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      message: 'Applications retrieved successfully',
      data: applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      error: 'Failed to fetch applications',
      details: error.message
    });
  }
};

exports.submitApplication = async (req, res) => {
  try {
    res.status(201).json({ 
      message: 'Application submitted successfully',
      data: req.body
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};