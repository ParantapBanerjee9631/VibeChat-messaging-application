import { useEffect, useState } from 'react';
import { LogOut, Plus, Hash } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import api from '../api';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { onlineUsers, setOnlineUsers, setActiveRoom, activeUser, rooms, fetchRooms, activeGroupRoom, setActiveGroupRoom, createRoom, joinRoom } = useChatStore();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'rooms'
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    const fetchUsersAndRooms = async () => {
      try {
        const res = await api.get('/auth/users');
        setOnlineUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
      fetchRooms();
    };
    fetchUsersAndRooms();
  }, [setOnlineUsers, fetchRooms]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    try {
      await createRoom(newRoomName, false);
      setNewRoomName('');
      setShowCreateRoom(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoinRoom = async (roomId) => {
    await joinRoom(roomId);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Chats</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem' }}>{user?.username}</span>
          <LogOut size={20} className="logout-icon" onClick={logout} />
        </div>
      </div>
      <div className="sidebar-tabs" style={{ display: 'flex', borderBottom: '1px solid #1e293b' }}>
        <button 
          style={{ flex: 1, padding: '0.75rem', background: activeTab === 'users' ? '#1e293b' : 'transparent', border: 'none', color: activeTab === 'users' ? '#10b981' : '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => setActiveTab('users')}
        >
          Direct Messages
        </button>
        <button 
          style={{ flex: 1, padding: '0.75rem', background: activeTab === 'rooms' ? '#1e293b' : 'transparent', border: 'none', color: activeTab === 'rooms' ? '#10b981' : '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => setActiveTab('rooms')}
        >
          Rooms
        </button>
      </div>

      <div className="user-list">
        {activeTab === 'users' && (
          <>
            {onlineUsers.map((u) => (
              <div 
                key={u._id} 
                className={`user-item ${activeUser?._id === u._id ? 'active' : ''}`}
                onClick={() => setActiveRoom(u, user._id)}
              >
                <div className="user-avatar">
                  {u.username.charAt(0).toUpperCase()}
                  <div className={`status-dot ${u.isOnline ? 'online' : ''}`}></div>
                </div>
                <div className="user-info">
                  <div className="user-name">{u.username}</div>
                  <div className="user-status-text">{u.isOnline ? 'Online' : 'Offline'}</div>
                </div>
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem', fontSize: '0.875rem' }}>
                No other users registered.
              </div>
            )}
          </>
        )}

        {activeTab === 'rooms' && (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Public Rooms</span>
              <button 
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Plus size={18} />
              </button>
            </div>

            {showCreateRoom && (
              <form onSubmit={handleCreateRoom} style={{ padding: '1rem', background: '#1e293b' }}>
                <input 
                  type="text" 
                  value={newRoomName} 
                  onChange={(e) => setNewRoomName(e.target.value)} 
                  placeholder="Room name..." 
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: 'none', marginBottom: '0.5rem' }} 
                  autoFocus 
                />
                <button type="submit" style={{ width: '100%', padding: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create</button>
              </form>
            )}

            {rooms.map((room) => {
              const isMember = room.members.includes(user._id);
              return (
                <div 
                  key={room._id} 
                  className={`user-item ${activeGroupRoom?._id === room._id ? 'active' : ''}`}
                  onClick={() => {
                    if (isMember) {
                      setActiveGroupRoom(room);
                    } else {
                      handleJoinRoom(room._id);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="user-avatar" style={{ background: '#3b82f6' }}>
                    <Hash size={20} />
                  </div>
                  <div className="user-info">
                    <div className="user-name">{room.name}</div>
                    <div className="user-status-text">
                      {isMember ? `${room.members.length} members` : 'Click to join'}
                    </div>
                  </div>
                </div>
              );
            })}
            {rooms.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem', fontSize: '0.875rem' }}>
                No rooms available.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
