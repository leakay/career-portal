const { body } = require('express-validator');

// User registration validation
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('role')
    .optional()
    .isIn(['student', 'employer'])
    .withMessage('Role must be either student or employer'),

  body('university')
    .if(body('role').equals('student'))
    .notEmpty()
    .withMessage('University is required for students')
    .isIn(['National University of Lesotho', 'Limkokwing University', 'Botho University'])
    .withMessage('Please select a valid university')
];

// User login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Job creation validation
exports.validateJob = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Job title must be between 5 and 100 characters'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Company name must be between 2 and 50 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 50, max: 2000 })
    .withMessage('Job description must be between 50 and 2000 characters'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),

  body('type')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'])
    .withMessage('Please select a valid job type'),

  body('category')
    .isIn(['Technology', 'Business', 'Healthcare', 'Education', 'Creative', 'Other'])
    .withMessage('Please select a valid category'),

  body('salary')
    .optional()
    .isNumeric()
    .withMessage('Salary must be a number')
    .isInt({ min: 0 })
    .withMessage('Salary must be a positive number'),

  body('applicationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Application deadline must be in the future');
      }
      return true;
    })
];

// Review validation
exports.validateReview = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Review title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Review content is required')
    .isLength({ min: 50, max: 1000 })
    .withMessage('Review must be between 50 and 1000 characters'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('university')
    .notEmpty()
    .withMessage('University is required')
    .isIn(['National University of Lesotho', 'Limkokwing University', 'Botho University'])
    .withMessage('Please select a valid university'),

  body('course')
    .trim()
    .notEmpty()
    .withMessage('Course name is required')
];

// Application validation
exports.validateApplication = [
  body('jobId')
    .isMongoId()
    .withMessage('Valid job ID is required'),

  body('coverLetter')
    .trim()
    .notEmpty()
    .withMessage('Cover letter is required')
    .isLength({ min: 100, max: 2000 })
    .withMessage('Cover letter must be between 100 and 2000 characters'),

  body('resume')
    .optional()
    .isURL()
    .withMessage('Resume must be a valid URL')
];

// Course application validation
exports.validateCourseApplication = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('phone')
    .optional()
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Please provide a valid phone number'),

  body('university')
    .notEmpty()
    .withMessage('University selection is required')
    .isIn(['National University of Lesotho', 'Limkokwing University', 'Botho University'])
    .withMessage('Please select a valid university'),

  body('course')
    .trim()
    .notEmpty()
    .withMessage('Course selection is required'),

  body('level')
    .isIn(['Certificate', 'Diploma', 'Undergraduate', 'Postgraduate'])
    .withMessage('Please select a valid education level')
];

// ID parameter validation
exports.validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Pagination validation
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];