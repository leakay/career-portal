// src/components/student/StudentApplications.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Table, Modal, Form } from 'react-bootstrap';
import { realApi } from '../../api/config';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, writeBatch, getDoc } from 'firebase/firestore';

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [admissionOffers, setAdmissionOffers] = useState([]);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setError('Please log in to view applications');
        return;
      }

      // Fetch student profile
      const studentDoc = await getDoc(doc(db, 'students', user.uid));
      if (studentDoc.exists()) {
        setStudentProfile({ id: studentDoc.id, ...studentDoc.data() });
      }

      // Fetch all data in parallel
      const [applicationsRes, coursesRes, institutionsRes] = await Promise.all([
        realApi.getStudentApplications(user.uid),
        realApi.getAvailableCourses(),
        realApi.getInstitutions()
      ]);

      setApplications(applicationsRes.data || []);
      setAvailableCourses(coursesRes.data || []);
      setInstitutions(institutionsRes.data || []);

      // Check for admission offers
      const admissionOffers = (applicationsRes.data || [])
        .filter(app => app.status === 'approved' && !app.admissionAccepted);
      setAdmissionOffers(admissionOffers);

    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if student qualifies for course
  const checkCourseEligibility = (course, studentProfile) => {
    if (!studentProfile || !course.requirements) return true;

    const requirements = course.requirements;
    const qualifications = studentProfile.qualifications || {};

    // Check minimum grade requirements
    if (requirements.minimumGrade && qualifications.finalGrade) {
      if (parseFloat(qualifications.finalGrade) < parseFloat(requirements.minimumGrade)) {
        return false;
      }
    }

    // Check subject requirements
    if (requirements.requiredSubjects && qualifications.subjects) {
      const hasRequiredSubjects = requirements.requiredSubjects.every(subject =>
        qualifications.subjects.includes(subject)
      );
      if (!hasRequiredSubjects) return false;
    }

    // Check other requirements
    if (requirements.otherRequirements) {
      // Implement specific requirement checks based on your system
      if (requirements.otherRequirements.includes('portfolio') && !qualifications.portfolio) {
        return false;
      }
    }

    return true;
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

  const handleApply = async (course) => {
    try {
      setApplying(true);
      setError('');
      setSuccess('');

      const user = auth.currentUser;
      if (!user) {
        setError('Please log in to apply');
        return;
      }

      if (!studentProfile) {
        setError('Please complete your profile before applying');
        return;
      }

      // Validation checks
      if (hasActiveAdmission()) {
        setError('You have already accepted an admission offer. You cannot apply for more courses.');
        return;
      }

      if (!canApplyToInstitution(course.institutionId)) {
        setError('You can only apply to a maximum of 2 courses per institution');
        return;
      }

      if (!checkCourseEligibility(course, studentProfile)) {
        setError('You do not meet the requirements for this course');
        return;
      }

      // Check if already applied to same course
      const existingApplication = applications.find(app => 
        app.courseId === course.id && app.institutionId === course.institutionId
      );
      if (existingApplication) {
        setError('You have already applied to this course');
        return;
      }

      // Submit application
      const applicationData = {
        studentId: user.uid,
        studentName: studentProfile.fullName || user.displayName,
        studentEmail: user.email,
        institutionId: course.institutionId,
        institutionName: course.institutionName,
        courseId: course.id,
        courseName: course.name,
        status: 'pending',
        appliedAt: new Date(),
        qualifications: studentProfile.qualifications,
        meetsRequirements: true
      };

      const result = await realApi.submitApplication(applicationData);
      
      if (result.success) {
        setSuccess('Application submitted successfully!');
        setShowApplicationModal(false);
        fetchStudentData(); // Refresh data
      }

    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application: ' + err.message);
    } finally {
      setApplying(false);
    }
  };

  const handleAcceptAdmission = async (applicationId) => {
    try {
      setApplying(true);
      setError('');
      setSuccess('');

      const batch = writeBatch(db);

      // Get the application to accept
      const application = admissionOffers.find(app => app.id === applicationId);
      if (!application) {
        setError('Admission offer not found');
        return;
      }

      // Mark this application as accepted
      const applicationRef = doc(db, 'applications', applicationId);
      batch.update(applicationRef, {
        admissionAccepted: true,
        admissionAcceptedAt: new Date(),
        status: 'admitted'
      });

      // Reject all other applications from the same student
      const otherApplications = applications.filter(app => 
        app.id !== applicationId && 
        app.studentId === application.studentId
      );

      otherApplications.forEach(app => {
        const appRef = doc(db, 'applications', app.id);
        batch.update(appRef, {
          status: 'rejected',
          rejectionReason: 'Student accepted another admission offer'
        });
      });

      // If there's a waiting list for the accepted course, promote the next student
      await promoteNextStudentFromWaitingList(application.courseId, batch);

      await batch.commit();
      
      setSuccess('Admission accepted successfully! Other applications have been withdrawn.');
      setShowAdmissionModal(false);
      fetchStudentData();

    } catch (err) {
      console.error('Error accepting admission:', err);
      setError('Failed to accept admission: ' + err.message);
    } finally {
      setApplying(false);
    }
  };

  const promoteNextStudentFromWaitingList = async (courseId, batch) => {
    try {
      // Get pending applications for this course, ordered by application date
      const waitingQuery = query(
        collection(db, 'applications'),
        where('courseId', '==', courseId),
        where('status', '==', 'pending')
      );
      
      const waitingSnapshot = await getDocs(waitingQuery);
      const waitingApplications = waitingSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.appliedAt - b.appliedAt);

      if (waitingApplications.length > 0) {
        const nextStudent = waitingApplications[0];
        const nextAppRef = doc(db, 'applications', nextStudent.id);
        batch.update(nextAppRef, {
          status: 'approved',
          approvedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error promoting from waiting list:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { bg: 'warning', text: 'Under Review' },
      approved: { bg: 'success', text: 'Approved' },
      rejected: { bg: 'danger', text: 'Not Selected' },
      admitted: { bg: 'primary', text: 'Admitted' }
    };
    const statusInfo = variants[status] || { bg: 'secondary', text: status };
    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading your applications...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>My Applications</h1>
          <p className="text-muted">Track your course applications and admission status</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowApplicationModal(true)}
          disabled={hasActiveAdmission()}
        >
          {hasActiveAdmission() ? 'Admission Accepted' : 'Apply for Courses'}
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Admission Offers */}
      {admissionOffers.length > 0 && (
        <Alert variant="success" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5>🎉 Admission Offers Available!</h5>
              <p className="mb-0">
                You have {admissionOffers.length} admission offer(s). 
                You can only accept one offer.
              </p>
            </div>
            <Button 
              variant="outline-success" 
              onClick={() => setShowAdmissionModal(true)}
            >
              View Offers
            </Button>
          </div>
        </Alert>
      )}

      {/* Applications Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4>{applications.length}</h4>
              <p className="text-muted mb-0">Total Applications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">
                {applications.filter(app => app.status === 'pending').length}
              </h4>
              <p className="text-muted mb-0">Under Review</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">
                {applications.filter(app => app.status === 'approved').length}
              </h4>
              <p className="text-muted mb-0">Approved</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">
                {applications.filter(app => app.admissionAccepted).length}
              </h4>
              <p className="text-muted mb-0">Admission Accepted</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Back Button */}
      <div className="d-flex justify-content-start mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => window.history.back()}
          className="d-flex align-items-center"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </Button>
      </div>

      {/* Applications List */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Application History</h5>
        </Card.Header>
        <Card.Body>
          {applications.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">You haven't applied to any courses yet.</p>
              <Button 
                variant="primary" 
                onClick={() => setShowApplicationModal(true)}
              >
                Start Your First Application
              </Button>
            </div>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Course & Institution</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <strong>{application.courseName}</strong>
                      <br />
                      <small className="text-muted">{application.institutionName}</small>
                    </td>
                    <td>
                      {new Date(application.appliedAt?.toDate?.() || application.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {getStatusBadge(application.status)}
                      {application.admissionAccepted && (
                        <Badge bg="success" className="ms-1">Accepted</Badge>
                      )}
                    </td>
                    <td>
                      {application.status === 'approved' && !application.admissionAccepted && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleAcceptAdmission(application.id)}
                        >
                          Accept Admission
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Course Application Modal */}
      <Modal show={showApplicationModal} onHide={() => setShowApplicationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Apply for Courses</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-4">
            You can apply to a maximum of 2 courses per institution. 
            Make sure you meet the course requirements before applying.
          </p>

          {availableCourses.map((course) => {
            const institution = institutions.find(inst => inst.id === course.institutionId);
            const canApply = canApplyToInstitution(course.institutionId);
            const isEligible = checkCourseEligibility(course, studentProfile);
            const alreadyApplied = applications.some(app => 
              app.courseId === course.id && app.institutionId === course.institutionId
            );

            return (
              <Card key={course.id} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6>{course.name}</h6>
                      <p className="text-muted mb-1">{institution?.name}</p>
                      <p className="mb-2">{course.description}</p>
                      
                      {/* Requirements */}
                      {course.requirements && (
                        <div className="mb-2">
                          <strong>Requirements:</strong>
                          <ul className="mb-1">
                            {course.requirements.minimumGrade && (
                              <li>Minimum Grade: {course.requirements.minimumGrade}</li>
                            )}
                            {course.requirements.requiredSubjects && (
                              <li>Required Subjects: {course.requirements.requiredSubjects.join(', ')}</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Eligibility Status */}
                      <div className="mb-2">
                        {!isEligible && (
                          <Badge bg="danger">Does not meet requirements</Badge>
                        )}
                        {!canApply && (
                          <Badge bg="warning">Max applications reached for this institution</Badge>
                        )}
                        {alreadyApplied && (
                          <Badge bg="secondary">Already Applied</Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApply(course)}
                      disabled={!isEligible || !canApply || alreadyApplied || applying}
                    >
                      {alreadyApplied ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </Modal.Body>
      </Modal>

      {/* Admission Offers Modal */}
      <Modal show={showAdmissionModal} onHide={() => setShowAdmissionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Admission Offers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            You can only accept one admission offer. Accepting an offer will automatically 
            withdraw all your other applications.
          </p>

          {admissionOffers.map((offer) => (
            <Card key={offer.id} className="mb-3">
              <Card.Body>
                <h6>{offer.courseName}</h6>
                <p className="text-muted mb-2">{offer.institutionName}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <small>
                    Offered on: {new Date(offer.approvedAt?.toDate?.() || new Date()).toLocaleDateString()}
                  </small>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAcceptAdmission(offer.id)}
                    disabled={applying}
                  >
                    Accept Offer
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default StudentApplications;