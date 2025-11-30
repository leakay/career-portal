// components/auth/AdminLogin.js
import React, { useState, useEffect } from "react";
import { Card, Form, Button, Alert, Container, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase"; // Your Firebase config

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in and is admin
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        const isAdmin = await checkAdminStatus(user.uid);
        if (isAdmin) {
          navigate("/admin");
        } else {
          // User is logged in but not admin - sign them out
          await auth.signOut();
          setError("Access denied. Admin privileges required.");
          setInitializing(false);
        }
      } else {
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Check if user has admin privileges
  const checkAdminStatus = async (userId) => {
    try {
      // Check admins collection
      const adminDoc = await getDoc(doc(db, "admins", userId));
      if (adminDoc.exists()) {
        return true;
      }

      // Alternatively, check users collection for admin role
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists() && (userDoc.data().role === "admin" || userDoc.data().isAdmin)) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!credentials.email || !credentials.password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );
      
      // Check if user is admin
      const isAdmin = await checkAdminStatus(userCredential.user.uid);
      if (isAdmin) {
        navigate("/admin");
      } else {
        await auth.signOut();
        setError("Access denied. Admin privileges required.");
      }
    } catch (err) {
      console.error("Login error:", err);
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/user-not-found":
          setError("No account found with this email");
          break;
        case "auth/wrong-password":
          setError("Incorrect password");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      // Add custom parameters if needed
      provider.setCustomParameters({
        prompt: "select_account"
      });

      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user is admin
      const isAdmin = await checkAdminStatus(userCredential.user.uid);
      if (isAdmin) {
        navigate("/admin");
        await auth.signOut();
        setError("Access denied. This Google account doesn't have admin privileges.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      switch (err.code) {
        case "auth/popup-closed-by-user":
          // User closed the popup - no error message needed
          break;
        case "auth/popup-blocked":
          setError("Popup was blocked by browser. Please allow popups for this site.");
          break;
        case "auth/unauthorized-domain":
          setError("This domain is not authorized for Google login.");
          break;
        default:
          setError("Google login failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSetupDemo = async () => {
    try {
      setLoading(true);
      // You can keep this if you still want demo setup functionality
      setError("Demo setup not available with Firebase Auth. Use Google Sign-In or contact system administrator.");
    } catch (err) {
      setError("Failed to setup demo account.");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <Container fluid className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Admin Login</h2>
                  <p className="text-muted">Career Guidance System Administration</p>
                </div>

                {error && (
                  <Alert variant={error.includes("✅") ? "success" : "danger"}>
                    {error}
                  </Alert>
                )}

                {/* Google Sign-In Button */}
                <div className="mb-4">
                  <Button
                    variant="outline-danger"
                    className="w-100 py-2 d-flex align-items-center justify-content-center"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                  >
                    {googleLoading ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <i className="fab fa-google me-2"></i>
                    )}
                    {googleLoading ? "Signing in..." : "Continue with Google"}
                  </Button>
                </div>

                <div className="position-relative text-center mb-4">
                  <hr />
                  <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                    OR
                  </span>
                </div>

                {/* Email/Password Form */}
                <Form onSubmit={handleEmailLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="admin@limkokwing.ac.ls"
                      value={credentials.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In with Email"
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <hr />
                  <small className="text-muted d-block mb-2">
                    Need admin access?
                  </small>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleSetupDemo}
                    disabled={loading}
                  >
                    Contact Administrator
                  </Button>
                </div>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    <strong>Note:</strong> Only authorized admin accounts can access this system.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}