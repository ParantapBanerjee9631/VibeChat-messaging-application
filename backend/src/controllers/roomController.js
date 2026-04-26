const Room = require('../models/Room');

const createRoom = async (req, res) => {
  try {
    const { name, isPrivate } = req.body;
    const userId = req.user._id;

    const newRoom = new Room({
      name,
      isPrivate: isPrivate || false,
      createdBy: userId,
      members: [userId] // The creator is automatically a member
    });

    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
};

const getRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get public rooms and private rooms where the user is a member
    const rooms = await Room.find({
      $or: [
        { isPrivate: false },
        { isPrivate: true, members: userId }
      ]
    }).populate('createdBy', 'username');

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Add user to members if not already a member
    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    res.json({ message: 'Joined room successfully', room });
  } catch (error) {
    res.status(500).json({ message: 'Error joining room', error: error.message });
  }
};

module.exports = { createRoom, getRooms, joinRoom };
