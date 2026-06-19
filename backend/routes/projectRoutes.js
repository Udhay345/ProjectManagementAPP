const express = require('express');
const router = express.Router();
const { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} = require('../controllers/projectController');
const { protect, authorizeProjectOwner } = require('../middleware/auth');

// All project routes require auth protect
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .put(authorizeProjectOwner, updateProject)
  .delete(authorizeProjectOwner, deleteProject);

module.exports = router;
