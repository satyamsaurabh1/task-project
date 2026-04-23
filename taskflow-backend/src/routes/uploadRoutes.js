const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const ApiError = require('../utils/apiError');
const { validateProjectAccess } = require('../utils/accessControl');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${unique}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/zip',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, `File type ${file.mimetype} is not allowed`), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

const router = express.Router({ mergeParams: true });
router.use(protect);

// Upload attachment to a task
router.post('/:projectId/tasks/:taskId/attachments',
    upload.single('file'),
    asyncHandler(async (req, res) => {
        if (!req.file) throw new ApiError(400, 'No file uploaded');

        await validateProjectAccess(req.params.projectId, req.user);

        const task = await Task.findOne({ _id: req.params.taskId, projectId: req.params.projectId });
        if (!task) throw new ApiError(404, 'Task not found');

        const attachment = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user._id,
            uploadedAt: new Date()
        };

        task.attachments.push(attachment);
        task.activityLog.push({
            user: req.user._id,
            userName: req.user.name,
            action: 'uploaded file',
            newValue: req.file.originalname,
            timestamp: new Date()
        });
        await task.save();

        res.status(201).json({ attachment, message: 'File uploaded successfully' });
    })
);

// Download/serve a file
router.get('/files/:filename', (req, res) => {
    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }
    res.sendFile(filePath);
});

// Delete attachment
router.delete('/:projectId/tasks/:taskId/attachments/:attachmentId',
    asyncHandler(async (req, res) => {
        await validateProjectAccess(req.params.projectId, req.user);
        const task = await Task.findOne({ _id: req.params.taskId, projectId: req.params.projectId });
        if (!task) throw new ApiError(404, 'Task not found');

        const att = task.attachments.id(req.params.attachmentId);
        if (!att) throw new ApiError(404, 'Attachment not found');

        // Delete from disk
        const filePath = path.join(UPLOAD_DIR, att.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        att.deleteOne();
        await task.save();
        res.json({ message: 'Attachment deleted' });
    })
);

module.exports = router;
