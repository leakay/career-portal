// src/components/admin/AdminReports.js
import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Table, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { realApi } from '../../api/config';
import { useAuth } from '../contexts/AuthContext';
import AnalyticsModal from './AnalyticsModal';

const AdminReports = () => {
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [applicationsResponse, institutionsResponse] = await Promise.all([
        realApi.getApplications(),
        realApi.getInstitutions()
      ]);

      setApplications(applicationsResponse.data || []);
      setInstitutions(institutionsResponse.data || []);

    } catch (err) {
      setError('Failed to load report data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getApplicationStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const getInstitutionStats = () => {
    return institutions.map(institution => {
      const institutionApps = applications.filter(app => app.institutionId === institution.id);
      return {
        name: institution.name,
        total: institutionApps.length,
        pending: institutionApps.filter(app => app.status === 'pending').length,
        approved: institutionApps.filter(app => app.status === 'approved').length,
        rejected: institutionApps.filter(app => app.status === 'rejected').length
      };
    });
  };

  const exportCSV = () => {
    const csvData = applications.map(app => ({
      'Student ID': app.studentId || '',
      'Institution': app.institutionId || '',
      'Status': app.status || '',
      'Applied Date': app.appliedDate || '',
      'Updated Date': app.updatedDate || ''
    }));
    return csvData;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('System Reports', 20, 20);

    doc.setFontSize(16);
    doc.text('Application Statistics', 20, 40);
    doc.setFontSize(12);
    doc.text(`Total Applications: ${appStats.total}`, 20, 50);
    doc.text(`Pending: ${appStats.pending}`, 20, 60);
    doc.text(`Approved: ${appStats.approved}`, 20, 70);
    doc.text(`Rejected: ${appStats.rejected}`, 20, 80);

    doc.setFontSize(16);
    doc.text('Institution Performance', 20, 100);
    const tableData = institutionStats.map(stats => [
      stats.name,
      stats.total,
      stats.pending,
      stats.approved,
      stats.rejected,
      stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) + '%' : '0%'
    ]);
    autoTable(doc, {
      head: [['Institution', 'Total', 'Pending', 'Approved', 'Rejected', 'Approval Rate']],
      body: tableData,
      startY: 110
    });

    doc.save('system-report.pdf');
  };

  const handleShowAnalytics = () => {
    setShowAnalytics(true);
  };

  const handleCloseAnalytics = () => {
    setShowAnalytics(false);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading reports...</p>
        </div>
      </Container>
    );
  }

  const appStats = getApplicationStats();
  const institutionStats = getInstitutionStats();

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button as={Link} to="/admin" variant="outline-secondary">
            ← Back to Dashboard
          </Button>
          <h1>System Reports</h1>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" onClick={() => logout()}>
            Logout
          </Button>
          <Button variant="primary" onClick={fetchData}>
            Refresh Reports
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Application Statistics */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Application Statistics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-primary">{appStats.total}</h3>
                    <p>Total Applications</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-warning">{appStats.pending}</h3>
                    <p>Pending</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-success">{appStats.approved}</h3>
                    <p>Approved</p>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <h3 className="text-danger">{appStats.rejected}</h3>
                    <p>Rejected</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Institution-wise Reports */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Institution Performance</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Institution</th>
                    <th>Total Applications</th>
                    <th>Pending</th>
                    <th>Approved</th>
                    <th>Rejected</th>
                    <th>Approval Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {institutionStats.map((stats) => (
                    <tr key={stats.name}>
                      <td>{stats.name}</td>
                      <td>{stats.total}</td>
                      <td>{stats.pending}</td>
                      <td>{stats.approved}</td>
                      <td>{stats.rejected}</td>
                      <td>
                        {stats.total > 0 ? 
                          ((stats.approved / stats.total) * 100).toFixed(1) + '%' : 
                          '0%'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* System Summary */}
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">System Summary</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Total Institutions:</strong> {institutions.length}</p>
              <p><strong>Total Applications:</strong> {applications.length}</p>
              <p><strong>Unique Students:</strong> {[...new Set(applications.map(app => app.studentId))].length}</p>
              <p><strong>Data Last Updated:</strong> {new Date().toLocaleString()}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <CSVLink
                  data={exportCSV()}
                  filename="applications-report.csv"
                  className="btn btn-outline-primary"
                  target="_blank"
                >
                  Export Applications CSV
                </CSVLink>
                <Button variant="outline-success" onClick={generatePDF}>
                  Generate Full Report
                </Button>
                <Button variant="outline-warning" onClick={handleShowAnalytics}>
                  System Analytics
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AnalyticsModal
        show={showAnalytics}
        onHide={handleCloseAnalytics}
        applications={applications}
        institutions={institutions}
      />
    </Container>
  );
};

export default AdminReports;
