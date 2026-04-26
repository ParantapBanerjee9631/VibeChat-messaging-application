import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';

function App() {
  const { user } = useAuthStore();

  return (
    <Routes>
      <Route path="/" element={user ? <Chat /> : <Navigate to="/login" />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
