import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Adjust import path as needed

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Firebase Email/Password Registration
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;

      // Create user document in Firestore
      await createUserDocument(user, formData.name, formData.role);

      alert('Registration successful! You are now logged in.');
      redirectUser(formData.role, user.uid);

    } catch (error) {
      console.error('Error during email signup:', error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  // Google Signup
  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // User exists, just log them in
        const userData = userDoc.data();
        alert('Welcome back! You are now logged in.');
        redirectUser(userData.role, user.uid);
      } else {
        // New user - show role selection
        const role = await promptForRole();
        if (role) {
          await createUserDocument(user, user.displayName || user.email.split('@')[0], role);
          alert('Registration successful! You are now logged in.');
          redirectUser(role, user.uid);
        } else {
          await auth.signOut(); // Sign out if no role selected
          setError('Please select an account type to continue.');
        }
      }
    } catch (error) {
      console.error('Error during Google signup:', error);
      handleAuthError(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Helper function to create user document
  const createUserDocument = async (user, name, role) => {
    const userData = {
      name: name,
      email: user.email,
      role: role,
      createdAt: new Date(),
      profileCompleted: false,
      authProvider: 'email' // or 'google'
    };

    // Add institution-specific data if role is institution
    if (role === 'institution') {
      const instituteId = `inst_${user.uid}`;
      userData.institutionId = instituteId;
      
      // Create institution document
      await setDoc(doc(db, 'institutions', instituteId), {
        name: name,
        email: user.email,
        institutionId: instituteId,
        adminId: user.uid,
        createdAt: new Date(),
        status: 'active',
        profile: {
          contactEmail: user.email,
          phone: '',
          address: '',
          website: '',
          description: ''
        }
      });

      localStorage.setItem('instituteId', instituteId);
    }

    await setDoc(doc(db, 'users', user.uid), userData);
    localStorage.setItem('userType', role);
  };

  // Helper function to prompt for role (for Google signup)
  const promptForRole = () => {
    return new Promise((resolve) => {
      const role = window.prompt(
        'Please select your account type:\n\n1. Student\n2. Company\n3. Educational Institution\n\nEnter "student", "company", or "institution":',
        'student'
      );
      
      if (role && ['student', 'company', 'institution'].includes(role.toLowerCase())) {
        resolve(role.toLowerCase());
      } else if (role === null) {
        resolve(null); // User cancelled
      } else {
        alert('Invalid role selected. Please choose student, company, or institution.');
        resolve(promptForRole()); // Retry
      }
    });
  };

  // Helper function to redirect user
  const redirectUser = (role, userId) => {
    switch (role) {
      case 'institution':
        navigate('/institute-dashboard');
        break;
      case 'company':
        navigate('/company-dashboard');
        break;
      case 'student':
      default:
        navigate('/student-dashboard');
        break;
    }
  };

  // Helper function to handle authentication errors
  const handleAuthError = (error) => {
    let errorMessage = 'Authentication failed. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered. Please use a different email or login.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please use a stronger password.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      case 'auth/popup-closed-by-user':
        errorMessage = 'Google signup was cancelled.';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
        break;
      default:
        errorMessage = error.message || 'Authentication failed. Please try again.';
    }
    
    setError(errorMessage);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2>Create Account</h2>
                <p className="text-muted">Join our career platform today</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              {/* Google Signup Button */}
              <div className="mb-4">
                <Button
                  variant="outline-danger"
                  className="w-100 mb-2"
                  onClick={handleGoogleSignup}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Signing up with Google...
                    </>
                  ) : (
                    <>
                      <i className="fab fa-google me-2"></i>
                      Sign up with Google
                    </>
                  )}
                </Button>
                <div className="text-center">
                  <small className="text-muted">Quick and easy registration</small>
                </div>
              </div>

              {/* Divider */}
              <div className="position-relative text-center mb-4">
                <hr />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                  OR
                </span>
              </div>

              {/* Email Signup Form */}
              <Form onSubmit={handleEmailSignup}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Account Type</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="company">Company</option>
                    <option value="institution">Educational Institution</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {formData.role === 'institution' && 
                      'Institutions can manage courses and admissions'}
                    {formData.role === 'company' && 
                      'Companies can post jobs and review applications'}
                    {formData.role === 'student' && 
                      'Students can apply to courses and jobs'}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password (min. 6 characters)"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating Account...
                    </>
                  ) : (
                    '📧 Sign up with Email'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>

              {/* Terms Notice */}
              <div className="text-center mt-3">
                <small className="text-muted">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;