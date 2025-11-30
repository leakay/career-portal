// src/components/shared/Unauthorized.js
import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const { userProfile, logout } = useAuth();

  return (
    <Container className="mt-5">
      <Card className="text-center">
        <Card.Body>
          <h1>🚫 Unauthorized Access</h1>
          <p>You don't have permission to access this page.</p>
          <p className="text-muted">
            Your current role: <strong>{userProfile?.role || 'Unknown'}</strong>
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button as={Link} to="/" variant="primary">
              Go Home
            </Button>
            <Button onClick={logout} variant="outline-secondary">
              Logout
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Unauthorized;