import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import { collection, getDocs, query, where, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';


const AdmissionPublish = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Logout function
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        setLogoutLoading(true);
        await signOut(auth);
        
        // Clear local storage
        localStorage.removeItem('instituteId');
        localStorage.removeItem('userType');
        localStorage.removeItem('authToken');
        
        // Redirect to login page
        navigate('/login');
      } catch (error) {
        console.error('Error during logout:', error);
        setError('Logout failed. Please try again.');
      } finally {
        setLogoutLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const instituteId = localStorage.getItem('instituteId');
      
      if (!instituteId) {
        setError('Institute ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Fetching applications for institute:', instituteId);

      // Fetch applications
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('institutionId', '==', instituteId)
      );
      
      const applicationsSnapshot = await getDocs(applicationsQuery);
      console.log('Applications found:', applicationsSnapshot.size);

      if (applicationsSnapshot.empty) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const applicationsData = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('Applications data:', applicationsData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to fetch applications: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status: status,
        decisionDate: new Date(),
        updatedAt: new Date()
      });

      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status } : app
      ));

      setSuccess(`Application ${status} successfully!`);
    } catch (error) {
      console.error('Error updating application:', error);
      setError('Failed to update application: ' + error.message);
    }
  };

  const publishAdmissions = async () => {
    try {
      setPublishing(true);
      setError('');
      setSuccess('');

      const batch = writeBatch(db);
      let publishedCount = 0;

      applications.forEach(application => {
        if (application.status === 'approved') {
          const applicationRef = doc(db, 'applications', application.id);
          batch.update(applicationRef, {
            admissionPublished: true,
            admissionPublishedAt: new Date(),
            updatedAt: new Date()
          });
          publishedCount++;
        }
      });

      if (publishedCount === 0) {
        setError('No approved applications to publish.');
        return;
      }

      await batch.commit();
      setSuccess(`Successfully published ${publishedCount} admission decisions!`);
      
      // Refresh applications
      fetchApplications();
    } catch (error) {
      console.error('Error publishing admissions:', error);
      setError('Failed to publish admissions: ' + error.message);
    } finally {
      setPublishing(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getApprovedApplicationsCount = () => {
    return applications.filter(app => app.status === 'approved').length;
  };

  if (loading) {
    return (
      <Container className="admission-publish">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h3>Admission Publish</h3>
              <p>Review and publish admission decisions for applicants</p>
            </div>
            <Button
              variant="outline-danger"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="logout-btn"
            >
              {logoutLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Logging out...
                </>
              ) : (
                'Logout'
              )}
            </Button>
          </div>
        </div>
        <div className="text-center py-5">
          <Spinner animation="border" role="status" className="me-2" />
          <span>Loading applications...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="admission-publish">
      {/* Header with Logout Button */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h3>Admission Publish</h3>
            <p>Review and publish admission decisions for applicants</p>
          </div>
          <Button
            variant="outline-danger"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="logout-btn"
          >
            {logoutLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Logging out...
              </>
            ) : (
              'Logout'
            )}
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h5>Total Applications</h5>
              <h3>{applications.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h5>Approved</h5>
              <h3 className="text-success">{getApprovedApplicationsCount()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h5>Pending</h5>
              <h3 className="text-warning">
                {applications.filter(app => app.status === 'pending').length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <h5>Rejected</h5>
              <h3 className="text-danger">
                {applications.filter(app => app.status === 'rejected').length}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Publish Button */}
      {getApprovedApplicationsCount() > 0 && (
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">Ready to Publish</h5>
                <p className="mb-0 text-muted">
                  {getApprovedApplicationsCount()} approved applications ready for publication
                </p>
              </div>
              <Button
                variant="success"
                onClick={publishAdmissions}
                disabled={publishing}
                size="lg"
              >
                {publishing ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Publishing...
                  </>
                ) : (
                  '📢 Publish Admissions'
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Applications Table */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Application Review</h5>
            <Button
              variant="outline-primary"
              onClick={fetchApplications}
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Refreshing...
                </>
              ) : (
                '🔄 Refresh'
              )}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {applications.length === 0 ? (
            <div className="text-center py-5">
              <h5>No applications found</h5>
              <p className="text-muted">
                Applications will appear here when students apply to your courses.
              </p>
              <Button
                variant="primary"
                onClick={fetchApplications}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Checking...
                  </>
                ) : (
                  'Check Again'
                )}
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(application => (
                    <tr key={application.id}>
                      <td>
                        <strong>{application.studentName || 'Unknown Student'}</strong>
                        <br />
                        <small className="text-muted">{application.studentEmail}</small>
                      </td>
                      <td>{application.courseName || 'N/A'}</td>
                      <td>
                        {application.applicationDate?.toDate?.().toLocaleDateString() || 'Unknown date'}
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(application.status)}>
                          {application.status?.toUpperCase() || 'PENDING'}
                        </Badge>
                        {application.admissionPublished && (
                          <Badge bg="info" className="ms-1">Published</Badge>
                        )}
                      </td>
                      <td>
                        <div className="btn-group">
                          {application.status === 'pending' && (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => updateApplicationStatus(application.id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {application.status !== 'pending' && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => updateApplicationStatus(application.id, 'pending')}
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdmissionPublish;