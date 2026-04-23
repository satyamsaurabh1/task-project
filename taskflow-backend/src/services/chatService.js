const Message = require('../models/Message');

const saveMessage = async (projectId, senderId, text) => {
    const message = await Message.create({
        projectId,
        sender: senderId,
        text
    });

    return Message.findById(message._id).populate('sender', 'name email');
};

const getProjectMessages = async (projectId) => {
    return Message.find({ projectId })
        .populate('sender', 'name email')
        .sort({ createdAt: 1 })
        .limit(100);
};

module.exports = {
    saveMessage,
    getProjectMessages
};
