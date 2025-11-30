// Login component with both email and Google auth
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  // Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      await handleSuccessfulLogin(user);
      
    } catch (error) {
      console.error('Login error:', error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await handleSuccessfulLogin(user);
      
    } catch (error) {
      console.error('Google login error:', error);
      handleAuthError(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle successful login
  const handleSuccessfulLogin = async (user) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      localStorage.setItem('userType', userData.role);

      // Store Firebase ID token for authenticated API calls
      try {
        const idToken = await user.getIdToken();
        if (idToken) {
          localStorage.setItem('token', idToken);
        }
      } catch (tokenErr) {
        console.error('Failed to obtain ID token:', tokenErr);
      }
      
      if (userData.institutionId) {
        localStorage.setItem('instituteId', userData.institutionId);
      }
      
      // Redirect based on role
      switch (userData.role) {
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
    } else {
      setError('User account not found. Please sign up first.');
      await auth.signOut();
    }
  };

  // Error handling
  const handleAuthError = (error) => {
    let errorMessage = 'Login failed. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email. Please sign up.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = error.message || 'Login failed. Please try again.';
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
                <h2>Login</h2>
                <p className="text-muted">Welcome back to our career platform</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              {/* Google Login Button */}
              <div className="mb-4">
                <Button
                  variant="outline-danger"
                  className="w-100 mb-2"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Signing in with Google...
                    </>
                  ) : (
                    <>
                      <i className="fab fa-google me-2"></i>
                      Login with Google
                    </>
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div className="position-relative text-center mb-4">
                <hr />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                  OR
                </span>
              </div>

              {/* Email Login Form */}
              <Form onSubmit={handleEmailLogin}>
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

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
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
                      Logging in...
                    </>
                  ) : (
                    '📧 Login with Email'
                  )}
                </Button>
              </Form>

              <div className="text-center">
                <p className="mb-0">
                  Don't have an account? <Link to="/signup">Sign up here</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;