const express = require('express');
const router = express.Router();
const { generateAIResponse, summarizeRoom } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, generateAIResponse);
router.get('/summarize/:roomId', protect, summarizeRoom);


module.exports = router;
