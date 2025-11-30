// src/components/company/ApplicantManagement.js
import React from 'react';
import { Container, Card, Table } from 'react-bootstrap';

const ApplicantManagement = () => {
  return (
    <Container className="mt-4">
      <h2>Applicant Management</h2>
      <Card>
        <Card.Body>
          <p className="text-center text-muted">No applicants yet.</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ApplicantManagement;