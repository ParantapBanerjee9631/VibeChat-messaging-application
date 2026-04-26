const Message = require('./models/Message');
const User = require('./models/User');
const { checkToxicity } = require('./controllers/aiController');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins with their ID to track online status easily
    socket.on('user_connected', async (userId) => {
      if (userId) {
        socket.userId = userId;
        await User.findByIdAndUpdate(userId, { isOnline: true });
        io.emit('user_status_change', { userId, isOnline: true });
      }
    });

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
    });

    socket.on('send_message', async (data) => {
      const { sender, roomId, text } = data;
      try {
        const isToxic = await checkToxicity(text);
        if (isToxic) {
           return socket.emit('message_error', { message: 'Your message was blocked by the AI moderator for violating community guidelines.' });
        }

        const message = await Message.create({ sender, roomId, text });
        const populatedMessage = await Message.findById(message._id).populate('sender', 'username');
        io.to(roomId).emit('receive_message', populatedMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('typing', (data) => {
      const { roomId, username, isTyping } = data;
      socket.to(roomId).emit('user_typing', { username, isTyping });
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false });
        io.emit('user_status_change', { userId: socket.userId, isOnline: false });
      }
    });
  });
};

module.exports = initSocket;
