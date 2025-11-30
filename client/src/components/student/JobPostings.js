import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import './JobPostings.css';

export default function JobPostings() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [firestoreError, setFirestoreError] = useState('');

  useEffect(() => {
    fetchStudentProfile();
    fetchJobs();
    fetchAppliedJobs();
    setupNotifications();
  }, []);

  const location = useLocation();

  // If navigated with a selected job id, open the apply modal when jobs are loaded
  useEffect(() => {
    if (!location?.state?.jobId) return;
    const targetId = location.state.jobId;
    const found = jobs.find(j => j.id === targetId);
    if (found) {
      setSelectedJob(found);
      setShowApplyForm(true);
      // remove jobId from history state to avoid reopening
      try {
        window.history.replaceState({}, document.title);
      } catch (e) {}
    }
  }, [jobs, location]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedCategory, studentProfile]);

  const fetchStudentProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const studentQuery = query(collection(db, 'users'), where('email', '==', user.email));
      const studentDoc = await getDocs(studentQuery);

      if (!studentDoc.empty) {
        const profile = studentDoc.docs[0].data();
        setStudentProfile({ id: studentDoc.docs[0].id, ...profile });
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const jobsQuery = query(collection(db, 'jobs'), where('status', '==', 'active'));
      const unsubscribe = onSnapshot(jobsQuery,
        (snapshot) => {
          const jobsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setJobs(jobsData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching jobs:', error);
          setFirestoreError('Failed to load job postings.');
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up jobs listener:', error);
      setFirestoreError('Failed to setup job postings listener.');
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const applicationsQuery = query(collection(db, 'jobApplications'), where('studentId', '==', user.uid));
      const unsubscribe = onSnapshot(applicationsQuery,
        (snapshot) => {
          const appliedJobIds = snapshot.docs.map(doc => doc.data().jobId);
          setAppliedJobs(appliedJobIds);
        },
        (error) => {
          console.error('Error fetching applied jobs:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up applied jobs listener:', error);
    }
  };

  // Check if student qualifies for job (strict requirements)
  const checkJobEligibility = (job, studentProfile) => {
    if (!studentProfile || !job.requirements) return false;

    const requirements = job.requirements;
    const qualifications = studentProfile.qualifications || {};

    // Check minimum GPA requirements
    if (requirements.minGPA && studentProfile.gpa) {
      const studentGPA = parseFloat(studentProfile.gpa);
      const requiredGPA = parseFloat(requirements.minGPA);
      if (isNaN(studentGPA) || studentGPA < requiredGPA) {
        return false;
      }
    }

    // Check required qualifications/skills
    if (requirements.qualifications && requirements.qualifications.length > 0) {
      const studentQuals = Array.isArray(qualifications.subjects)
        ? qualifications.subjects
        : (qualifications.subjects ? qualifications.subjects.split(',').map(s => s.trim()) : []);

      const hasRequiredQualifications = requirements.qualifications.every(reqQual =>
        studentQuals.some(studentQual =>
          studentQual.toLowerCase().includes(reqQual.toLowerCase())
        )
      );
      if (!hasRequiredQualifications) return false;
    }

    // Check course relevance
    if (requirements.course && studentProfile.course) {
      const jobCourseKeywords = requirements.course.toLowerCase().split(/[\s\/&]+/);
      const studentCourse = studentProfile.course.toLowerCase();

      const hasRelevantCourse = jobCourseKeywords.some(keyword =>
        studentCourse.includes(keyword) && keyword.length > 3
      );
      if (!hasRelevantCourse) return false;
    }

    // Check experience requirements (using year as proxy)
    if (requirements.experience && studentProfile.year) {
      const yearMap = { '1': 0, '2': 1, '3': 2, '4': 3, '5+': 4 };
      const studentExp = yearMap[studentProfile.year] || 0;
      const requiredExp = parseInt(requirements.experience) || 0;
      if (studentExp < requiredExp) return false;
    }

    // Check portfolio requirement for creative roles
    if (requirements.portfolioRequired && !qualifications.portfolio) {
      return false;
    }

    return true;
  };

  const setupNotifications = () => {
    // Check for new matching jobs every 30 seconds
    const checkForMatches = async () => {
      if (!studentProfile) return;

      try {
        const matchingJobs = jobs.filter(job => {
          if (appliedJobs.includes(job.id)) return false;

          // Use strict eligibility check - only notify truly qualified students
          return checkJobEligibility(job, studentProfile);
        });

        const newMatches = matchingJobs.filter(job =>
          !notifications.some(notif => notif.jobId === job.id)
        );

        if (newMatches.length > 0) {
          const newNotifications = newMatches.map(job => ({
            id: Date.now() + Math.random(),
            jobId: job.id,
            title: job.title,
            company: job.companyName,
            message: `New qualified job opportunity: ${job.title} at ${job.companyName}. You meet all requirements!`,
            timestamp: new Date(),
            read: false
          }));

          setNotifications(prev => [...prev, ...newNotifications]);
        }
      } catch (error) {
        console.error('Error checking for job matches:', error);
      }
    };

    checkForMatches();
    const interval = setInterval(checkForMatches, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // Filter out already applied jobs
    filtered = filtered.filter(job => !appliedJobs.includes(job.id));

    setFilteredJobs(filtered);
  };

  const handleApply = async (job) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in to apply for jobs');
        return;
      }

      const applicationData = {
        studentId: user.uid,
        studentName: studentProfile?.name || user.displayName || 'Unknown Student',
        studentEmail: studentProfile?.email || user.email,
        coverLetter: '',
        resumeUrl: ''
      };

      // Use the backend API endpoint instead of Firebase directly
      const response = await fetch(`http://localhost:5000/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit application');
      }

      const result = await response.json();

      alert(`Successfully applied for ${job.title} at ${job.companyName}`);
      setAppliedJobs(prev => [...prev, job.id]);
      setShowApplyForm(false);
      setSelectedJob(null);

    } catch (error) {
      console.error('Error applying for job:', error);
      alert(`Failed to submit application: ${error.message}`);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(jobs.map(job => job.category).filter(Boolean))];
    return categories;
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading job postings...</span>
          </div>
          <p className="mt-3 text-muted">Loading job postings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <div className="d-flex justify-content-start mb-4">
        <button
          className="btn btn-outline-secondary d-flex align-items-center"
          onClick={() => window.history.back()}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </button>
      </div>

      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="text-primary mb-1">Job Postings</h3>
              <p className="text-muted mb-0">
                Discover and apply for job opportunities that match your profile.
              </p>
            </div>
            <div className="text-end">
              <div className="d-flex align-items-center gap-2">
                <div className="position-relative">
                  <button
                    className="btn btn-outline-primary position-relative"
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  >
                    <i className="bi bi-bell me-1"></i>
                    Notifications
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="bi bi-bell me-2"></i>
                  Job Match Notifications
                </h6>
              </div>
              <div className="card-body">
                {notifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className={`alert ${notification.read ? 'alert-light' : 'alert-info'} mb-2`}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{notification.title}</strong>
                        <p className="mb-1">{notification.message}</p>
                        <small className="text-muted">
                          {notification.timestamp.toLocaleString()}
                        </small>
                      </div>
                      {!notification.read && (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search jobs by title, company, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <div className="d-grid">
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="row">
        {filteredJobs.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="bi bi-briefcase display-4 text-muted mb-3"></i>
              <h5>No job postings found</h5>
              <p className="text-muted">
                {searchTerm || selectedCategory
                  ? 'Try adjusting your search criteria.'
                  : 'Check back later for new opportunities.'}
              </p>
            </div>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.id} className="col-lg-6 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="card-title mb-1">{job.title}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">{job.companyName}</h6>
                    </div>
                    <span className="badge bg-primary">{job.category || 'General'}</span>
                  </div>

                  <div className="mb-2">
                    <small className="text-muted">
                      <i className="bi bi-geo-alt me-1"></i>
                      {job.location || 'Remote'}
                    </small>
                    <small className="text-muted ms-3">
                      <i className="bi bi-clock me-1"></i>
                      Posted {job.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                    </small>
                  </div>

                  <p className="card-text text-truncate">{job.description}</p>

                  {job.requirements && (
                    <div className="mb-3">
                      <small className="text-muted">Requirements:</small>
                      <div className="mt-1">
                        {job.requirements.course && (
                          <span className="badge bg-light text-dark me-1">
                            {job.requirements.course}
                          </span>
                        )}
                        {job.requirements.minGPA && (
                          <span className="badge bg-light text-dark me-1">
                            GPA: {job.requirements.minGPA}+
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-primary fw-bold">
                      {job.salary ? `$${job.salary}` : 'Salary not specified'}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setSelectedJob(job);
                        setShowApplyForm(true);
                      }}
                      disabled={appliedJobs.includes(job.id)}
                    >
                      {appliedJobs.includes(job.id) ? 'Applied' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Apply Form Modal */}
      {showApplyForm && selectedJob && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Apply for {selectedJob.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowApplyForm(false);
                    setSelectedJob(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <h6>{selectedJob.companyName}</h6>
                    <p>{selectedJob.description}</p>

                    {selectedJob.requirements && (
                      <div className="mt-3">
                        <h6>Requirements:</h6>
                        <ul>
                          {selectedJob.requirements.course && (
                            <li>Course: {selectedJob.requirements.course}</li>
                          )}
                          {selectedJob.requirements.qualifications && (
                            <li>Qualifications: {selectedJob.requirements.qualifications.join(', ')}</li>
                          )}
                          {selectedJob.requirements.minGPA && (
                            <li>Minimum GPA: {selectedJob.requirements.minGPA}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h6>Your Profile Match</h6>
                        <div className="mb-2">
                          <div className="progress">
                            <div
                              className="progress-bar bg-success"
                              style={{ width: '75%' }}
                            >
                              75%
                            </div>
                          </div>
                        </div>
                        <small className="text-muted">Good match for your qualifications</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowApplyForm(false);
                    setSelectedJob(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleApply(selectedJob)}
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showApplyForm && (
        <div
          className="modal-backdrop show"
          onClick={() => {
            setShowApplyForm(false);
            setSelectedJob(null);
          }}
        ></div>
      )}
    </div>
  );
}
