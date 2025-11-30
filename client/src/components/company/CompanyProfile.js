import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { realApi } from '../../api/config';

export default function CompanyProfile() {
  const { user, userProfile } = useAuth();
  const [profile, setProfile] = useState({
    companyName: '',
    industry: '',
    size: '',
    website: '',
    description: '',
    contactEmail: '',
    phone: '',
    address: '',
    foundedYear: '',
    benefits: '',
    culture: '',
    logo: '',
    linkedin: '',
    twitter: '',
    facebook: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user:', user);
      console.log('User profile:', userProfile);

      if (!user) {
        setStatus('Please log in to access your company profile');
        setFetchLoading(false);
        return;
      }

      if (userProfile?.role !== 'company') {
        setStatus('❌ Access denied. Company account required.');
        setFetchLoading(false);
        return;
      }

      console.log('User ID:', user.uid);
      console.log('Making API call to:', `http://localhost:5000/api/company/profile?userId=${user.uid}`);

      // First test if backend is responding
      try {
        console.log('Testing backend health...');
        const healthResponse = await fetch('http://localhost:5000/health');
        console.log('Health response status:', healthResponse.status);
        if (!healthResponse.ok) {
          throw new Error(`Health check failed: ${healthResponse.status}`);
        }
        const healthData = await healthResponse.json();
        console.log('Health check successful:', healthData);
      } catch (healthErr) {
        console.error('Backend health check failed:', healthErr);
        throw new Error('Backend server not responding. Please ensure the backend server is running on port 5000.');
      }

      // Use the realApi to get company profile
      const response = await realApi.getCompanyProfile(user.uid);
      console.log('API Response:', response);

      if (response.success && response.data) {
        setProfile(response.data);
        if (!response.data.companyName && !response.data.industry) {
          setStatus('✅ Profile created successfully! Please fill in your company details.');
        }
      } else {
        console.error('API response not successful:', response);
        throw new Error('Failed to fetch profile data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setStatus('Failed to load profile data: ' + err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use the realApi to update company profile
      const response = await realApi.updateCompanyProfile(user.uid, profile);

      if (response.success) {
        setStatus('✅ Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setStatus('❌ Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading company profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Button variant="outline-secondary" className="mb-3" onClick={() => window.history.back()}>
        ← Back
      </Button>
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h3 className="mb-0">🏢 Company Profile</h3>
          <p className="mb-0 opacity-75">Manage your company information and settings</p>
        </Card.Header>

        <Card.Body>
          {status && <Alert variant={status.includes("✅") ? "success" : "danger"}>{status}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">📋 Basic Information</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      value={profile.companyName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Industry</Form.Label>
                    <Form.Control
                      type="text"
                      name="industry"
                      value={profile.industry}
                      onChange={handleChange}
                      placeholder="e.g. Information Technology"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Size</Form.Label>
                    <Form.Select name="size" value={profile.size} onChange={handleChange}>
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Founded Year</Form.Label>
                    <Form.Control
                      type="number"
                      name="foundedYear"
                      value={profile.foundedYear}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      placeholder="e.g. 2015"
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
                  onChange={handleChange}
                  placeholder="https://yourcompany.com"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={profile.description}
                  onChange={handleChange}
                  placeholder="Describe your company, mission, and values..."
                />
              </Form.Group>
            </div>

            {/* Contact Information */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">📞 Contact Information</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="contactEmail"
                      value={profile.contactEmail}
                      onChange={handleChange}
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
                      onChange={handleChange}
                      placeholder="+1-555-0123"
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
                  onChange={handleChange}
                  placeholder="Company headquarters address..."
                />
              </Form.Group>
            </div>

            {/* Social Media */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">🌐 Social Media</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>LinkedIn</Form.Label>
                    <Form.Control
                      type="url"
                      name="linkedin"
                      value={profile.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Twitter</Form.Label>
                    <Form.Control
                      type="url"
                      name="twitter"
                      value={profile.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/yourcompany"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Facebook</Form.Label>
                <Form.Control
                  type="url"
                  name="facebook"
                  value={profile.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/yourcompany"
                />
              </Form.Group>
            </div>

            {/* Company Culture */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">🏢 Company Culture & Benefits</h5>
              <Form.Group className="mb-3">
                <Form.Label>Benefits</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="benefits"
                  value={profile.benefits}
                  onChange={handleChange}
                  placeholder="Health insurance, 401k matching, flexible work hours, professional development..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Company Culture</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="culture"
                  value={profile.culture}
                  onChange={handleChange}
                  placeholder="Describe your company culture, values, and work environment..."
                />
              </Form.Group>
            </div>

            <div className="text-center">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="px-5"
              >
                {loading ? "🔄 Updating Profile..." : "💾 Save Changes"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
