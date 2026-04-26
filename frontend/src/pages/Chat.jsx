import { useEffect } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';

const Chat = () => {
  const { user } = useAuthStore();
  const { setSocket, addMessage, updateUserStatus, setTyping, activeRoom } = useChatStore();

  useEffect(() => {
    if (!user) return;

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    // Connect to Socket.IO Server
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('user_connected', user._id);
    });

    // Listeners
    newSocket.on('receive_message', (message) => {
      const isMessageForCurrentRoom = message.roomId === useChatStore.getState().activeRoom;
      if (isMessageForCurrentRoom) {
        addMessage(message);
      }
    });

    newSocket.on('message_deleted', (messageId) => {
      useChatStore.getState().removeMessage(messageId);
    });

    newSocket.on('user_status_change', ({ userId, isOnline }) => {
      updateUserStatus(userId, isOnline);
    });

    newSocket.on('user_typing', ({ username, isTyping }) => {
      setTyping(isTyping, username);
    });

    // Cleanup to avoid duplicate listeners
    return () => {
      newSocket.off('receive_message');
      newSocket.off('message_deleted');
      newSocket.off('user_status_change');
      newSocket.off('user_typing');
      newSocket.disconnect();
    };
  }, [user, setSocket, addMessage, updateUserStatus, setTyping]);

  useEffect(() => {
    const socket = useChatStore.getState().socket;
    if (socket && activeRoom) {
      socket.emit('join_room', activeRoom);
      
      return () => {
        socket.emit('leave_room', activeRoom);
      };
    }
  }, [activeRoom]);

  return (
    <div className="chat-layout">
      <Sidebar />
      <ChatBox />
    </div>
  );
};

export default Chat;
