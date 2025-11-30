import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const AnalyticsModal = ({ show, onHide, applications, institutions }) => {
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
        approved: institutionApps.filter(app => app.status === 'approved').length
      };
    });
  };

  const appStats = getApplicationStats();
  const institutionStats = getInstitutionStats();

  const pieData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [appStats.pending, appStats.approved, appStats.rejected],
        backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
        hoverBackgroundColor: ['#e0a800', '#218838', '#c82333'],
      },
    ],
  };

  const barData = {
    labels: institutionStats.map(stat => stat.name),
    datasets: [
      {
        label: 'Total Applications',
        data: institutionStats.map(stat => stat.total),
        backgroundColor: '#007bff',
      },
      {
        label: 'Approved Applications',
        data: institutionStats.map(stat => stat.approved),
        backgroundColor: '#28a745',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Institution Performance',
      },
    },
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>System Analytics</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <h5>Application Status Distribution</h5>
            <Pie data={pieData} />
          </Col>
          <Col md={6}>
            <h5>Institution Performance</h5>
            <Bar data={barData} options={barOptions} />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AnalyticsModal;
