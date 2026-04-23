const mongoose = require('mongoose');
const { TASK_PRIORITIES, TASK_STATUSES } = require('../utils/constants');

const attachmentSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
}, { _id: true });

const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    action: { type: String, required: true },
    field: { type: String },
    oldValue: { type: String },
    newValue: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { _id: true });

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Task description is required'],
            trim: true
        },
        status: {
            type: String,
            enum: TASK_STATUSES,
            default: 'pending'
        },
        priority: {
            type: String,
            enum: TASK_PRIORITIES,
            default: 'medium'
        },
        dueDate: { type: Date },
        deadline: { type: Date, index: true },
        reminderSent: { type: Boolean, default: false },
        overdueSent: { type: Boolean, default: false },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        attachments: [attachmentSchema],
        reactions: {
            type: Map,
            of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            default: {}
        },
        mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        activityLog: [activityLogSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Task', taskSchema);
