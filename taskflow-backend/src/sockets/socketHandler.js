const Message = require('../models/Message');
const notificationService = require('../services/notificationService');
const Project = require('../models/Project');

// Track online users: userId -> Set of socket IDs
const onlineUsers = new Map();

const registerSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        const user = socket.data.user;
        if (!user) return;
        const userId = String(user._id || user.id);

        console.log(`[WS] Connected: ${user?.name || userId} (${socket.id})`);

        // ── Personal room (for DMs and notifications) ──
        socket.join(`user:${userId}`);

        // ── Track online status ──
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);
        io.emit('user:online', { userId, name: user.name });

        // Always join the global projects room
        socket.join('projects');

        // ── Project rooms ──────────────────────────────
        socket.on('join:project', (projectId) => {
            if (!projectId) return;
            socket.join(`project:${projectId}`);
            console.log(`[WS] ${user?.name} joined project room: ${projectId}`);

            const room = io.sockets.adapter.rooms.get(`project:${projectId}`);
            io.to(`project:${projectId}`).emit('room:users', { count: room?.size || 1 });
        });

        socket.on('leave:project', (projectId) => {
            if (!projectId) return;
            socket.leave(`project:${projectId}`);
            const room = io.sockets.adapter.rooms.get(`project:${projectId}`);
            io.to(`project:${projectId}`).emit('room:users', { count: room?.size || 0 });
        });

        // ── Chat ──────────────────────────────────────
        socket.on('chat:send', async (messageData) => {
            const { projectId, text } = messageData;
            if (!projectId || !text?.trim()) return;

            try {
                const savedMessage = await Message.create({
                    projectId,
                    sender: user._id,
                    text: text.trim()
                });

                const populatedMessage = {
                    _id: savedMessage._id,
                    projectId,
                    text: savedMessage.text,
                    sender: {
                        _id: user._id,
                        id: user._id,
                        name: user.name,
                        email: user.email
                    },
                    timestamp: savedMessage.createdAt
                };

                socket.to(`project:${projectId}`).emit('chat:message', populatedMessage);

                // Handle @mentions
                const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
                let match;
                while ((match = mentionRegex.exec(text)) !== null) {
                    const mentionedUserId = match[2];
                            if (mentionedUserId !== userId) {
                        await notificationService.createNotification({
                            userId: mentionedUserId,
                            type: 'mention',
                            title: `${user.name} mentioned you`,
                            message: text.slice(0, 100),
                            projectId,
                            fromUser: userId,
                            link: `/projects/${projectId}`
                        });
                        io.to(`user:${mentionedUserId}`).emit('notification:new', {
                            type: 'mention',
                            title: `${user.name} mentioned you`,
                            message: text.slice(0, 100)
                        });
                    }
                }

                console.log(`[CHAT] Message saved for project ${projectId}`);
            } catch (error) {
                console.error('[CHAT] Failed to save message:', error);
            }
        });

        // ── Typing indicators ──────────────────────────
        socket.on('typing:start', ({ projectId }) => {
            if (!projectId) return;
            socket.to(`project:${projectId}`).emit('typing:status', {
                userId,
                name: user?.name,
                typing: true,
            });
        });

        socket.on('typing:stop', ({ projectId }) => {
            if (!projectId) return;
            socket.to(`project:${projectId}`).emit('typing:status', {
                userId,
                name: user?.name,
                typing: false,
            });
        });

        // ── Direct Messages ────────────────────────────
        socket.on('dm:send', async ({ recipientId, text }) => {
            if (!recipientId || !text?.trim()) return;
            try {
                const { sendMessage } = require('../services/dmService');
                const message = await sendMessage(userId, recipientId, text);
                const payload = {
                    ...message,
                    sender: { _id: userId, name: user.name, email: user.email }
                };
                io.to(`user:${recipientId}`).emit('dm:received', { fromUserId: userId, message: payload });
            } catch (error) {
                console.error('[DM] Failed:', error);
            }
        });

        // ── Get online users list ──────────────────────
        socket.on('users:online', () => {
            const onlineList = Array.from(onlineUsers.keys());
            socket.emit('users:online:list', onlineList);
        });

        // ── Disconnect ────────────────────────────────
        socket.on('disconnect', () => {
            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                    io.emit('user:offline', { userId });
                }
            }
            console.log(`[WS] Disconnected: ${socket.id}`);
        });
    });
};

const getOnlineUsers = () => Array.from(onlineUsers.keys());

module.exports = { registerSocketHandlers, getOnlineUsers };
