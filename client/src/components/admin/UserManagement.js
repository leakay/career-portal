import React, { useState } from "react";
import { Table, Button, Form, Card, Alert } from "react-bootstrap";

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: "Motsamai Ralejoe", role: "Student", email: "motsamai@example.com" },
    { id: 2, name: "Lerato Mokete", role: "Admin", email: "lerato@limkokwing.edu" },
    { id: 3, name: "Thabo Letsie", role: "Company", email: "thabo@botho.co.ls" },
  ]);

  const [message, setMessage] = useState("");

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
      setMessage("🗑️ User deleted successfully!");
      setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <div className="bg-dark text-light p-4 rounded">
      <h2 className="text-center mb-4">👥 User Management</h2>

      {message && <Alert variant="success">{message}</Alert>}

      <Card className="card-custom p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Control
            type="text"
            placeholder="Search users..."
            className="w-50"
          />
          <Button variant="outline-light">+ Add New User</Button>
        </div>

        <Table striped bordered hover variant="dark" responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u, index) => (
                <tr key={u.id}>
                  <td>{index + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
                  <td>{u.email}</td>
                  <td>
                    <Button
                      variant="outline-light"
                      size="sm"
                      className="me-2"
                      onClick={() => alert("Edit user feature coming soon!")}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(u.id)}
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
    </div>
  );
}
