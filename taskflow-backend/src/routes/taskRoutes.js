const express = require('express');
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
    .get(getTasks)
    .post(createTask);

router.route('/:taskId')
    .put(updateTask)
    .delete(deleteTask);

module.exports = router;
