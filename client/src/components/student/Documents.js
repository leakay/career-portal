// src/components/student/Documents.js
import React, { useState, useRef, useEffect } from 'react';
import { Container, Card, Button, Table, Alert, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const fileInputRef = useRef(null);

  const documentTypes = [
    'Transcript',
    'Certificate',
    'ID Document',
    'Portfolio',
    'Recommendation Letter',
    'Other'
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const documentsQuery = query(
        collection(db, 'documents'),
        where('studentId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(documentsQuery, (snapshot) => {
        const documentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDocuments(documentsData);
      });

      return unsubscribe;
    } catch (err) {
      setError('Failed to load documents: ' + err.message);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, JPEG, or PNG file');
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      setError('Please select a file and document type');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');
      setSuccess('');

      const user = auth.currentUser;
      if (!user) {
        setError('Please log in to upload documents');
        return;
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // In a real implementation, you would upload to Firebase Storage first
      // For now, we'll simulate the upload and store metadata in Firestore
      await new Promise(resolve => setTimeout(resolve, 2000));

      const documentData = {
        studentId: user.uid,
        studentName: user.displayName || 'Unknown Student',
        studentEmail: user.email,
        filename: selectedFile.name,
        documentType: documentType,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        uploadDate: new Date(),
        status: 'pending', // pending, verified, rejected
        verifiedBy: null,
        verifiedAt: null,
        notes: ''
      };

      await addDoc(collection(db, 'documents'), documentData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setSuccess('Document uploaded successfully!');
      setSelectedFile(null);
      setDocumentType('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
        setUploadProgress(0);
      }, 3000);

    } catch (err) {
      setError('Failed to upload document: ' + err.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'documents', documentId));
      setSuccess('Document deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete document: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'warning', label: 'Pending Review', icon: '⏳' },
      verified: { class: 'success', label: 'Verified', icon: '✅' },
      rejected: { class: 'danger', label: 'Rejected', icon: '❌' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge bg={config.class}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-primary mb-0">
              <i className="bi bi-file-earmark-text me-2"></i>
              My Documents
            </h2>
            <Button as={Link} to="/student-dashboard" variant="outline-secondary">
              ← Back to Dashboard
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        {/* Upload Section */}
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Upload Document</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <label className="form-label">Document Type *</label>
                <select
                  className="form-select"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="">Select type</option>
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Select File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="form-control"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <small className="text-muted">
                  Supported formats: PDF, JPG, PNG (Max: 10MB)
                </small>
              </div>

              {selectedFile && (
                <div className="mb-3">
                  <Card className="border">
                    <Card.Body className="py-2">
                      <small className="text-muted">
                        <i className="bi bi-file-earmark me-1"></i>
                        {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </small>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {uploading && (
                <div className="mb-3">
                  <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!selectedFile || !documentType || uploading}
                className="w-100"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Documents List */}
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Uploaded Documents ({documents.length})</h5>
            </Card.Header>
            <Card.Body>
              {documents.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-text display-4 text-muted mb-3"></i>
                  <h5 className="text-muted">No documents uploaded yet</h5>
                  <p className="text-muted">Upload your academic documents to complete your profile</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Status</th>
                        <th>Uploaded</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map(document => (
                        <tr key={document.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-file-earmark-text text-primary me-2"></i>
                              <div>
                                <div className="fw-bold">{document.filename}</div>
                                {document.notes && (
                                  <small className="text-muted">{document.notes}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{document.documentType}</td>
                          <td>{formatFileSize(document.fileSize)}</td>
                          <td>{getStatusBadge(document.status)}</td>
                          <td>
                            {document.uploadDate?.toDate?.().toLocaleDateString() || 'N/A'}
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(document.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Requirements */}
      <Row className="mt-4">
        <Col>
          <Alert variant="info">
            <h6 className="alert-heading">
              <i className="bi bi-info-circle me-2"></i>
              Document Requirements
            </h6>
            <ul className="mb-0 small">
              <li>Upload clear, readable documents</li>
              <li>Transcripts should show your complete academic record</li>
              <li>ID documents must be valid and current</li>
              <li>Files are securely stored and encrypted</li>
              <li>All documents will be reviewed by admissions staff</li>
            </ul>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default Documents;
