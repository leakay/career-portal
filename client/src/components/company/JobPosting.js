import React, { useState } from "react";
import { Card, Form, Button, Alert, Row, Col, Badge } from "react-bootstrap";
import axios from "axios";
import { useAuth } from '../contexts/AuthContext';

export default function JobPosting() {
  const { user, userProfile } = useAuth();
  const [job, setJob] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    category: "technology",
    type: "full-time",
    salary: { min: "", max: "", currency: "USD" },
    requiredSkills: [],
    preferredUniversities: [],
    applicationDeadline: "",
    startDate: "",
    benefits: [],
    remote: false,
    urgent: false,
    featured: false
  });
  const [skillInput, setSkillInput] = useState("");
  const [universityInput, setUniversityInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setJob({ ...job, [name]: checked });
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setJob({
        ...job,
        [parent]: { ...job[parent], [child]: value }
      });
    } else {
      setJob({ ...job, [name]: value });
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !job.requiredSkills.includes(skillInput.trim())) {
      setJob({
        ...job,
        requiredSkills: [...job.requiredSkills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setJob({
      ...job,
      requiredSkills: job.requiredSkills.filter(s => s !== skill)
    });
  };

  const addUniversity = () => {
    if (universityInput.trim() && !job.preferredUniversities.includes(universityInput.trim())) {
      setJob({
        ...job,
        preferredUniversities: [...job.preferredUniversities, universityInput.trim()]
      });
      setUniversityInput("");
    }
  };

  const removeUniversity = (university) => {
    setJob({
      ...job,
      preferredUniversities: job.preferredUniversities.filter(u => u !== university)
    });
  };

  const addBenefit = () => {
    if (benefitInput.trim() && !job.benefits.includes(benefitInput.trim())) {
      setJob({
        ...job,
        benefits: [...job.benefits, benefitInput.trim()]
      });
      setBenefitInput("");
    }
  };

  const removeBenefit = (benefit) => {
    setJob({
      ...job,
      benefits: job.benefits.filter(b => b !== benefit)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    if (!job.title || !job.description || !job.requirements) {
      setStatus("❌ Please fill out all required fields (title, description, requirements).");
      setLoading(false);
      return;
    }

    try {
      // Ensure we send a valid ID token for backend auth (optional for this backend)
      const token = localStorage.getItem('token') || (user && await user.getIdToken());
      const jobData = {
        ...job,
        employer: user?.uid || userProfile?.companyId || "demo-company-id",
        companyName: userProfile?.companyName || userProfile?.name || "Demo Company",
        companyId: userProfile?.companyId || user?.uid || "demo-company-id"
      };

      // The backend in `backend/functions/server.js` exposes `/jobs` and
      // `/companies/:companyId/jobs`. Use the simpler `/jobs` POST endpoint.
      const response = await axios.post("http://localhost:5000/jobs", jobData, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      // Handle updated stats from Firebase immediately after job creation
      if (response.data.updatedStats) {
        console.log('Updated company stats from Firebase:', response.data.updatedStats);
        // Store updated stats in localStorage for dashboard to pick up
        localStorage.setItem('companyStatsUpdate', JSON.stringify({
          timestamp: Date.now(),
          stats: response.data.updatedStats
        }));
      }

      setStatus(`✅ Job posted successfully! Your dashboard has been updated with the latest stats from Firebase.`);
      // Reset form
      setJob({
        title: "",
        description: "",
        requirements: "",
        responsibilities: "",
        location: "",
        category: "technology",
        type: "full-time",
        salary: { min: "", max: "", currency: "USD" },
        requiredSkills: [],
        preferredUniversities: [],
        applicationDeadline: "",
        startDate: "",
        benefits: [],
        remote: false,
        urgent: false,
        featured: false
      });
    } catch (err) {
      console.error("Error posting job:", err);
      setStatus("❌ Failed to post job. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <Button variant="outline-secondary" className="mb-3" onClick={() => window.history.back()}>
        ← Back
      </Button>
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h3 className="mb-0">📝 Post New Job</h3>
          <p className="mb-0 opacity-75">Create a comprehensive job posting with detailed requirements</p>
        </Card.Header>

        <Card.Body>
          {status && <Alert variant={status.includes("✅") ? "success" : "danger"}>{status}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">📋 Basic Information</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Title *</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={job.title}
                      onChange={handleChange}
                      placeholder="e.g. Senior Software Engineer"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Category</Form.Label>
                    <Form.Select name="category" value={job.category} onChange={handleChange}>
                      <option value="technology">Technology</option>
                      <option value="business">Business</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="creative">Creative</option>
                      <option value="sales">Sales</option>
                      <option value="marketing">Marketing</option>
                      <option value="engineering">Engineering</option>
                      <option value="design">Design</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Type</Form.Label>
                    <Form.Select name="type" value={job.type} onChange={handleChange}>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={job.location}
                      onChange={handleChange}
                      placeholder="City, Country or 'Remote'"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Job Description */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">📝 Job Description</h5>
              <Form.Group className="mb-3">
                <Form.Label>Job Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={job.description}
                  onChange={handleChange}
                  placeholder="Describe the role, team, and company culture..."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Requirements *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="requirements"
                  value={job.requirements}
                  onChange={handleChange}
                  placeholder="List the qualifications, experience, and skills required..."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Responsibilities</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="responsibilities"
                  value={job.responsibilities}
                  onChange={handleChange}
                  placeholder="Describe the main responsibilities and duties..."
                />
              </Form.Group>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">🛠️ Required Skills</h5>
              <Row>
                <Col md={8}>
                  <Form.Control
                    type="text"
                    placeholder="Add a required skill (e.g. JavaScript, React, Python)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                </Col>
                <Col md={4}>
                  <Button variant="outline-primary" onClick={addSkill} className="w-100">
                    Add Skill
                  </Button>
                </Col>
              </Row>
              <div className="mt-2">
                {job.requiredSkills.map((skill, index) => (
                  <Badge key={index} bg="secondary" className="me-2 mb-2 p-2">
                    {skill}
                    <Button
                      variant="link"
                      size="sm"
                      className="text-white ms-2 p-0"
                      onClick={() => removeSkill(skill)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Universities */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">🎓 Preferred Universities</h5>
              <Row>
                <Col md={8}>
                  <Form.Control
                    type="text"
                    placeholder="Add preferred university (e.g. National University of Lesotho)"
                    value={universityInput}
                    onChange={(e) => setUniversityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUniversity())}
                  />
                </Col>
                <Col md={4}>
                  <Button variant="outline-primary" onClick={addUniversity} className="w-100">
                    Add University
                  </Button>
                </Col>
              </Row>
              <div className="mt-2">
                {job.preferredUniversities.map((university, index) => (
                  <Badge key={index} bg="info" className="me-2 mb-2 p-2">
                    {university}
                    <Button
                      variant="link"
                      size="sm"
                      className="text-white ms-2 p-0"
                      onClick={() => removeUniversity(university)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Salary */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">💰 Salary Range</h5>
              <Row>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    placeholder="Min"
                    name="salary.min"
                    value={job.salary.min}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    type="number"
                    placeholder="Max"
                    name="salary.max"
                    value={job.salary.max}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={3}>
                  <Form.Select name="salary.currency" value={job.salary.currency} onChange={handleChange}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="ZAR">ZAR</option>
                  </Form.Select>
                </Col>
              </Row>
            </div>

            {/* Dates */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">📅 Important Dates</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Application Deadline</Form.Label>
                    <Form.Control
                      type="date"
                      name="applicationDeadline"
                      value={job.applicationDeadline}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={job.startDate}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Benefits */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">🎁 Benefits</h5>
              <Row>
                <Col md={8}>
                  <Form.Control
                    type="text"
                    placeholder="Add a benefit (e.g. Health Insurance, Flexible Hours)"
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  />
                </Col>
                <Col md={4}>
                  <Button variant="outline-primary" onClick={addBenefit} className="w-100">
                    Add Benefit
                  </Button>
                </Col>
              </Row>
              <div className="mt-2">
                {job.benefits.map((benefit, index) => (
                  <Badge key={index} bg="success" className="me-2 mb-2 p-2">
                    {benefit}
                    <Button
                      variant="link"
                      size="sm"
                      className="text-white ms-2 p-0"
                      onClick={() => removeBenefit(benefit)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">⚙️ Additional Options</h5>
              <Row>
                <Col md={4}>
                  <Form.Check
                    type="checkbox"
                    label="Remote Work Available"
                    name="remote"
                    checked={job.remote}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="checkbox"
                    label="Urgent Hiring"
                    name="urgent"
                    checked={job.urgent}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="checkbox"
                    label="Featured Job"
                    name="featured"
                    checked={job.featured}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </div>

            <div className="text-center">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="px-5"
              >
                {loading ? "Posting Job..." : "📤 Post Job"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
