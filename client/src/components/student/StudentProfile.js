// src/components/student/StudentProfile.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { auth, db, storage } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const StudentProfile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    profilePicture: '',
    qualifications: {
      finalGrade: '',
      subjects: [],
      portfolio: false,
      otherQualifications: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setProfile({
          ...data,
          qualifications: data.qualifications || {
            finalGrade: '',
            subjects: [],
            portfolio: false,
            otherQualifications: ''
          }
        });
      } else {
        // Initialize with user data
        setProfile(prev => ({
          ...prev,
          fullName: user.displayName || '',
          email: user.email
        }));
      }
    } catch (err) {
      setError('Failed to load profile: ' + err.message);
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

      const user = auth.currentUser;
      if (!user) {
        setError('Please log in to save profile');
        return;
      }

      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        updatedAt: new Date(),
        userId: user.uid
      });

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQualificationChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      qualifications: {
        ...prev.qualifications,
        [field]: value
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const user = auth.currentUser;
      if (!user) {
        setError('Please log in to upload image');
        return;
      }

      // Delete existing profile picture if it exists
      if (profile.profilePicture) {
        try {
          const oldImageRef = ref(storage, profile.profilePicture);
          await deleteObject(oldImageRef);
        } catch (err) {
          console.log('No existing image to delete');
        }
      }

      // Upload new image
      const imageRef = ref(storage, `profile-pictures/${user.uid}/${file.name}`);
      await uploadBytes(imageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);

      // Update profile with new image URL
      setProfile(prev => ({
        ...prev,
        profilePicture: downloadURL
      }));

      setSuccess('Profile picture uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading profile...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Student Profile</h1>
          <p className="text-muted mb-0">Complete your profile to apply for courses</p>
        </div>
        <Button as={Link} to="/student-dashboard" variant="outline-secondary">
          ← Back to Dashboard
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSave}>
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Personal Information</h5>
              </Card.Header>
              <Card.Body>
                {/* Profile Picture Section */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="rounded-circle"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                        style={{ width: '120px', height: '120px' }}
                      >
                        <i className="bi bi-person-fill text-muted" style={{ fontSize: '3rem' }}></i>
                      </div>
                    )}
                  </div>
                  <Form.Group className="mb-3">
                    <Form.Label>Profile Picture</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Form.Text className="text-muted">
                      {uploading ? 'Uploading...' : 'Upload a profile picture (max 5MB)'}
                    </Form.Text>
                  </Form.Group>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={profile.address}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Academic Qualifications</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Final Grade/GPA *</Form.Label>
                  <Form.Control
                    type="text"
                    value={profile.qualifications.finalGrade}
                    onChange={(e) => handleQualificationChange('finalGrade', e.target.value)}
                    placeholder="e.g., 3.5, B+, 85%"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Subjects Taken</Form.Label>
                  <Form.Control
                    type="text"
                    value={profile.qualifications.subjects.join(', ')}
                    onChange={(e) => handleQualificationChange('subjects', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="Mathematics, Physics, Chemistry, English"
                  />
                  <Form.Text className="text-muted">
                    Separate subjects with commas
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="I have a portfolio (for creative courses)"
                    checked={profile.qualifications.portfolio}
                    onChange={(e) => handleQualificationChange('portfolio', e.target.checked)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Other Qualifications</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={profile.qualifications.otherQualifications}
                    onChange={(e) => handleQualificationChange('otherQualifications', e.target.value)}
                    placeholder="Certifications, awards, extracurricular activities..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="text-center">
          <Button type="submit" variant="primary" size="lg" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default StudentProfile;