// src/components/admin/AdmissionsDebug.js
import React, { useState } from 'react';
import { Container, Card, Button, Alert, Pre } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { realApi } from '../../api/config';
import { useAuth } from '../contexts/AuthContext';

const AdmissionsDebug = () => {
  const { logout } = useAuth();
  const [debugData, setDebugData] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing API connections...');

      // Test health endpoint
      const health = await realApi.checkHealth();
      console.log('Health check:', health);

      // Test applications endpoint
      const applications = await realApi.getApplications();
      console.log('Applications:', applications);

      // Test institutions endpoint
      const institutions = await realApi.getInstitutions();
      console.log('Institutions:', institutions);

      // Test status update with a sample application
      let statusUpdateTest = { success: false, error: 'No applications to test with' };
      if (applications.data && applications.data.length > 0) {
        const testApp = applications.data[0];
        try {
          statusUpdateTest = await realApi.updateApplicationStatus(testApp.id, 'pending');
        } catch (error) {
          statusUpdateTest = { success: false, error: error.message };
        }
      }

      setDebugData({
        health,
        applications,
        institutions,
        statusUpdateTest,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Debug test failed:', error);
      setDebugData({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button as={Link} to="/admin/dashboard" variant="outline-secondary">
            ← Back to Dashboard
          </Button>
          <h1>Admissions Debug</h1>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </div>

      <Card>
        <Card.Header>
          <h4>🔧 Admissions API Debug</h4>
        </Card.Header>
        <Card.Body>
          <Button 
            variant="primary" 
            onClick={testAPI}
            disabled={loading}
            className="mb-3"
          >
            {loading ? 'Testing API...' : 'Test API Connections'}
          </Button>

          {debugData.error && (
            <Alert variant="danger">
              <strong>Error:</strong> {debugData.error}
            </Alert>
          )}

          {Object.keys(debugData).length > 0 && (
            <div>
              <h6>API Response Data:</h6>
              <Pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', fontSize: '12px' }}>
                {JSON.stringify(debugData, null, 2)}
              </Pre>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdmissionsDebug;