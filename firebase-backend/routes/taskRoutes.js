const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { protect } = require('../middleware/authMiddleware');

// Get all tasks for the user
router.get('/', protect, async (req, res) => {
  try {
    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef.where('owner_id', '==', req.user.id).get();
    
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all tasks for a project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    // Check if user owns the project
    const projectDoc = await db.collection('projects').doc(req.params.projectId).get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    if (projectDoc.data().owner_id !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef.where('projectId', '==', req.params.projectId).get();
    
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a task
router.post('/', protect, async (req, res) => {
  try {
    const { projectId, title, description, status, priority, dueDate, labels, subtasks } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Title and projectId are required' });
    }

    // Check project ownership
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists || projectDoc.data().owner_id !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to add task to this project' });
    }

    const newTask = {
      projectId,
      title,
      description: description || '',
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      labels: labels || [],
      subtasks: subtasks || [],
      comments: [],
      owner_id: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('tasks').add(newTask);

    res.status(201).json({ success: true, data: { id: docRef.id, ...newTask } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a task
router.put('/:id', protect, async (req, res) => {
  try {
    const docRef = db.collection('tasks').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (doc.data().owner_id !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, status, priority, dueDate, labels, subtasks, comments } = req.body;
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (labels !== undefined) updates.labels = labels;
    if (subtasks !== undefined) updates.subtasks = subtasks;
    if (comments !== undefined) updates.comments = comments;
    updates.updatedAt = new Date().toISOString();

    await docRef.update(updates);
    
    const updatedDoc = await docRef.get();
    res.json({ success: true, data: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', protect, async (req, res) => {
  try {
    const docRef = db.collection('tasks').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (doc.data().owner_id !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await docRef.delete();

    res.json({ success: true, message: 'Task removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
