import { useEffect, useRef, useState } from 'react';
import { Send, Smile } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { timeAgo } from '../utils/formatters';
import * as projectService from '../services/projectService';

const ChatSection = ({ projectId, projectTitle, currentUser }) => {
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUser, setTypingUser] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Load Chat History
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await projectService.getProjectMessages(projectId);
                setMessages(history);
                scrollToBottom();
            } catch (error) {
                console.error('Failed to load chat history:', error);
                toast.error('Could not load message history');
            } finally {
                setLoadingHistory(false);
            }
        };
        loadHistory();
    }, [projectId]);

    useEffect(() => {
        if (!socket) return;

        const onMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
            scrollToBottom();
        };

        const onTyping = ({ user: typist, isTyping }) => {
            if (String(typist?._id || typist?.id) === String(currentUser?._id || currentUser?.id)) return;
            setTypingUser(isTyping ? typist.name : null);
        };

        socket.on('chat:message', onMessage);
        socket.on('typing:status', onTyping);

        return () => {
            socket.off('chat:message', onMessage);
            socket.off('typing:status', onTyping);
        };
    }, [socket, currentUser]);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            projectId,
            text: newMessage.trim(),
            sender: {
                _id: currentUser._id || currentUser.id,
                name: currentUser.name,
                email: currentUser.email
            },
            timestamp: new Date().toISOString()
        };

        socket.emit('chat:send', messageData);
        setMessages((prev) => [...prev, messageData]);
        setNewMessage('');
        scrollToBottom();
        
        // Stop typing indicator immediately
        socket.emit('typing:stop', { projectId });
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        if (!socket) return;

        socket.emit('typing:start', { projectId });
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing:stop', { projectId });
        }, 3000);
    };

    return (
        <div className="chat-section-container">
            <div className="chat-section-header">
                <h2>Project Discussion</h2>
                <p>Real-time collaboration for <strong>{projectTitle || 'this project'}</strong></p>
            </div>

            <div className="chat-feed">
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = String(msg.sender?._id || msg.sender?.id) === String(currentUser?._id || currentUser?.id);
                        return (
                            <div key={idx} className={`chat-bubble-wrap ${isMe ? 'chat-me' : 'chat-them'}`}>
                                {!isMe && <div className="chat-avatar">{msg.sender?.name[0].toUpperCase()}</div>}
                                <div className="chat-bubble-content">
                                    <div className="chat-bubble-info">
                                        <strong>{isMe ? 'You' : msg.sender?.name}</strong>
                                        <span>{timeAgo(msg.timestamp)}</span>
                                    </div>
                                    <div className="chat-bubble-text">{msg.text}</div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {typingUser && (
                <div className="chat-typing-indicator">
                    <span className="typing-dots"><span>.</span><span>.</span><span>.</span></span>
                    {typingUser} is typing
                </div>
            )}

            <form className="chat-input-area" onSubmit={handleSend}>
                <button type="button" className="icon-button"><Smile size={20} /></button>
                <input 
                    className="chat-text-input" 
                    placeholder="Message the team..." 
                    value={newMessage}
                    onChange={handleInputChange}
                />
                <button type="submit" className="chat-send-full-btn" disabled={!newMessage.trim()}>
                    <Send size={18} />
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatSection;
