import React, { useState, useEffect } from "react";
import { Card, Button, Table, Modal, Form } from "react-bootstrap";
import axios from "axios";

export default function InstitutionManagement() {
  const [institutions, setInstitutions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newInstitution, setNewInstitution] = useState({
    name: "",
    location: "",
    admin: "",
  });

  // Fetch institutions (from backend or default)
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const API_BASE =
          process.env.REACT_APP_API_BASE || "http://localhost:5000";
        const res = await axios.get(`${API_BASE}/institutions`);
        setInstitutions(res.data);
      } catch (err) {
        console.warn("⚠️ Using default universities (offline mode)");
        setInstitutions([
          {
            id: 1,
            name: "LIMKOKWING UNIVERSITY",
            location: "Maseru",
            admin: "admin@limkokwing.ac.ls",
          },
          {
            id: 2,
            name: "NATIONAL UNIVERSITY OF LESOTHO",
            location: "Roma",
            admin: "admin@nul.ls",
          },
          {
            id: 3,
            name: "BOTHO UNIVERSITY",
            location: "Maseru",
            admin: "admin@botho.ls",
          },
        ]);
      }
    };

    fetchInstitutions();
  }, []);

  // Handle input
  const handleChange = (e) =>
    setNewInstitution({ ...newInstitution, [e.target.name]: e.target.value });

  // Add new institution
  const handleAddInstitution = async (e) => {
    e.preventDefault();
    if (!newInstitution.name || !newInstitution.location || !newInstitution.admin) {
      alert("All fields are required!");
      return;
    }

    try {
      const API_BASE =
        process.env.REACT_APP_API_BASE || "http://localhost:5000";
      await axios.post(`${API_BASE}/institutions`, newInstitution);
      setInstitutions([...institutions, newInstitution]);
      setNewInstitution({ name: "", location: "", admin: "" });
      setShowModal(false);
    } catch (err) {
      console.error("Error adding institution:", err);
      alert("Failed to add institution (backend unavailable).");
    }
  };

  // Delete institution (temporary local delete)
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this institution?")) {
      setInstitutions(institutions.filter((inst) => inst.id !== id));
      // Later: await axios.delete(`${API_BASE}/institutions/${id}`);
    }
  };

  return (
    <div className="bg-dark text-light p-4 rounded">
      <h2 className="mb-4 text-center">Institution Management</h2>

      {/* Table */}
      <Card className="card-custom p-3">
        <Table striped bordered hover variant="dark" responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Institution Name</th>
              <th>Location</th>
              <th>Admin Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {institutions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No institutions available.
                </td>
              </tr>
            ) : (
              institutions.map((inst, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{inst.name}</td>
                  <td>{inst.location}</td>
                  <td>{inst.admin}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-warning"
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(inst.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* (Add Institution button and modal removed) */}
    </div>
  );
}
