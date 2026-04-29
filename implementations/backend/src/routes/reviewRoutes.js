const express = require('express');
const { createReview, getReviewsByCar } = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, createReview);
router.get('/car/:carId', getReviewsByCar);

module.exports = router;
