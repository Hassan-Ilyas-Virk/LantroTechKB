const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  getTags, 
  createTag, 
  updateTag, 
  deleteTag 
} = require('../controllers/tagController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');

const tagValidation = [
  body('name').trim().notEmpty().withMessage('Tag name is required').isLength({ max: 30 }),
  body('category').optional().isIn(['technical', 'hr', 'process', 'general'])
];

router.route('/')
  .get(getTags)
  .post(auth, tagValidation, validate, createTag);

router.route('/:id')
  .put(auth, admin, tagValidation, validate, updateTag)
  .delete(auth, admin, deleteTag);

module.exports = router;
