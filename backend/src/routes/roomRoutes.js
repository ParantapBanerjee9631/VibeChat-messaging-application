const express = require('express');
const { createRoom, getRooms, joinRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All room routes require authentication
router.use(protect);

router.post('/', createRoom);
router.get('/', getRooms);
router.post('/:roomId/join', joinRoom);

module.exports = router;
