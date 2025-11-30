import React, { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setSettings({ ...settings, [name]: checked });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setMessage("✅ System settings saved successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="bg-dark text-light p-4 rounded">
      <h2 className="mb-4 text-center">⚙️ System Settings</h2>

      {message && <Alert variant="success">{message}</Alert>}

      <Card className="card-custom p-4">
        <Form onSubmit={handleSave}>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="maintenanceMode"
              name="maintenanceMode"
              label="Enable Maintenance Mode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Temporarily disable system access for updates or maintenance.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="emailNotifications"
              name="emailNotifications"
              label="Email Notifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Notify admins and users via email when key actions occur.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check
              type="switch"
              id="autoBackup"
              name="autoBackup"
              label="Automatic Database Backup"
              checked={settings.autoBackup}
              onChange={handleChange}
            />
            <Form.Text className="text-muted">
              Automatically back up data daily at 12:00 AM.
            </Form.Text>
          </Form.Group>

          <div className="text-center">
            <Button variant="outline-light" type="submit">
              Save Settings
            </Button>
          </div>
        </Form>
      </Card>

      <Card className="card-custom p-4 mt-4">
        <h5>🧰 Advanced Options (Coming Soon)</h5>
        <p>
          Future updates will include system logs, API keys, admin roles, and
          audit tracking.
        </p>
      </Card>
    </div>
  );
}
