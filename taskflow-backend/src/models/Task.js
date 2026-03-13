const mongoose = require('mongoose');
const { TASK_PRIORITIES, TASK_STATUSES } = require('../utils/constants');

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
        dueDate: {
            type: Date
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Task', taskSchema);
