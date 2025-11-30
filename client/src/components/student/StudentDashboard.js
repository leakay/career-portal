import React, { useState, useEffect } from 'react';
import StudentSidebar from './StudentSidebar';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const [student, setStudent] = useState({
    name: 'Student',
    email: '',
    university: 'Not specified',
    course: 'Not specified',
    year: 'Not specified',
    avatar: null,
    joinDate: '2024-01-01',
    gpa: 'N/A'
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [firestoreError, setFirestoreError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const navigate = useNavigate();

  // Sample universities data - you can replace this with Firestore data
  const sampleUniversities = [
    {
      id: 'nul',
      name: 'National University of Lesotho',
      courses: ['Computer Science', 'Engineering', 'Business Administration', 'Medicine', 'Law'],
      location: 'Roma, Lesotho',
      logo: '🏛️'
    },
    {
      id: 'limkokwing',
      name: 'Limkokwing University',
      courses: ['Graphic Design', 'Business Management', 'IT', 'Fashion Design'],
      location: 'Maseru, Lesotho',
      logo: '🎓'
    },
    {
      id: 'botho',
      name: 'Botho University',
      courses: ['Accounting', 'Hospitality Management', 'Networking', 'Software Engineering'],
      location: 'Maseru, Lesotho',
      logo: '📚'
    }
  ];

  useEffect(() => {
    fetchStudentData();
    fetchUniversities();
    setupApplicationsListener();
    fetchJobs();
    fetchAppliedJobs();
    testFirestoreConnection();
  }, []);

  // Test Firestore connection
  const testFirestoreConnection = async () => {
    try {
      console.log('Testing Firestore connection...');
      const user = auth.currentUser;
      if (!user) {
        setFirestoreError('Please log in to access database features.');
        return;
      }
      // Try to read the current user's document to test connection
      const testQuery = query(collection(db, 'users'), where('__name__', '==', user.uid));
      await getDocs(testQuery);
      console.log('Firestore connection test: SUCCESS');
      setFirestoreError('');
    } catch (error) {
      console.error('Firestore connection test: FAILED', error);
      setFirestoreError('Database connection issue. Some features may not work.');
    }
  };

  const fetchStudentData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      console.log('Fetching student data for:', user.email);

      // Get student data from Firestore
      const studentQuery = query(collection(db, 'users'), where('email', '==', user.email));
      const studentDoc = await getDocs(studentQuery);
      
      if (!studentDoc.empty) {
        const studentData = studentDoc.docs[0].data();
        console.log('Student data found:', studentData);
        
        setStudent({
          id: studentDoc.docs[0].id,
          name: studentData.name || user.displayName || 'Student',
          email: studentData.email || user.email,
          university: studentData.university || 'Not specified',
          course: studentData.course || 'Not specified',
          year: studentData.year || 'Not specified',
          avatar: null,
          joinDate: studentData.createdAt?.toDate?.().toISOString().split('T')[0] || '2024-01-01',
          gpa: studentData.gpa || 'N/A'
        });
      } else {
        console.log('No student record found, creating default');
        // Set default student data if no record found
        setStudent({
          id: user.uid,
          name: user.displayName || 'Student',
          email: user.email,
          university: 'Not specified',
          course: 'Not specified',
          year: 'Not specified',
          avatar: null,
          joinDate: new Date().toISOString().split('T')[0],
          gpa: 'N/A'
        });
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      console.error('Error details:', error.message, error.code);
      
      // Set fallback student data on error
      const user = auth.currentUser;
      setStudent({
        id: user?.uid || 'unknown',
        name: user?.displayName || 'Student',
        email: user?.email || 'No email',
        university: 'Not specified',
        course: 'Not specified',
        year: 'Not specified',
        avatar: null,
        joinDate: new Date().toISOString().split('T')[0],
        gpa: 'N/A'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      console.log('Fetching universities for dashboard...');

      // Fetch institutions from Firestore
      const universitiesQuery = query(collection(db, 'institutions'), where('status', '==', 'active'));
      const universitiesSnapshot = await getDocs(universitiesQuery);
      const universitiesData = universitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all active courses
      const coursesQuery = query(collection(db, 'courses'), where('status', '==', 'active'));
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (universitiesData.length > 0) {
        // Group courses by institutionId
        const coursesByInstitution = coursesData.reduce((acc, course) => {
          if (!acc[course.institutionId]) {
            acc[course.institutionId] = [];
          }
          acc[course.institutionId].push(course.name);
          return acc;
        }, {});

        // Transform Firestore data to match component structure
        const transformedUniversities = universitiesData.map(uni => ({
          id: uni.id,
          name: uni.name || 'Unknown University',
          location: uni.location || 'Lesotho',
          logo: uni.logo || '🏛️',
          courses: coursesByInstitution[uni.id] || ['Computer Science', 'Business Administration']
        }));
        setUniversities(transformedUniversities);
        console.log('Loaded universities from Firestore for dashboard:', transformedUniversities.length);
      } else {
        // Fallback to sample data if no Firestore data
        console.log('No universities in Firestore, using sample data for dashboard');
        setUniversities(sampleUniversities);
      }
    } catch (error) {
      console.error('Error fetching universities from Firestore for dashboard:', error);
      // Fallback to sample data
      setUniversities(sampleUniversities);
    }
  };

  const fetchJobs = async () => {
    try {
      console.log('Fetching jobs...');
      const jobsQuery = query(collection(db, 'jobs'));
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobsData = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsData);
      console.log('Jobs fetched:', jobsData.length);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      console.log('Fetching applied jobs for:', user.email);
      const appliedJobsQuery = query(
        collection(db, 'jobApplications'),
        where('studentEmail', '==', user.email)
      );
      const appliedJobsSnapshot = await getDocs(appliedJobsQuery);
      const appliedJobsData = appliedJobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppliedJobs(appliedJobsData);
      console.log('Applied jobs fetched:', appliedJobsData.length);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  const setupApplicationsListener = () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user for applications listener');
        return;
      }

      console.log('Setting up applications listener for:', user.email);

      const applicationsQuery = query(
        collection(db, 'applications'),
        where('studentEmail', '==', user.email)
      );

      const unsubscribe = onSnapshot(applicationsQuery, 
        (snapshot) => {
          console.log('Applications snapshot received:', snapshot.docs.length, 'applications');
          const applicationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setApplications(applicationsData);
        },
        (error) => {
          console.error('Error in applications listener:', error);
          console.error('Error details:', error.message, error.code);
          setFirestoreError('Failed to load applications. Please refresh the page.');
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up applications listener:', error);
      setFirestoreError('Failed to setup applications listener.');
    }
  };

  // Check if student can apply to more courses in an institution
  const canApplyToInstitution = (institutionId) => {
    const institutionApplications = applications.filter(app =>
      app.institutionId === institutionId &&
      ['pending', 'approved'].includes(app.status)
    );
    return institutionApplications.length < 2; // Max 2 applications per institution
  };

  // Check if student is already admitted elsewhere
  const hasActiveAdmission = () => {
    return applications.some(app => app.admissionAccepted === true);
  };

  const handleApplyToUniversity = async (e) => {
    e.preventDefault();
    if (!selectedUniversity || !selectedCourse) {
      alert('Please select both university and course');
      return;
    }

    try {
      setApplicationLoading(true);
      const user = auth.currentUser;

      if (!user) {
        alert('Please log in to submit an application');
        navigate('/login');
        return;
      }

      // Validation checks
      if (hasActiveAdmission()) {
        alert('You have already accepted an admission offer. You cannot apply for more courses.');
        setApplicationLoading(false);
        return;
      }

      if (!canApplyToInstitution(selectedUniversity)) {
        alert('You can only apply to a maximum of 2 courses per institution. You have reached this limit.');
        setApplicationLoading(false);
        return;
      }

      // Check if already applied to same course
      const existingApplication = applications.find(app =>
        app.courseName === selectedCourse && app.institutionId === selectedUniversity
      );
      if (existingApplication) {
        alert('You have already applied to this course');
        setApplicationLoading(false);
        return;
      }

      const selectedUni = universities.find(uni => uni.id === selectedUniversity);

      if (!selectedUni) {
        alert('Selected university not found');
        setApplicationLoading(false);
        return;
      }

      const applicationData = {
        studentId: user.uid,
        studentName: student?.name || user.displayName || 'Unknown Student',
        studentEmail: student?.email || user.email || '',
        institutionId: selectedUniversity,
        institutionName: selectedUni.name,
        courseName: selectedCourse,
        status: 'pending',
        applicationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Submitting application:', applicationData);

      // Add document to Firestore
      const docRef = await addDoc(collection(db, 'applications'), applicationData);

      console.log('Application submitted successfully with ID:', docRef.id);

      // Immediately add the new application to the local state
      const newApplication = {
        id: docRef.id,
        ...applicationData
      };
      setApplications(prev => [...prev, newApplication]);

      alert(`Application submitted successfully to ${selectedUni.name} for ${selectedCourse}`);
      setShowApplicationForm(false);
      setSelectedUniversity('');
      setSelectedCourse('');

    } catch (error) {
      console.error('Error submitting application:', error);
      console.error('Error details:', error.message, error.code);

      // More specific error messages
      if (error.code === 'permission-denied') {
        alert('Permission denied. Please check Firestore security rules or contact support.');
      } else if (error.code === 'unauthenticated') {
        alert('Please log in again to submit an application.');
        navigate('/login');
      } else if (error.code === 'unavailable') {
        alert('Network error. Please check your internet connection and try again.');
      } else {
        alert('Failed to submit application. Please try again. Error: ' + error.message);
      }
    } finally {
      setApplicationLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('userType');
      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { class: 'warning', label: 'Under Review', icon: '⏳' },
      approved: { class: 'success', label: 'Approved', icon: '✅' },
      rejected: { class: 'danger', label: 'Not Selected', icon: '❌' },
      interview: { class: 'info', label: 'Interview', icon: '📅' }
    };
    return statusMap[status] || { class: 'secondary', label: 'Unknown', icon: '❓' };
  };

  const getAvailableCourses = () => {
    const university = universities.find(uni => uni.id === selectedUniversity);
    return university ? university.courses : [];
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading dashboard...</span>
          </div>
          <p className="mt-3 text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ marginLeft: '280px' }}>
        <div className="container mt-4">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="text-primary mb-1">Student Dashboard</h3>
                  <p className="text-muted mb-0">
                    Welcome back, {student?.name || 'Student'}! Manage your university applications.
                  </p>
                </div>
                <div className="text-end">
                  <div className="d-flex align-items-center gap-2">
                    <div className="text-end">
                      <div className="badge bg-primary">{student?.university || 'Not specified'}</div>
                      <div className="text-muted small">{student?.course || 'Not specified'}</div>
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm ms-3"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-1"></i>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Firestore Error Alert */}
        {firestoreError && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {firestoreError}
            <button
              type="button"
              className="btn-close"
              onClick={() => setFirestoreError('')}
            ></button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{applications.length}</h4>
                  <small>Total Applications</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-send display-6 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{applications.filter(app => app.status === 'approved').length}</h4>
                  <small>Approved</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-check-circle display-6 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{applications.filter(app => app.status === 'pending').length}</h4>
                  <small>Pending</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-clock display-6 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{universities.length}</h4>
                  <small>Available Universities</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-building display-6 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card bg-secondary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{jobs.length}</h4>
                  <small>Available Jobs</small>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-briefcase display-6 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left Column - Applications & Universities */}
        <div className="col-lg-8">
          {/* Application Form Modal */}
          {showApplicationForm && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Apply to University</h6>
                <button 
                  className="btn btn-sm btn-light"
                  onClick={() => setShowApplicationForm(false)}
                >
                  ×
                </button>
              </div>
              <div className="card-body">
                <form onSubmit={handleApplyToUniversity}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Select University *</label>
                      <select 
                        className="form-select"
                        value={selectedUniversity}
                        onChange={(e) => {
                          setSelectedUniversity(e.target.value);
                          setSelectedCourse('');
                        }}
                        required
                      >
                        <option value="">Choose a university...</option>
                        {universities.map(uni => (
                          <option key={uni.id} value={uni.id}>
                            {uni.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Select Course *</label>
                      <select 
                        className="form-select"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        disabled={!selectedUniversity}
                        required
                      >
                        <option value="">Choose a course...</option>
                        {getAvailableCourses().map(course => (
                          <option key={course} value={course}>
                            {course}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="d-grid gap-2">
                    <button 
                      type="submit"
                      className="btn btn-success"
                      disabled={applicationLoading}
                    >
                      {applicationLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* My Applications */}
          <div id="applications-section" className="card shadow-sm mb-4">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h6 className="mb-0">My Applications</h6>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowApplicationForm(true)}
                disabled={firestoreError}
              >
                + New Application
              </button>
            </div>
            <div className="card-body">
              {applications.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                  <h5>No applications yet</h5>
                  <p className="text-muted">Start by applying to your preferred universities.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowApplicationForm(true)}
                    disabled={firestoreError}
                  >
                    Apply Now
                  </button>
                  {firestoreError && (
                    <div className="alert alert-warning mt-3">
                      <small>Cannot load applications due to database connection issue.</small>
                    </div>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>University</th>
                        <th>Course</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(application => {
                        const statusInfo = getStatusInfo(application.status);
                        return (
                          <tr key={application.id}>
                            <td>
                              <strong>{application.institutionName}</strong>
                            </td>
                            <td>{application.courseName}</td>
                            <td>
                              {application.applicationDate?.toDate?.().toLocaleDateString() || 
                               application.createdAt?.toDate?.().toLocaleDateString() || 
                               'N/A'}
                            </td>
                            <td>
                              <span className={`badge bg-${statusInfo.class}`}>
                                {statusInfo.icon} {statusInfo.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Available Universities */}
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0">Available Universities</h6>
            </div>
            <div className="card-body">
              <div className="row">
                {universities.map(university => (
                  <div key={university.id} className="col-md-6 mb-3">
                    <div className="card border h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-2">
                          <span className="me-2" style={{ fontSize: '1.5rem' }}>
                            {university.logo}
                          </span>
                          <h6 className="card-title mb-0">{university.name}</h6>
                        </div>
                        <p className="card-text text-muted small mb-2">
                          <i className="bi bi-geo-alt me-1"></i>
                          {university.location}
                        </p>
                        <div className="mb-2">
                          <small className="text-muted">Available Courses:</small>
                          <div className="mt-1">
                            {university.courses.slice(0, 3).map(course => (
                              <span key={course} className="badge bg-light text-dark me-1 mb-1">
                                {course}
                              </span>
                            ))}
                            {university.courses.length > 3 && (
                              <span className="badge bg-secondary">
                                +{university.courses.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="card-footer bg-transparent">
                        <button 
                          className="btn btn-outline-primary btn-sm w-100"
                          onClick={() => {
                            setSelectedUniversity(university.id);
                            setShowApplicationForm(true);
                          }}
                          disabled={firestoreError}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Available Jobs - clickable cards that redirect to JobPostings with selected job */}
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-light">
              <h6 className="mb-0">Available Jobs</h6>
            </div>
            <div className="card-body">
              <div className="row">
                {jobs.length === 0 ? (
                  <div className="col-12 text-center py-4 text-muted">No job postings available</div>
                ) : (
                  jobs.slice(0, 6).map(job => (
                    <div key={job.id} className="col-md-6 mb-3">
                      <div
                        className="card border h-100 clickable-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/student/jobs', { state: { jobId: job.id } })}
                      >
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="card-title mb-1">{job.title}</h6>
                              <h6 className="card-subtitle mb-2 text-muted" style={{ fontSize: '0.9rem' }}>{job.companyName}</h6>
                            </div>
                            <span className="badge bg-primary">{job.category || 'General'}</span>
                          </div>

                          <p className="card-text text-truncate" style={{ maxHeight: '3rem' }}>{job.description}</p>
                        </div>
                        <div className="card-footer bg-transparent">
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm w-100"
                              onClick={(e) => { e.stopPropagation(); navigate('/student/jobs', { state: { jobId: job.id } }); }}
                            >
                              View & Apply
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={(e) => { e.stopPropagation(); /* could open company profile later */ }}
                            >
                              Company
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile & Quick Actions */}
        <div className="col-lg-4">
          {/* Student Profile Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              <div className="mb-3">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="rounded-circle"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                    style={{ width: '80px', height: '80px', fontSize: '1.5rem' }}
                  >
                    {student?.name ? student.name.split(' ').map(n => n[0]).join('') : 'S'}
                  </div>
                )}
              </div>
              <h5 className="card-title">{student?.name || 'Student'}</h5>
              <p className="text-muted small mb-2">{student?.email || 'N/A'}</p>
              
              <div className="row text-center mb-3">
                <div className="col-6">
                  <div className="fw-bold text-primary">{applications.length}</div>
                  <small className="text-muted">Applications</small>
                </div>
                <div className="col-6">
                  <div className="fw-bold text-success">
                    {applications.filter(app => app.status === 'approved').length}
                  </div>
                  <small className="text-muted">Approved</small>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0">Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowApplicationForm(true)}
                  disabled={firestoreError}
                >
                  <i className="bi bi-send me-2"></i>
                  New Application
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate('/student/applications')}
                >
                  <i className="bi bi-list-check me-2"></i>
                  View All Applications
                </button>
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => navigate('/student/profile')}
                >
                  <i className="bi bi-person me-2"></i>
                  Update Profile
                </button>
                <button
                  className="btn btn-outline-info btn-sm"
                  onClick={() => navigate('/universities')}
                >
                  <i className="bi bi-building me-2"></i>
                  Browse Universities
                </button>
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => navigate('/student/documents')}
                >
                  <i className="bi bi-file-earmark me-2"></i>
                  Upload Documents
                </button>
              </div>
            </div>
          </div>

          {/* Application Status Legend */}
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-light">
              <h6 className="mb-0">Status Legend</h6>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center">
                  <span className="badge bg-warning me-2">⏳</span>
                  <small>Pending Review</small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-success me-2">✅</span>
                  <small>Approved</small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-danger me-2">❌</span>
                  <small>Rejected</small>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-info me-2">📅</span>
                  <small>Interview Scheduled</small>
                </div>
              </div>
            </div>
          </div>

          {/* Database Status */}
          {firestoreError && (
            <div className="card shadow-sm mt-4 border-warning">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">Connection Issue</h6>
              </div>
              <div className="card-body">
                <p className="small mb-2">There's a problem with the database connection.</p>
                <button 
                  className="btn btn-outline-warning btn-sm w-100"
                  onClick={testFirestoreConnection}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Retry Connection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

