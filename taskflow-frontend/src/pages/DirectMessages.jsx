import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Send, Circle, Check, CheckCheck } from 'lucide-react';
import AppShell from '../components/AppShell';
import Loader from '../components/Loader';
import EmojiPicker from '../components/EmojiPicker';
import VoiceRecorder from '../components/VoiceRecorder';
import { useSocket } from '../context/SocketContext';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const DirectMessages = () => {
    const { userId: activeUserId } = useParams();
    const { user } = useAuth();
    const { socket } = useSocket();
    const [users, setUsers] = useState([]);
    const [threads, setThreads] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [readReceipts, setReadReceipts] = useState(new Set());
    const bottomRef = useRef(null);

    // Fetch users and threads
    useEffect(() => {
        const load = async () => {
            try {
                const [{ data: userList }, { data: threadList }] = await Promise.all([
                    api.get('/auth/users'),
                    api.get('/dm')
                ]);
                setUsers(userList.filter(u => u._id !== user?._id));
                setThreads(threadList);
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        load();
    }, [user]);

    // Fetch conversation when active user changes
    useEffect(() => {
        if (!activeUserId) { setMessages([]); return; }
        const load = async () => {
            try {
                const { data } = await api.get(`/dm/${activeUserId}`);
                setMessages(data.messages || []);
            } catch { setMessages([]); }
        };
        load();
    }, [activeUserId]);

    // Online tracking
    useEffect(() => {
        if (!socket) return;
        socket.emit('users:online');
        const onList = (list) => setOnlineUsers(new Set(list));
        const onOnline = ({ userId }) => setOnlineUsers(prev => new Set([...prev, userId]));
        const onOffline = ({ userId }) => setOnlineUsers(prev => { const n = new Set(prev); n.delete(userId); return n; });
        const onDm = ({ fromUserId, message }) => {
            if (String(fromUserId) === String(activeUserId)) {
                setMessages(prev => [...prev, message]);
                // Mark message as read
                socket.emit('dm:read', { messageId: message._id, userId: activeUserId });
            }
        };
        const onReadReceipt = ({ messageId, userId }) => {
            if (String(userId) === String(user?._id)) {
                setReadReceipts(prev => new Set([...prev, messageId]));
            }
        };

        socket.on('users:online:list', onList);
        socket.on('user:online', onOnline);
        socket.on('user:offline', onOffline);
        socket.on('dm:received', onDm);
        socket.on('dm:read:receipt', onReadReceipt);

        return () => {
            socket.off('users:online:list', onList);
            socket.off('user:online', onOnline);
            socket.off('user:offline', onOffline);
            socket.off('dm:received', onDm);
            socket.off('dm:read:receipt', onReadReceipt);
        };
    }, [socket, activeUserId, user]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark messages as read when conversation is opened
    useEffect(() => {
        if (activeUserId && messages.length > 0 && socket) {
            const unreadMessages = messages.filter(msg => 
                String(msg.sender?._id || msg.sender) !== String(user?._id) &&
                !readReceipts.has(msg._id)
            );
            
            unreadMessages.forEach(msg => {
                socket.emit('dm:read', { messageId: msg._id, userId: activeUserId });
            });
        }
    }, [activeUserId, messages, socket, user, readReceipts]);

    const markAsRead = (messageId) => {
        if (socket && activeUserId) {
            socket.emit('dm:read', { messageId, userId: activeUserId });
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeUserId) return;
        try {
            const { data } = await api.post(`/dm/${activeUserId}`, { text: input.trim() });
            setMessages(prev => [...prev, data]);
            setInput('');
        } catch (error) {
            console.error('[DM] Failed to send message:', error);
            toast.error(error.response?.data?.message || 'Message could not be sent');
        }
    };

    const sendVoiceNote = async (audioBlob) => {
        if (!activeUserId) return;
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-note.wav');
        
        try {
            const { data } = await api.post(`/dm/${activeUserId}/voice`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessages(prev => [...prev, data]);
        } catch (error) {
            console.error('[DM] Failed to send voice note:', error);
            toast.error(error.response?.data?.message || 'Voice note could not be sent');
        }
    };

    const addReaction = async (messageId, emoji) => {
        try {
            await api.post(`/dm/${activeUserId}/${messageId}/react`, { emoji });
            setMessages(prev => prev.map(msg => {
                if (msg._id === messageId) {
                    const reactions = msg.reactions || [];
                    const existingReaction = reactions.find(r => r.emoji === emoji);
                    
                    if (existingReaction) {
                        existingReaction.count = (existingReaction.count || 1) + 1;
                        if (!existingReaction.users.includes(user._id)) {
                            existingReaction.users.push(user._id);
                        }
                    } else {
                        reactions.push({
                            emoji,
                            count: 1,
                            users: [user._id]
                        });
                    }
                    
                    return { ...msg, reactions };
                }
                return msg;
            }));
        } catch { /* silent */ }
    };

    const hasUserReacted = (reaction, userId) => {
        return reaction.users && reaction.users.includes(userId);
    };

    const getReadReceiptIcon = (message) => {
        const isOwn = String(message.sender?._id || message.sender) === String(user?._id);
        if (!isOwn) return null;
        
        if (readReceipts.has(message._id)) {
            return <CheckCheck size={14} className="read-receipt read" />;
        }
        return <Check size={14} className="read-receipt sent" />;
    };

    const renderMessageContent = (msg) => {
        if (msg.audioURL) {
            return (
                <div className="voice-message">
                    <audio src={msg.audioURL} controls className="voice-message-player" />
                    <div className="dm-message-actions">
                        <EmojiPicker 
                            onEmojiSelect={(emoji) => addReaction(msg._id, emoji)}
                            position="top"
                        />
                    </div>
                </div>
            );
        }
        
        return (
            <div className="dm-message-content">
                {msg.text}
                <div className="dm-message-actions">
                    <EmojiPicker 
                        onEmojiSelect={(emoji) => addReaction(msg._id, emoji)}
                        position="top"
                    />
                </div>
            </div>
        );
    };

    const activeUser = users.find(u => u._id === activeUserId);
    const getDisplayName = (candidate) => candidate?.name || candidate?.email || 'User';

    const getInitials = (name = '') =>
        String(name).split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const formatTime = (iso) => {
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AppShell title="Conversation Place" subtitle="Private conversations with your team.">
            {loading ? <Loader label="Loading messages" /> : (
                <div className="dm-container">
                    <div className="dm-sidebar">
                        <h3>Conversations</h3>
                        <div className="dm-user-list">
                            {users.map(u => (
                                <Link
                                    key={u._id}
                                    to={`/dm/${u._id}`}
                                    className={`dm-user-item ${activeUserId === u._id ? 'dm-user-item--active' : ''}`}
                                >
                                    <div className="dm-avatar">
                                        {getInitials(getDisplayName(u))}
                                        <span className={`presence-dot ${onlineUsers.has(u._id) ? 'presence-dot--online' : ''}`} />
                                    </div>
                                    <div>
                                        <strong>{getDisplayName(u)}</strong>
                                        <span>{u.email}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="dm-chat">
                        {!activeUserId ? (
                            <div className="dm-empty">
                                <Circle size={40} opacity={0.2} />
                                <p>Select a user to start chatting</p>
                            </div>
                        ) : (
                            <>
                                <div className="dm-chat-header">
                                    <div className="dm-avatar">
                                        {getInitials(getDisplayName(activeUser))}
                                        <span className={`presence-dot ${onlineUsers.has(activeUserId) ? 'presence-dot--online' : ''}`} />
                                    </div>
                                    <div>
                                        <strong>{getDisplayName(activeUser)}</strong>
                                        <span>
                                            {activeUser?.email ? `${activeUser.email} · ` : ''}
                                            {onlineUsers.has(activeUserId) ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </div>

                                <div className="dm-messages">
                                    {messages.map((msg, i) => {
                                        const isOwn = String(msg.sender?._id || msg.sender) === String(user?._id);
                                        return (
                                            <div key={msg._id || i} className={`dm-msg ${isOwn ? 'dm-msg--own' : ''}`}>
                                                <div className={`dm-bubble ${isOwn ? 'dm-bubble--own' : ''}`}>
                                                    {renderMessageContent(msg)}
                                                    
                                                    {msg.reactions && msg.reactions.length > 0 && (
                                                        <div className="message-reactions">
                                                            {msg.reactions.map((reaction, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    className={`message-reaction ${hasUserReacted(reaction, user._id) ? 'message-reaction--reacted' : ''}`}
                                                                    onClick={() => addReaction(msg._id, reaction.emoji)}
                                                                >
                                                                    <span>{reaction.emoji}</span>
                                                                    <span className="reaction-count">{reaction.count}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="dm-message-footer">
                                                    <span className="dm-time">{formatTime(msg.timestamp)}</span>
                                                    {getReadReceiptIcon(msg)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={bottomRef} />
                                </div>

                                <form className="dm-input-row" onSubmit={sendMessage}>
                                    <input
                                        className="chat-input"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        placeholder="Type a message…"
                                        autoComplete="off"
                                    />
                                    <VoiceRecorder onSend={sendVoiceNote} disabled={!activeUserId} />
                                    <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
                                        <Send size={16} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </AppShell>
    );
};

export default DirectMessages;
