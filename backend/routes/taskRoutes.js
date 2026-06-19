const express = require('express');
const router = express.Router();
const { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');
const { protect, authorizeTaskOwnerOrAssignee } = require('../middleware/auth');

// All task routes require auth protect
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(authorizeTaskOwnerOrAssignee, updateTask)
  .delete(authorizeTaskOwnerOrAssignee, deleteTask);

module.exports = router;
