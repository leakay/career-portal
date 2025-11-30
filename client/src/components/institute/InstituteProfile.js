import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { realApi } from '../../api/config';

const InstituteProfile = () => {
  const { logout, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    code: '',
    type: 'university',
    location: '',
    contactEmail: '',
    phone: '',
    website: '',
    description: '',
    address: ''
  });

  // Get institute ID from user profile
  const instituteId = userProfile?.instituteId || userProfile?.institutionId || 'limkokwing'; // fallback

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const result = await realApi.getInstituteProfile(instituteId);
      if (result.success) {
        setProfile(result.data);
      } else {
        throw new Error(result.message || 'Failed to load profile');
      }

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile: ' + err.message);
      // Fallback to empty profile for editing
      setProfile({
        name: '',
        code: '',
        type: 'university',
        location: '',
        contactEmail: '',
        phone: '',
        website: '',
        description: '',
        address: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const result = await realApi.updateInstituteProfile(instituteId, profile);
      if (result.success) {
        setSuccess('Profile updated successfully!');
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }

    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading institute profile...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>Institute Profile</h1>
              <p className="text-muted">Manage your institute information and settings</p>
            </div>
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Institute Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSave}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Institute Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Institute Code *</Form.Label>
                      <Form.Control
                        type="text"
                        name="code"
                        value={profile.code}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type *</Form.Label>
                      <Form.Select
                        name="type"
                        value={profile.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="university">University</option>
                        <option value="college">College</option>
                        <option value="institute">Institute</option>
                        <option value="polytechnic">Polytechnic</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location *</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={profile.location}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={profile.address}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={profile.description}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="contactEmail"
                        value={profile.contactEmail}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={profile.website}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                  >
                    {saving ? <Spinner size="sm" /> : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={fetchProfile}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Quick Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <div className="mb-3">
                  <h3 className="text-primary">1,247</h3>
                  <p className="text-muted mb-0">Total Students</p>
                </div>
                <div className="mb-3">
                  <h3 className="text-success">89</h3>
                  <p className="text-muted mb-0">Active Courses</p>
                </div>
                <div>
                  <h3 className="text-info">12</h3>
                  <p className="text-muted mb-0">Faculties</p>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">System Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Profile Status:</strong>
                <span className="text-success ms-2">Complete</span>
              </div>
              <div className="mb-2">
                <strong>Last Updated:</strong>
                <span className="ms-2">{new Date().toLocaleDateString()}</span>
              </div>
              <div>
                <strong>Verification:</strong>
                <span className="text-warning ms-2">Pending</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InstituteProfile;
