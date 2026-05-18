import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import api from '../api';

export default function ChatWindow({ conversationId }) {
  const socket  = useSocket();
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [typing, setTyping]       = useState(false);
  const typingTimer = useRef(null);
  const bottomRef   = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    api.get(`/conversations/${conversationId}/messages`)
       .then(r => setMessages(r.data));
    socket.emit('join:conversation', conversationId);

    socket.on('message:new', msg => {
      setMessages(prev => [...prev, msg]);
      socket.emit('message:read', { messageId: msg._id, conversationId });
    });
    socket.on('typing:start', () => setTyping(true));
    socket.on('typing:stop',  () => setTyping(false));

    return () => {
      socket.off('message:new');
      socket.off('typing:start');
      socket.off('typing:stop');
    };
  }, [conversationId, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit('typing:start', { conversationId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() =>
      socket.emit('typing:stop', { conversationId }), 1500);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('message:send', { conversationId, content: input, type: 'text' });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(m => <MessageBubble key={m._id} message={m} />)}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <input
          value={input}
          onChange={handleTyping}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 
                     text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none 
                     focus:ring-2 focus:ring-purple-400"
        />
        <button onClick={sendMessage}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-10 h-10 
                     flex items-center justify-center transition-colors">
          ➤
        </button>
      </div>
    </div>
  );
}