# VibeChat 💬✨

VibeChat is a modern, full-stack, real-time messaging application built using the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. It features real-time communication, room support, AI-powered chat summarization using Google Gemini, and a responsive, beautiful user interface.

## 🚀 Features

- **Real-Time Messaging**: Instant message delivery and reception powered by Socket.IO.
- **Secure Authentication**: User registration and login using JWT (JSON Web Tokens) and bcrypt for password hashing.
- **Room Support**: Users can create and join different chat rooms for organized conversations.
- **AI Integration (Gemini AI)**: Built-in "Summarize Chat" feature utilizing the Google Gemini API to give concise overviews of long conversations.
- **Online Presence Tracking**: See which users are currently online in real-time.
- **Typing Indicators**: Real-time visual feedback when a user is typing in a chat.
- **Responsive & Modern UI**: A sleek, user-friendly interface tailored for a premium user experience.

## 💻 Tech Stack

### Frontend
- **React.js** (Bootstrapped with Vite)
- **Zustand** (State Management)
- **React Router** (Navigation)
- **Socket.IO Client** (Real-time communication)
- **Axios** (HTTP requests)
- **Lucide React** (Icons)

### Backend
- **Node.js & Express.js** (Server framework)
- **MongoDB & Mongoose** (Database & ODM)
- **Socket.IO** (WebSockets for real-time events)
- **Google GenAI API** (For AI Chat Summarization)
- **JWT & bcryptjs** (Security & Authentication)

## 📂 Project Structure

```
VibeChat/
│
├── backend/                  # Express.js Server
│   ├── src/
│   │   ├── controllers/      # Route controllers (auth, chat, AI)
│   │   ├── models/           # Mongoose models (User, Message)
│   │   ├── routes/           # Express routes
│   │   ├── middleware/       # JWT auth middleware
│   │   └── socket.js         # Socket.IO logic
│   ├── server.js             # Entry point
│   ├── .env                  # Backend Environment variables
│   └── package.json
│
└── frontend/                 # React.js Client
    ├── src/
    │   ├── components/       # Reusable UI components (ChatBox, etc.)
    │   ├── pages/            # Page layouts (Login, Register, Chat)
    │   ├── store/            # Zustand stores for state
    │   ├── api.js            # Axios configuration & API calls
    │   ├── App.jsx           # Main React component
    │   └── main.jsx          # Entry point
    ├── .env                  # Frontend Environment variables
    └── package.json
```

## ⚙️ Environment Variables

To run this project locally, you will need to add the following environment variables to your `.env` files.

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🛠️ Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Chat Application"
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables:**
   - Create a `.env` file in the `backend` folder and add the required variables.
   - Create a `.env` file in the `frontend` folder and add the required variables.

5. **Start the Backend Server:**
   ```bash
   cd backend
   npm start
   ```

6. **Start the Frontend Development Server:**
   ```bash
   cd frontend
   npm run dev
   ```

## 🌐 Deployment Details

The application is fully configured for cloud deployment:
- **Database**: MongoDB Atlas
- **Backend**: Render (Web Service)
- **Frontend**: Vercel

### Notes on Deployment
- Ensure that the `FRONTEND_URL` in the backend's production environment variables points to the deployed Vercel URL.
- Ensure that the `VITE_API_URL` and `VITE_SOCKET_URL` in the frontend's Vercel project settings point to the deployed Render backend URL.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
