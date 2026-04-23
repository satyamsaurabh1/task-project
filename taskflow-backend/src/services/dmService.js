const DirectMessage = require('../models/DirectMessage');
const ApiError = require('../utils/apiError');

const getOrCreateThread = async (userId1, userId2) => {
    const participants = [userId1, userId2].sort();
    let thread = await DirectMessage.findOne({ participants: { $all: participants, $size: 2 } });
    if (!thread) {
        thread = await DirectMessage.create({ participants, messages: [] });
    }
    return thread;
};

const getThread = async (userId, otherUserId) => {
    const participants = [userId, otherUserId].sort();
    const thread = await DirectMessage.findOne({ participants: { $all: participants, $size: 2 } })
        .populate({ path: 'messages.sender', select: 'name email' });
    return thread || { participants, messages: [] };
};

const sendMessage = async (senderId, recipientId, text, attachments = []) => {
    if (!text?.trim() && attachments.length === 0) {
        throw new ApiError(400, 'Message cannot be empty');
    }

    const thread = await getOrCreateThread(senderId, recipientId);

    thread.messages.push({
        sender: senderId,
        text: text?.trim() || '',
        attachments,
        readBy: [senderId],
        timestamp: new Date()
    });
    thread.lastMessageAt = new Date();
    await thread.save();

    const lastMessage = thread.messages[thread.messages.length - 1];
    return lastMessage;
};

const markThreadRead = async (userId, otherUserId) => {
    const participants = [userId, otherUserId].sort();
    await DirectMessage.updateOne(
        { participants: { $all: participants, $size: 2 } },
        { $addToSet: { 'messages.$[].readBy': userId } }
    );
};

const getUserThreads = async (userId) => {
    return DirectMessage.find({ participants: userId })
        .populate('participants', 'name email')
        .sort({ lastMessageAt: -1 })
        .select('participants lastMessageAt messages')
        .lean()
        .then(threads => threads.map(t => ({
            ...t,
            lastMessage: t.messages[t.messages.length - 1] || null,
            unreadCount: t.messages.filter(m =>
                String(m.sender) !== String(userId) && !m.readBy?.map(String).includes(String(userId))
            ).length,
            messages: undefined
        })));
};

module.exports = { getOrCreateThread, getThread, sendMessage, markThreadRead, getUserThreads };
