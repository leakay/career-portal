import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { applicantId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    fetchStudentProfile();
  }, [applicantId]);

  const fetchStudentProfile = async () => {
    if (!applicantId) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/students/${applicantId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => null);
        throw new Error(errText || 'Failed to fetch student profile');
      }

      const data = await response.json();

      if (data.success) {
        setStudent(data.data.profile);
        setApplications(data.data.applications);
      } else {
        throw new Error(data.error || 'Failed to fetch student profile');
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setError('Failed to load student profile. You may not have permission to view this profile.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'interview': return 'info';
      case 'rejected': return 'danger';
      case 'reviewed': return 'primary';
      default: return 'secondary';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading student profile...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <div className="mb-4">
          <Button variant="outline-secondary" className="mb-3" onClick={() => window.history.back()}>
            ← Back
          </Button>
        </div>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container fluid className="py-4">
        <div className="mb-4">
          <Button variant="outline-secondary" className="mb-3" onClick={() => window.history.back()}>
            ← Back
          </Button>
        </div>
        <Alert variant="warning">Student profile not found.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <Button variant="outline-secondary" className="mb-3" onClick={() => window.history.back()}>
          ← Back to Applicants
        </Button>
        <h2 className="fw-bold text-dark mb-2">👨‍🎓 Student Profile</h2>
        <p className="text-muted">Detailed view of applicant's qualifications and background</p>
      </div>

      <Row>
        {/* Main Profile Information */}
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">{student.name}</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Email:</strong> {student.email}
                  </div>
                  <div className="mb-3">
                    <strong>Phone:</strong> {student.phone || 'Not provided'}
                  </div>
                  <div className="mb-3">
                    <strong>Course:</strong> {student.course || 'Not specified'}
                  </div>
                  <div className="mb-3">
                    <strong>Year:</strong> {student.year || 'Not specified'}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Institution:</strong> {student.institution || 'Not specified'}
                  </div>
                  <div className="mb-3">
                    <strong>GPA:</strong> {student.gpa || 'Not specified'}
                  </div>
                  <div className="mb-3">
                    <strong>Member Since:</strong> {formatDate(student.createdAt)}
                  </div>
                  {student.resumeUrl && (
                    <div className="mb-3">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        href={student.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📄 View Resume
                      </Button>
                    </div>
                  )}
                </Col>
              </Row>

              {student.bio && (
                <div className="mt-3">
                  <strong>Bio:</strong>
                  <p className="mt-2">{student.bio}</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Skills */}
          {student.skills && student.skills.length > 0 && (
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">🛠️ Skills</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {student.skills.map((skill, index) => (
                    <Badge key={index} bg="outline-primary" className="px-3 py-2">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Experience */}
          {student.experience && (
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">💼 Experience</h5>
              </Card.Header>
              <Card.Body>
                <p>{student.experience}</p>
              </Card.Body>
            </Card>
          )}

          {/* Qualifications */}
          {student.qualifications && Object.keys(student.qualifications).length > 0 && (
            <Card className="shadow-sm mb-4">
              <Card.Header>
                <h5 className="mb-0">🎓 Qualifications</h5>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {Object.entries(student.qualifications).map(([key, value], index) => (
                    <ListGroup.Item key={index}>
                      <strong>{key}:</strong> {value}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Sidebar - Applications to this Company */}
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">📋 Applications to Your Company</h5>
            </Card.Header>
            <Card.Body>
              {applications.length > 0 ? (
                <div>
                  {applications.map((app) => (
                    <div key={app.id} className="mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-1">{app.jobTitle}</h6>
                        <Badge bg={getStatusBadgeVariant(app.status)}>
                          {app.status.toUpperCase()}
                        </Badge>
                      </div>
                      <small className="text-muted">
                        Applied: {formatDate(app.appliedAt)}
                      </small>
                      {app.coverLetter && (
                        <p className="mt-2 mb-0 small text-muted">
                          "{app.coverLetter.substring(0, 100)}..."
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No applications to your company yet.</p>
              )}
            </Card.Body>
          </Card>

          {/* Contact Links */}
          {(student.linkedin || student.github || student.portfolio) && (
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">🔗 Links</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  {student.linkedin && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      href={student.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💼 LinkedIn Profile
                    </Button>
                  )}
                  {student.github && (
                    <Button
                      variant="outline-dark"
                      size="sm"
                      href={student.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💻 GitHub Profile
                    </Button>
                  )}
                  {student.portfolio && (
                    <Button
                      variant="outline-info"
                      size="sm"
                      href={student.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🌐 Portfolio Website
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default StudentProfile;
