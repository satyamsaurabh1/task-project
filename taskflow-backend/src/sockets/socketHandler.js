const Message = require('../models/Message');
const notificationService = require('../services/notificationService');

// Thread-safe map for online users: userId (string) -> Set of socket IDs
const onlineUsers = new Map();

/**
 * Registers all real-time event handlers.
 * @param {import('socket.io').Server} io 
 */
const registerSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        const user = socket.data.user;
        if (!user) {
            socket.disconnect(true);
            return;
        }

        const userId = String(user.id);
        console.log(`[WS] Connection Established: ${user.name} [ID: ${userId}] [SID: ${socket.id}]`);

        // 1. Join Personal Room
        socket.join(`user:${userId}`);

        // 2. Track Online Status
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
            // Broadcast only when the FIRST socket for this user connects
            io.emit('user:online', { userId, name: user.name });
            console.log(`[WS] User ${user.name} is now globally ONLINE`);
        }
        onlineUsers.get(userId).add(socket.id);

        // 3. Join Global Projects Broadcaster
        socket.join('projects');

        // 4. Presence Request (Sync existing online users for the new client)
        socket.on('users:online:request', () => {
            const list = Array.from(onlineUsers.keys());
            socket.emit('users:online:list', list);
        });

        // 5. Project Room Management
        socket.on('project:join', (projectId) => {
            if (!projectId) return;
            const roomName = `project:${projectId}`;
            socket.join(roomName);
            
            // Sync current participants count
            const room = io.sockets.adapter.rooms.get(roomName);
            io.to(roomName).emit('project:presence', { 
                projectId, 
                count: room ? room.size : 0 
            });
        });

        socket.on('project:leave', (projectId) => {
            if (!projectId) return;
            socket.leave(`project:${projectId}`);
        });

        // 6. Real-time Messaging (Projects)
        socket.on('chat:send', async (payload) => {
            const { projectId, text, tempId } = payload;
            if (!projectId || !text?.trim()) return;

            try {
                const saved = await Message.create({
                    projectId,
                    sender: user._id,
                    text: text.trim()
                });

                const broadcastMsg = {
                    ...saved.toObject(),
                    sender: {
                        _id: user._id,
                        id: user.id,
                        name: user.name,
                        email: user.email
                    },
                    timestamp: saved.createdAt
                };

                // Emit to the project room (including sender for tempId resolution)
                io.to(`project:${projectId}`).emit('chat:message', {
                    message: broadcastMsg,
                    tempId
                });

                // Handle Mentions (Integration with notification service)
                const mentions = text.match(/@\[([^\]]+)\]\(([^)]+)\)/g);
                if (mentions) {
                    for (const mention of mentions) {
                        const mUserId = mention.match(/\(([^)]+)\)/)[1];
                        if (mUserId !== userId) {
                            const notif = await notificationService.createNotification({
                                userId: mUserId,
                                type: 'mention',
                                title: 'New Mention',
                                message: `${user.name} mentioned you in a project.`,
                                projectId,
                                fromUser: user._id,
                                link: `/projects/${projectId}`
                            });
                            io.to(`user:${mUserId}`).emit('notification:new', notif);
                        }
                    }
                }
            } catch (err) {
                console.error('[WS] Chat Error:', err);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // 7. Direct Messaging (DMs)
        socket.on('dm:send', async (payload) => {
            const { recipientId, text, tempId } = payload;
            if (!recipientId || !text?.trim()) return;

            try {
                const { sendMessage } = require('../services/dmService');
                const message = await sendMessage(userId, recipientId, text);
                
                const dmPayload = {
                    ...message.toObject(),
                    sender: { _id: user._id, id: user.id, name: user.name }
                };

                // Deliver to recipient AND sender (for multi-device sync)
                io.to(`user:${recipientId}`).to(`user:${userId}`).emit('dm:received', {
                    fromUserId: userId,
                    message: dmPayload,
                    tempId
                });
            } catch (err) {
                console.error('[WS] DM Error:', err);
            }
        });

        // 8. Typing Indicators
        socket.on('typing:start', ({ roomId, type }) => {
            // Generic typing handler for both project rooms and user rooms
            socket.to(roomId).emit('typing:status', {
                userId,
                name: user.name,
                typing: true,
                type // 'project' or 'dm'
            });
        });

        socket.on('typing:stop', ({ roomId }) => {
            socket.to(roomId).emit('typing:status', {
                userId,
                typing: false
            });
        });

        // 9. Disconnection Handler
        socket.on('disconnect', (reason) => {
            console.log(`[WS] Client Disconnecting: ${user.name} [Reason: ${reason}]`);
            
            const userSockets = onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);
                    // Broadcast offline status only if NO sockets remain for this user
                    io.emit('user:offline', { userId });
                    console.log(`[WS] User ${user.name} is now globally OFFLINE`);
                }
            }
        });
    });
};

const getOnlineUsersCount = () => onlineUsers.size;

module.exports = { registerSocketHandlers, getOnlineUsersCount };
