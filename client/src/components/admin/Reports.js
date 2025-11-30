import React, { useEffect, useState } from "react";
import { Card, Button, Table } from "react-bootstrap";
import axios from "axios";

export default function Reports() {
  const [reports, setReports] = useState({
    totalStudents: 0,
    totalInstitutions: 0,
    totalJobs: 0,
    totalApplications: 0,
  });

  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const API_BASE =
          process.env.REACT_APP_API_BASE || "http://localhost:5000";
        const res = await axios.get(`${API_BASE}/admin/overview`);
        setReports(res.data);
      } catch (err) {
        console.warn("⚠️ Using mock report data (offline mode)");
        setReports({
          totalStudents: 120,
          totalInstitutions: 3,
          totalJobs: 45,
          totalApplications: 280,
        });
        setRecentApplications([
          {
            id: 1,
            student: "Thabo Mokete",
            job: "Software Intern",
            company: "Tech Traders Ltd",
            date: "2025-11-03",
          },
          {
            id: 2,
            student: "Lerato Mokoena",
            job: "UI/UX Designer",
            company: "CodeHub Solutions",
            date: "2025-11-02",
          },
        ]);
      }
    };

    fetchReports();
  }, []);

  const exportToCSV = () => {
    // Simple CSV export (demo)
    const csvData = [
      ["Student", "Job", "Company", "Date"],
      ...recentApplications.map((r) => [
        r.student,
        r.job,
        r.company,
        r.date,
      ]),
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((row) => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "recent_applications.csv");
    document.body.appendChild(link);
    link.click();
  };

  const exportToPDF = () => {
    alert("📄 PDF export can be implemented using jsPDF or react-pdf.");
  };

  return (
    <div className="bg-dark text-light p-4 rounded">
      <h2 className="mb-4 text-center">Reports & Analytics</h2>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <Card className="card-custom text-center p-3">
            <h6>Total Students</h6>
            <h2>{reports.totalStudents}</h2>
          </Card>
        </div>
        <div className="col-md-3 mb-3">
          <Card className="card-custom text-center p-3">
            <h6>Institutions</h6>
            <h2>{reports.totalInstitutions}</h2>
          </Card>
        </div>
        <div className="col-md-3 mb-3">
          <Card className="card-custom text-center p-3">
            <h6>Job Posts</h6>
            <h2>{reports.totalJobs}</h2>
          </Card>
        </div>
        <div className="col-md-3 mb-3">
          <Card className="card-custom text-center p-3">
            <h6>Applications</h6>
            <h2>{reports.totalApplications}</h2>
          </Card>
        </div>
      </div>

      {/* Recent Applications */}
      <Card className="card-custom p-3 mb-4">
        <h5>Recent Job Applications</h5>
        <Table striped bordered hover variant="dark" responsive className="mt-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Job Title</th>
              <th>Company</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentApplications.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No recent applications.
                </td>
              </tr>
            ) : (
              recentApplications.map((r, index) => (
                <tr key={r.id}>
                  <td>{index + 1}</td>
                  <td>{r.student}</td>
                  <td>{r.job}</td>
                  <td>{r.company}</td>
                  <td>{r.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <div className="text-end">
          <Button variant="outline-light" className="me-2" onClick={exportToCSV}>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={exportToPDF}>
            Export PDF
          </Button>
        </div>
      </Card>

      {/* Future Graph Placeholder */}
      <Card className="card-custom p-4 text-center">
        <h5>📊 Analytics Dashboard (Coming Soon)</h5>
        <p>Integrate chart libraries like Chart.js or Recharts here.</p>
      </Card>
    </div>
  );
}
