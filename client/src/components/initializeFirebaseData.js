import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const initializeApplications = async () => {
  try {
    // Clear existing applications first
    const existingApps = await getDocs(collection(db, 'applications'));
    const deletePromises = existingApps.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log('Cleared existing applications');

    // Add sample applications
    const applications = [
      {
        studentId: 'kazzy123',
        studentName: 'kazzy',
        studentEmail: 'kazzy@student.edu',
        institution: 'National University of Lesotho',
        institutionId: 'nul',
        course: 'Law',
        appliedDate: new Date('2025-11-05'),
        status: 'Initial Parties',
        documents: {
          transcript: { filename: 'transcript.pdf', url: '/docs/transcript.pdf' },
          personalStatement: { filename: 'personal_statement.docx', url: '/docs/personal_statement.docx' }
        },
        lastUpdated: new Date('2025-11-05'),
        createdAt: new Date()
      },
      {
        studentId: 'kazzy123',
        studentName: 'kazzy',
        studentEmail: 'kazzy@student.edu',
        institution: 'Botho University',
        institutionId: 'botho',
        course: 'Networking',
        appliedDate: new Date('2025-11-05'),
        status: 'Initial Parties',
        documents: {
          transcript: { filename: 'transcript.pdf', url: '/docs/transcript.pdf' },
          personalStatement: { filename: 'personal_statement.docx', url: '/docs/personal_statement.docx' }
        },
        lastUpdated: new Date('2025-11-05'),
        createdAt: new Date()
      },
      {
        studentId: 'kazzy123',
        studentName: 'kazzy',
        studentEmail: 'kazzy@student.edu',
        institution: 'Limkokwing University',
        institutionId: 'limkokwing',
        course: 'IT',
        appliedDate: new Date('2025-11-05'),
        status: 'Initial Parties',
        documents: {
          transcript: { filename: 'transcript.pdf', url: '/docs/transcript.pdf' },
          personalStatement: { filename: 'personal_statement.docx', url: '/docs/personal_statement.docx' }
        },
        lastUpdated: new Date('2025-11-05'),
        createdAt: new Date()
      }
    ];

    for (const application of applications) {
      await addDoc(collection(db, 'applications'), application);
    }

    console.log('Sample applications initialized successfully!');
    console.log('3 applications added for kazzy');
  } catch (error) {
    console.error('Error initializing applications:', error);
  }
};

// Run the initialization
initializeApplications();