const mongoose = require('mongoose');

const dmMessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, trim: true },
    attachments: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now }
    }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    timestamp: { type: Date, default: Date.now }
}, { _id: true });

const directMessageSchema = new mongoose.Schema(
    {
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
        messages: [dmMessageSchema],
        lastMessageAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

directMessageSchema.index({ participants: 1 });
directMessageSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('DirectMessage', directMessageSchema);
