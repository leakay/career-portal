import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { Card, Button, Form, Alert } from "react-bootstrap";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("✅ Password reset email sent! Check your inbox.");
      setEmail("");
    } catch (error) {
      console.error("Error resetting password:", error);
      setStatus("❌ Failed to send password reset email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-light">
      <Card className="p-4 shadow-lg text-center" style={{ width: "400px" }}>
        <h3 className="mb-3">🔑 Forgot Password</h3>
        <p className="text-muted small">
          Enter your registered email address, and we’ll send you a link to reset your password.
        </p>

        {status && <Alert variant="info">{status}</Alert>}

        <Form onSubmit={handleResetPassword}>
          <Form.Group controlId="email" className="mb-3">
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" disabled={loading} variant="outline-light" className="w-100">
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </Form>

        <p className="mt-3 small text-muted">
          Remembered your password? <a href="/login" className="text-info">Login here</a>
        </p>
      </Card>
    </div>
  );
}
