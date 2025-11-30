const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = getFirestore();

const testCompanies = [
  {
    companyName: 'TechCorp Solutions',
    industry: 'Technology',
    size: '51-200',
    website: 'https://techcorp.com',
    description: 'Leading technology solutions provider specializing in software development and digital transformation.',
    contactEmail: 'hr@techcorp.com',
    phone: '+266 1234 5678',
    address: 'Maseru, Lesotho',
    foundedYear: '2015',
    benefits: 'Health insurance, remote work, professional development',
    culture: 'Innovative and collaborative work environment',
    linkedin: 'https://linkedin.com/company/techcorp',
    twitter: 'https://twitter.com/techcorp',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    companyName: 'Lesotho Financial Services',
    industry: 'Finance',
    size: '201-500',
    website: 'https://lesothofinance.ls',
    description: 'Comprehensive financial services including banking, insurance, and investment management.',
    contactEmail: 'careers@lesothofinance.ls',
    phone: '+266 2233 4455',
    address: 'Kingsway, Maseru, Lesotho',
    foundedYear: '2008',
    benefits: 'Competitive salary, pension scheme, training programs',
    culture: 'Professional and customer-focused organization',
    linkedin: 'https://linkedin.com/company/lesothofinance',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    companyName: 'GreenTech Innovations',
    industry: 'Renewable Energy',
    size: '11-50',
    website: 'https://greentech.ls',
    description: 'Pioneering renewable energy solutions for sustainable development in Lesotho.',
    contactEmail: 'jobs@greentech.ls',
    phone: '+266 3344 5566',
    address: 'Industrial Area, Maseru, Lesotho',
    foundedYear: '2019',
    benefits: 'Flexible hours, environmental impact focus, innovation bonuses',
    culture: 'Sustainability-driven and forward-thinking',
    linkedin: 'https://linkedin.com/company/greentech-innovations',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    companyName: 'EduTech Lesotho',
    industry: 'Education Technology',
    size: '1-10',
    website: 'https://edutech.ls',
    description: 'Developing educational technology solutions to enhance learning outcomes.',
    contactEmail: 'hello@edutech.ls',
    phone: '+266 4455 6677',
    address: 'Roma, Lesotho',
    foundedYear: '2020',
    benefits: 'Education stipend, flexible work, impact-driven work',
    culture: 'Education-focused and innovative startup culture',
    linkedin: 'https://linkedin.com/company/edutech-lesotho',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    companyName: 'Logistics Plus',
    industry: 'Logistics',
    size: '51-200',
    website: 'https://logisticsplus.ls',
    description: 'Comprehensive logistics and supply chain management services.',
    contactEmail: 'recruitment@logisticsplus.ls',
    phone: '+266 5566 7788',
    address: 'Border Gate Area, Maseru, Lesotho',
    foundedYear: '2012',
    benefits: 'Travel allowance, performance bonuses, career progression',
    culture: 'Efficient and customer-oriented logistics company',
    linkedin: 'https://linkedin.com/company/logistics-plus',
    status: 'suspended',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function addTestCompanies() {
  try {
    console.log('Adding test companies to database...');

    for (const company of testCompanies) {
      const docRef = await db.collection('companies').add(company);
      console.log(`✅ Added company: ${company.companyName} (ID: ${docRef.id})`);
    }

    console.log('\n🎉 All test companies added successfully!');
    console.log('You can now view them in the Admin Company Management section.');

  } catch (error) {
    console.error('❌ Error adding test companies:', error);
  }
}

addTestCompanies().then(() => process.exit(0));
