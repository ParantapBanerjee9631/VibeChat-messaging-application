import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Bot, Sparkles, AlertTriangle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';

const ChatBox = () => {
  const { user } = useAuthStore();
  const { messages, activeUser, activeGroupRoom, activeRoom, socket, isTyping, typingUser, askAI, summarizeChat, chatSummary, smartReplies, fetchSmartReplies, clearSmartReplies, isAIProcessing } = useChatStore();
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Fetch smart replies if the last message is from someone else in a DM
    if (messages.length > 0 && !activeGroupRoom) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender && lastMsg.sender._id !== user._id && lastMsg.sender._id !== 'ai') {
        fetchSmartReplies(lastMsg.text);
      } else {
        clearSmartReplies();
      }
    } else {
       clearSmartReplies();
    }
  }, [messages, isTyping, activeGroupRoom, user._id, fetchSmartReplies, clearSmartReplies]);

  useEffect(() => {
    if (!socket) return;
    
    const handleError = (data) => {
       setErrorMsg(data.message);
       setTimeout(() => setErrorMsg(null), 5000);
    };
    
    socket.on('message_error', handleError);
    return () => socket.off('message_error', handleError);
  }, [socket]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket || !activeRoom) return;

    socket.emit('send_message', {
      sender: user._id,
      roomId: activeRoom,
      text
    });
    
    setText('');
    clearSmartReplies();
    socket.emit('typing', { roomId: activeRoom, username: user.username, isTyping: false });
  };

  const handleAskAI = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeRoom) return;
    
    // Send user's message first so it appears in the chat and is saved
    socket.emit('send_message', {
      sender: user._id,
      roomId: activeRoom,
      text
    });

    askAI(text);
    setText('');
    clearSmartReplies();
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket || !activeRoom) return;
    
    socket.emit('typing', { 
      roomId: activeRoom, 
      username: user.username, 
      isTyping: e.target.value.length > 0 
    });
  };

  if (!activeRoom) {
    return (
      <div className="empty-chat">
        <MessageSquare size={48} />
        <h2>Welcome to VibeChat</h2>
        <p>Select a user or join a room to start messaging</p>
      </div>
    );
  }

  const chatTitle = activeGroupRoom ? activeGroupRoom.name : activeUser?.username;

  return (
    <div className="chat-container">
      <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: '600' }}>{chatTitle}</div>
        {activeGroupRoom && (
            <button 
              type="button"
              onClick={summarizeChat} 
              disabled={isAIProcessing}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b', border: '1px solid #334155', color: '#10b981', padding: '0.5rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              <Sparkles size={16} />
              {isAIProcessing ? 'Summarizing...' : 'Summarize Chat'}
            </button>
        )}
      </div>
      
      {chatSummary && (
          <div style={{ padding: '1rem', background: '#10b98120', borderBottom: '1px solid #10b981', color: '#e2e8f0', fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                 <Bot size={16} /> AI Summary
             </div>
             {chatSummary}
          </div>
      )}

      {errorMsg && (
          <div style={{ padding: '0.75rem', background: '#ef444420', borderBottom: '1px solid #ef4444', color: '#fca5a5', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <AlertTriangle size={16} /> {errorMsg}
          </div>
      )}
      
      <div className="messages-area">
        {messages.map((msg, index) => {
          const isAI = msg.sender && msg.sender._id === 'ai';
          const isMe = msg.sender && msg.sender._id === user._id;
          return (
            <div key={index} className={`message-bubble ${isMe ? 'message-sent' : 'message-received'}`} style={isAI ? { borderLeft: '3px solid #10b981' } : {}}>
              {isAI && <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '4px', color: '#10b981' }}>🤖 AI Assistant</div>}
              {!isAI && !isMe && activeGroupRoom && (
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '4px', color: '#3b82f6' }}>{msg.sender?.username}</div>
              )}
              <div className="message-content">{msg.text}</div>
              <div className="message-meta">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        {isTyping && typingUser && typingUser !== user.username && (
          <div className="typing-indicator">{typingUser} is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
        {smartReplies.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                {smartReplies.map((reply, i) => (
                    <button 
                        key={i} 
                        type="button" 
                        onClick={() => setText(reply)}
                        style={{ whiteSpace: 'nowrap', padding: '0.4rem 0.75rem', background: '#1e293b', border: '1px solid #10b981', color: '#10b981', borderRadius: '16px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                        {reply}
                    </button>
                ))}
            </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <input 
              type="text" 
              value={text}
              onChange={handleTyping}
              placeholder="Type a message..." 
            />
            <button type="submit" className="btn-send" disabled={!text.trim()} title="Send Message">
              <Send size={18} />
            </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
