import { create } from 'zustand';
import api from '../api';

const useChatStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  rooms: [],
  activeRoom: null,
  activeUser: null,
  activeGroupRoom: null,
  messages: [],
  isTyping: false,
  typingUser: null,
  chatSummary: null,
  smartReplies: [],
  isAIProcessing: false,

  setSocket: (socket) => set({ socket }),
  
  setActiveRoom: async (user, currentUserId) => {
    const roomId = [user._id, currentUserId].sort().join('_');
    set({ activeUser: user, activeGroupRoom: null, activeRoom: roomId, chatSummary: null, smartReplies: [] });
    
    try {
      const res = await api.get(`/chat/${roomId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error('Failed to load messages', error);
      set({ messages: [] });
    }
  },

  setActiveGroupRoom: async (room) => {
    set({ activeUser: null, activeGroupRoom: room, activeRoom: room._id, chatSummary: null, smartReplies: [] });
    
    try {
      const res = await api.get(`/chat/${room._id}`);
      set({ messages: res.data });
    } catch (error) {
      console.error('Failed to load messages', error);
      set({ messages: [] });
    }
  },

  fetchRooms: async () => {
    try {
      const res = await api.get('/rooms');
      set({ rooms: res.data });
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  },

  createRoom: async (name, isPrivate) => {
    try {
      const res = await api.post('/rooms', { name, isPrivate });
      set((state) => ({ rooms: [...state.rooms, res.data] }));
      return res.data;
    } catch (error) {
      console.error('Failed to create room', error);
      throw error;
    }
  },

  joinRoom: async (roomId) => {
    try {
      await api.post(`/rooms/${roomId}/join`);
      // Re-fetch rooms to update members list if needed
      get().fetchRooms();
    } catch (error) {
      console.error('Failed to join room', error);
    }
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  removeMessage: (messageId) => {
    set((state) => ({ messages: state.messages.filter(m => m._id !== messageId) }));
  },

  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  updateUserStatus: (userId, isOnline) => {
    set((state) => ({
      onlineUsers: state.onlineUsers.map(u => 
        u._id === userId ? { ...u, isOnline } : u
      )
    }));
  },

  setTyping: (isTyping, typingUser) => set({ isTyping, typingUser }),

  askAI: async (text) => {
    const { activeRoom, messages } = get();
    if (!activeRoom) return;
    
    set({ isAIProcessing: true });
    try {
      const res = await api.post('/ai', { roomId: activeRoom, input: text });
      const aiMessage = {
        _id: Date.now().toString(),
        sender: { _id: 'ai', username: 'AI Assistant' },
        roomId: activeRoom,
        text: res.data.response,
        createdAt: new Date().toISOString()
      };
      set((state) => ({ messages: [...state.messages, aiMessage] }));
    } catch (error) {
      console.error('AI Request Failed', error);
    } finally {
      set({ isAIProcessing: false });
    }
  },

  summarizeChat: async () => {
    const { activeRoom } = get();
    if (!activeRoom) return;
    
    set({ isAIProcessing: true });
    try {
      const res = await api.get(`/ai/summarize/${activeRoom}`);
      set({ chatSummary: res.data.summary });
    } catch (error) {
      console.error('Summarize Request Failed', error);
    } finally {
      set({ isAIProcessing: false });
    }
  },

  fetchSmartReplies: async (lastMessage) => {
    if (!lastMessage) return;
    try {
      const res = await api.post('/ai/smart-replies', { lastMessage });
      set({ smartReplies: res.data.replies });
    } catch (error) {
      console.error('Smart Replies Failed', error);
    }
  },
  
  clearSmartReplies: () => set({ smartReplies: [] })
}));

export default useChatStore;
