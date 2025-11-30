const admin = require('firebase-admin');
const db = admin.firestore();

exports.getOverview = async (req, res) => {
  try {
    // Get counts from all collections
    const [usersSnapshot, jobsSnapshot, applicationsSnapshot, institutionsSnapshot, companiesSnapshot] = await Promise.all([
      db.collection('users').get(),
      db.collection('jobs').get(),
      db.collection('applications').get(),
      db.collection('institutions').get(),
      db.collection('companies').get()
    ]);

    // Calculate application statistics
    let pendingApplications = 0;
    let approvedApplications = 0;
    let rejectedApplications = 0;

    applicationsSnapshot.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'pending';
      if (status === 'pending') pendingApplications++;
      else if (status === 'approved') approvedApplications++;
      else if (status === 'rejected') rejectedApplications++;
    });

    // Calculate company statistics
    let pendingCompanies = 0;
    let activeCompanies = 0;
    let suspendedCompanies = 0;

    companiesSnapshot.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'pending';
      if (status === 'pending') pendingCompanies++;
      else if (status === 'approved' || status === 'active') activeCompanies++;
      else if (status === 'suspended') suspendedCompanies++;
    });

    const overviewData = {
      totalUsers: usersSnapshot.size,
      totalJobs: jobsSnapshot.size,
      totalApplications: applicationsSnapshot.size,
      totalInstitutions: institutionsSnapshot.size,
      totalCompanies: companiesSnapshot.size,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      pendingCompanies,
      activeCompanies,
      suspendedCompanies
    };

    res.json({
      message: 'Admin overview data retrieved successfully',
      data: overviewData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({
      error: 'Failed to fetch admin overview',
      details: error.message
    });
  }
};
