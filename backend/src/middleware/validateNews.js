const { body, validationResult } = require('express-validator');

// Validation rules for news articles
const validateNewsCreate = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  
  body('excerpt')
    .trim()
    .notEmpty().withMessage('Excerpt is required')
    .isLength({ min: 1, max: 500 }).withMessage('Excerpt must be between 1 and 500 characters'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 1 }).withMessage('Content must be at least 1 character'),
  
  body('category')
    .optional()
    .isIn(['policy', 'technology', 'wellness', 'education', 'leadership', 'finance', 'news'])
    .withMessage('Category must be one of: policy, technology, wellness, education, leadership, finance, news'),
  
  body('author')
    .trim()
    .notEmpty().withMessage('Author is required')
    .isLength({ min: 2, max: 100 }).withMessage('Author name must be between 2 and 100 characters'),
  
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('status')
    .optional()
    .isIn(['published', 'draft', 'archived'])
    .withMessage('Invalid status'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('featured')
    .optional()
    .isBoolean().withMessage('Featured must be a boolean'),
];

const validateNewsUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  
  body('excerpt')
    .optional()
    .trim()
    .notEmpty().withMessage('Excerpt cannot be empty')
    .isLength({ min: 1, max: 500 }).withMessage('Excerpt must be between 1 and 500 characters'),
  
  body('content')
    .optional()
    .trim()
    .notEmpty().withMessage('Content cannot be empty')
    .isLength({ min: 1 }).withMessage('Content must be at least 1 character'),
  
  body('category')
    .optional()
    .isIn(['policy', 'technology', 'wellness', 'education', 'leadership', 'finance', 'news'])
    .withMessage('Category must be one of: policy, technology, wellness, education, leadership, finance, news'),
  
  body('author')
    .optional()
    .trim()
    .notEmpty().withMessage('Author cannot be empty')
    .isLength({ min: 2, max: 100 }).withMessage('Author name must be between 2 and 100 characters'),
  
  body('slug')
    .optional()
    .trim()
    .notEmpty().withMessage('Slug cannot be empty')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  
  body('status')
    .optional()
    .isIn(['published', 'draft', 'archived'])
    .withMessage('Invalid status'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('featured')
    .optional()
    .isBoolean().withMessage('Featured must be a boolean'),
];

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

module.exports = {
  validateNewsCreate,
  validateNewsUpdate,
  handleValidationErrors
};
