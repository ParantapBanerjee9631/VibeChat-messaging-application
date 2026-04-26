require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const initSocket = require('./src/socket');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern-chat';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rooms', roomRoutes);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
