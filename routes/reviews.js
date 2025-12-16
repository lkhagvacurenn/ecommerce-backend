const express = require('express');
const  router = express.Router();
const protect = require("../middleware/auth");
const reviewsController = require('../controllers/reviewsController');

router.post('/create', protect, reviewsController.createReview);
router.get('/by-product', reviewsController.getReviewsByProduct);
router.get('/', reviewsController.getReviewByProductAndUser);

module.exports = router;