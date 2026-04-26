const express = require('express');
const router = express.Router();
const { generateAIResponse, summarizeRoom, generateSmartReplies } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, generateAIResponse);
router.get('/summarize/:roomId', protect, summarizeRoom);
router.post('/smart-replies', protect, generateSmartReplies);

module.exports = router;
