import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Send, Circle, Check, CheckCheck, Phone, Video, MoreVertical, Search, Smile, Paperclip } from 'lucide-react';
import AppShell from '../components/AppShell';
import Loader from '../components/Loader';
import EmojiPicker from '../components/EmojiPicker';
import VoiceRecorder from '../components/VoiceRecorder';
import { useSocket } from '../context/SocketContext';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import './DirectMessages.css';

const DirectMessages = () => {
    const { userId: activeUserId } = useParams();
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [readReceipts, setReadReceipts] = useState(new Set());
    const [unreadCounts, setUnreadCounts] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    
    const bottomRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Initial load
    useEffect(() => {
        const load = async () => {
            try {
                const { data: userList } = await api.get('/auth/users');
                setUsers(userList.filter(u => u._id !== user?._id));
                
                const { data: threads } = await api.get('/dm');
                const counts = {};
                threads.forEach(t => {
                    const other = t.participants.find(p => p._id !== user?._id);
                    if (other) counts[other._id] = t.unreadCount || 0;
                });
                setUnreadCounts(counts);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, [user]);

    // Fetch conversation
    useEffect(() => {
        if (!activeUserId) { setMessages([]); return; }
        const load = async () => {
            try {
                const { data } = await api.get(`/dm/${activeUserId}`);
                setMessages(data.messages || []);
                setUnreadCounts(prev => ({ ...prev, [activeUserId]: 0 }));
                
                const readSet = new Set();
                data.messages.forEach(m => {
                    if (m.readBy?.length > 1) readSet.add(m._id);
                });
                setReadReceipts(readSet);
            } catch { setMessages([]); }
        };
        load();
    }, [activeUserId, user?._id]);

    // Socket Handlers
    useEffect(() => {
        if (!socket) return;
        
        const onOnlineList = (list) => {
            setOnlineUsers(new Set(list.map(String)));
        };

        const onUserOnline = ({ userId: id }) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                next.add(String(id));
                return next;
            });
        };

        const onUserOffline = ({ userId: id }) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(String(id));
                return next;
            });
        };
        
        const onDmReceived = ({ fromUserId, message, tempId }) => {
            const isRelevant = String(fromUserId) === String(activeUserId) || 
                               String(message.sender?._id || message.sender) === String(user?._id);
            
            if (isRelevant) {
                setMessages(prev => {
                    const existingIdx = prev.findIndex(m => 
                        (m._id === message._id) || (tempId && m.tempId === tempId)
                    );
                    
                    if (existingIdx > -1) {
                        const next = [...prev];
                        next[existingIdx] = message;
                        return next;
                    }
                    return [...prev, message];
                });

                if (String(fromUserId) === String(activeUserId)) {
                    socket.emit('dm:read', { messageId: message._id, userId: activeUserId });
                }
            } else {
                setUnreadCounts(prev => ({
                    ...prev,
                    [fromUserId]: (prev[fromUserId] || 0) + 1
                }));
            }
        };

        const onReadReceipt = ({ messageId, userId: readerId }) => {
            if (String(readerId) === String(activeUserId)) {
                setReadReceipts(prev => new Set([...prev, messageId]));
            }
        };

        const onTypingStatus = ({ userId: tId, typing, type }) => {
            if (type === 'dm' && String(tId) === String(activeUserId)) {
                setTypingUser(typing ? tId : null);
            }
        };

        socket.on('users:online:list', onOnlineList);
        socket.on('user:online', onUserOnline);
        socket.on('user:offline', onUserOffline);
        socket.on('dm:received', onDmReceived);
        socket.on('dm:read:receipt', onReadReceipt);
        socket.on('typing:status', onTypingStatus);

        // Sync presence on mount or reconnection
        socket.emit('users:online:request');

        return () => {
            socket.off('users:online:list', onOnlineList);
            socket.off('user:online', onUserOnline);
            socket.off('user:offline', onUserOffline);
            socket.off('dm:received', onDmReceived);
            socket.off('dm:read:receipt', onReadReceipt);
            socket.off('typing:status', onTypingStatus);
        };
    }, [socket, activeUserId, user?._id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typingUser]);

    // Handle Typing
    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (!socket || !activeUserId) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing:start', { roomId: `user:${activeUserId}`, type: 'dm' });
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit('typing:stop', { roomId: `user:${activeUserId}` });
        }, 2000);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || !activeUserId || !socket) return;

        const tempId = Date.now().toString();
        socket.emit('dm:send', { recipientId: activeUserId, text, tempId });
        
        // Optimistic UI update
        const optimisticMsg = {
            _id: tempId,
            sender: { _id: user?._id, name: user?.name },
            text,
            timestamp: new Date().toISOString(),
            isOptimistic: true,
            tempId
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setInput('');
    };

    const sendVoiceNote = async (audioBlob) => {
        if (!activeUserId) return;
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-note.wav');
        try {
            const { data } = await api.post(`/dm/${activeUserId}/voice`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessages(prev => [...prev, data]);
        } catch (err) { toast.error('Failed to send voice note'); }
    };

    const formatTime = (iso) => {
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const activeUser = users.find(u => u._id === activeUserId);
    const getDisplayName = (u) => u?.name || u?.email?.split('@')[0] || 'User';
    const getInitials = (n = '') => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <AppShell title="Messages" hideHeader>
            <div className="wa-container">
                <div className="wa-sidebar">
                    <div className="wa-side-header">
                        <div className="wa-my-avatar">{getInitials(user?.name)}</div>
                        <div className="wa-side-actions">
                            <Circle size={20} className={isConnected ? 'text-green-500' : 'text-red-500'} />
                            <MoreVertical size={20} />
                        </div>
                    </div>
                    
                    <div className="wa-search">
                        <div className="wa-search-inner">
                            <Search size={16} />
                            <input placeholder="Search or start new chat" />
                        </div>
                    </div>

                    <div className="wa-user-list">
                        {users.map(u => (
                            <Link key={u._id} to={`/dm/${u._id}`} className={`wa-user-item ${activeUserId === u._id ? 'active' : ''}`}>
                                <div className="wa-avatar">
                                    {getInitials(getDisplayName(u))}
                                    {onlineUsers.has(String(u._id)) && <span className="wa-online-dot" />}
                                </div>
                                <div className="wa-user-info">
                                    <div className="wa-user-top">
                                        <span className="wa-user-name">{getDisplayName(u)}</span>
                                        <span className="wa-user-time">12:45 PM</span>
                                    </div>
                                    <div className="wa-user-bottom">
                                        <span className="wa-last-msg">{u.email}</span>
                                        {unreadCounts[u._id] > 0 && <span className="wa-unread-badge">{unreadCounts[u._id]}</span>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="wa-chat">
                    {!activeUserId ? (
                        <div className="wa-empty">
                            <div className="wa-empty-icon">📱</div>
                            <h1>TaskFlow for Desktop</h1>
                            <p>Send and receive messages with real-time synchronization.</p>
                        </div>
                    ) : (
                        <>
                            <div className="wa-chat-header">
                                <div className="wa-avatar small">
                                    {getInitials(getDisplayName(activeUser))}
                                </div>
                                <div className="wa-header-info">
                                    <span className="wa-header-name">{getDisplayName(activeUser)}</span>
                                    <span className="wa-header-status">
                                        {typingUser ? 'typing...' : (onlineUsers.has(String(activeUserId)) ? 'online' : 'offline')}
                                    </span>
                                </div>
                                <div className="wa-header-actions">
                                    <Video size={20} />
                                    <Phone size={20} />
                                    <div className="wa-sep" />
                                    <Search size={20} />
                                    <MoreVertical size={20} />
                                </div>
                            </div>

                            <div className="wa-messages-bg">
                                <div className="wa-messages">
                                    {messages.map((msg, i) => {
                                        const isOwn = String(msg.sender?._id || msg.sender) === String(user?._id);
                                        const isRead = readReceipts.has(msg._id);
                                        return (
                                            <div key={msg._id || i} className={`wa-msg-row ${isOwn ? 'own' : ''}`}>
                                                <div className={`wa-bubble ${isOwn ? 'own' : ''}`}>
                                                    <div className="wa-bubble-content">
                                                        {msg.audioURL ? (
                                                            <audio src={msg.audioURL} controls className="wa-audio" />
                                                        ) : (
                                                            <span>{msg.text}</span>
                                                        )}
                                                        <div className="wa-bubble-meta">
                                                            <span className="wa-time">{formatTime(msg.timestamp)}</span>
                                                            {isOwn && (
                                                                <span className={`wa-ticks ${isRead ? 'read' : ''}`}>
                                                                    {isRead ? <CheckCheck size={15} /> : <Check size={15} />}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {typingUser && (
                                        <div className="wa-msg-row">
                                            <div className="wa-bubble typing">
                                                <div className="typing-dots">
                                                    <span /> <span /> <span />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={bottomRef} />
                                </div>
                            </div>

                            <div className="wa-input-footer">
                                <div className="wa-footer-actions">
                                    <Smile size={24} />
                                    <Paperclip size={24} />
                                </div>
                                <form className="wa-input-form" onSubmit={sendMessage}>
                                    <input
                                        className="wa-main-input"
                                        placeholder="Type a message"
                                        value={input}
                                        onChange={handleInputChange}
                                        autoComplete="off"
                                    />
                                    <button type="submit" className="wa-send-btn" disabled={!input.trim()}>
                                        <Send size={20} fill={input.trim() ? "#00a884" : "none"} stroke={input.trim() ? "#00a884" : "currentColor"} />
                                    </button>
                                </form>
                                <VoiceRecorder onSend={sendVoiceNote} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppShell>
    );
};

export default DirectMessages;
