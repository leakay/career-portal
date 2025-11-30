import React, { useState } from "react";
import { auth } from "../../firebase";
import { sendEmailVerification } from "firebase/auth";
import { Button, Card, Alert } from "react-bootstrap";

export default function EmailVerification() {
  const user = auth.currentUser;
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendVerification = async () => {
    if (!user) {
      setStatus("⚠️ No user logged in. Please sign in first.");
      return;
    }

    try {
      setLoading(true);
      await sendEmailVerification(user);
      setStatus("✅ Verification email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error sending verification email:", error);
      setStatus("❌ Failed to send verification email. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-light">
      <Card className="p-4 shadow-lg text-center" style={{ width: "400px" }}>
        <h3 className="mb-3">📧 Email Verification</h3>
        <p>
          {user
            ? `Your email (${user.email}) is not yet verified.`
            : "No active session found."}
        </p>

        {status && <Alert variant="info">{status}</Alert>}

        <Button
          onClick={handleSendVerification}
          disabled={loading || !user}
          variant="outline-light"
        >
          {loading ? "Sending..." : "Send Verification Email"}
        </Button>

        <p className="mt-3 small text-muted">
          After verifying, refresh or log in again to access your dashboard.
        </p>
      </Card>
    </div>
  );
}
