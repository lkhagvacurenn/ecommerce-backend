const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoriesController');

router.post('/create', categoryController.createCategory);
router.get('/:slug', categoryController.getCategoryBySlug);
router.get('/', categoryController.getAllCategories);

module.exports = router;