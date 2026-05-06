import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageCircle, X, Send, Users } from 'lucide-react';
import useSocket from '../hooks/useSocket';
import { getProjectMessages } from '../services/projectService';

const TYPING_TIMEOUT = 2000;

const getInitials = (name = '') =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const getAvatarColor = (name = '') => {
    const colors = [
        '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b',
        '#ef4444', '#ec4899', '#3b82f6', '#14b8a6',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ProjectChat = ({ projectId, projectTitle, currentUser }) => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typingUsers, setTypingUsers] = useState({});
    const [unread, setUnread] = useState(0);
    const { socket } = useSocket();
    const bottomRef = useRef(null);
    const typingTimerRef = useRef({});
    const isTypingRef = useRef(false);

    // ── Fetch history ──────────────────────────────────────────
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getProjectMessages(projectId);
                setMessages(history);
            } catch (error) {
                console.error('[CHAT] Failed to fetch history:', error);
            }
        };

        if (open && projectId) {
            fetchHistory();
        }
    }, [projectId, open]);

    // ── Socket listeners ──────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const onMessage = (msg) => {
            // Only add if it's not already there (to avoid duplicates from optimistic updates)
            setMessages((prev) => {
                if (prev.find(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
            if (!open) setUnread((n) => n + 1);
        };

        const onTyping = ({ userId, name, typing }) => {
            if (userId === currentUser?._id) return;
            setTypingUsers((prev) => {
                const next = { ...prev };
                if (typing) {
                    next[userId] = name;
                } else {
                    delete next[userId];
                }
                return next;
            });
        };

        socket.on('chat:message', onMessage);
        socket.on('typing:status', onTyping);

        return () => {
            socket.off('chat:message', onMessage);
            socket.off('typing:status', onTyping);
        };
    }, [socket, open, currentUser, projectId]);

    // ── Auto-scroll ───────────────────────────────────────────────
    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open]);

    // ── Typing emission ───────────────────────────────────────────
    const emitTypingStop = useCallback(() => {
        if (!socket || !isTypingRef.current) return;
        isTypingRef.current = false;
        socket.emit('typing:stop', { projectId });
    }, [socket, projectId]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (!socket) return;

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            socket.emit('typing:start', { projectId });
        }

        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(emitTypingStop, TYPING_TIMEOUT);
    };

    // ── Send message ──────────────────────────────────────────────
    const sendMessage = (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || !socket) return;

        emitTypingStop();
        clearTimeout(typingTimerRef.current);

        const tempId = Date.now().toString();
        const optimisticMsg = {
            _id: tempId,
            projectId,
            text,
            sender: {
                _id: currentUser._id,
                id: currentUser._id,
                name: currentUser.name,
                email: currentUser.email
            },
            timestamp: new Date().toISOString()
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        socket.emit('chat:send', { projectId, text });
        setInput('');
    };

    const typingNames = Object.values(typingUsers);
    const toggleOpen = () => {
        setOpen((current) => {
            const next = !current;
            if (next) {
                setUnread(0);
            }
            return next;
        });
    };

    return (
        <>
            {/* Floating toggle button */}
            <button
                className="chat-fab"
                onClick={toggleOpen}
                aria-label="Toggle chat"
                id="chat-fab-btn"
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
                {!open && unread > 0 && (
                    <span className="chat-fab-badge">{unread > 9 ? '9+' : unread}</span>
                )}
            </button>

            {/* Chat drawer */}
            <div className={`chat-drawer ${open ? 'chat-drawer--open' : ''}`} role="dialog" aria-label="Team chat">
                {/* Header */}
                <div className="chat-header">
                    <div className="chat-header-info">
                        <MessageCircle size={16} />
                        <div>
                            <strong>Team Chat</strong>
                            <span className="chat-project-name">{projectTitle}</span>
                        </div>
                    </div>
                    <button className="icon-button" onClick={() => setOpen(false)} aria-label="Close chat">
                        <X size={16} />
                    </button>
                </div>

                {/* Messages */}
                <div className="chat-body" id="chat-message-list">
                    {messages.length === 0 && (
                        <div className="chat-empty">
                            <Users size={32} />
                            <p>No messages yet</p>
                            <span>Start the conversation with your team!</span>
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isOwn = (msg.sender?._id || msg.sender?.id) === currentUser?._id;
                        const color = getAvatarColor(msg.sender?.name || 'User');
                        return (
                            <div key={msg._id || msg.id} className={`chat-msg ${isOwn ? 'chat-msg--own' : ''}`}>
                                {!isOwn && (
                                    <div
                                        className="chat-avatar"
                                        style={{ background: color }}
                                        title={msg.sender?.name}
                                    >
                                        {getInitials(msg.sender?.name)}
                                    </div>
                                )}
                                <div className="chat-bubble-wrap">
                                    {!isOwn && (
                                        <span className="chat-sender">{msg.sender?.name}</span>
                                    )}
                                    <div className={`chat-bubble ${isOwn ? 'chat-bubble--own' : ''}`}>
                                        {msg.text}
                                    </div>
                                    <span className="chat-time">{formatTime(msg.timestamp)}</span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Typing indicator */}
                    {typingNames.length > 0 && (
                        <div className="chat-msg">
                            <div className="chat-typing-indicator">
                                <div className="typing-dots">
                                    <span /><span /><span />
                                </div>
                                <span className="chat-typing-text">
                                    {typingNames.join(', ')} {typingNames.length === 1 ? 'is' : 'are'} typing…
                                </span>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form className="chat-input-row" onSubmit={sendMessage}>
                    <input
                        id="chat-message-input"
                        className="chat-input"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message…"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="chat-send-btn"
                        disabled={!input.trim()}
                        aria-label="Send message"
                        id="chat-send-btn"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </>
    );
};

export default ProjectChat;
