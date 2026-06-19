const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { protect } = require('../middleware/authMiddleware');

// Get all projects for a user
router.get('/', protect, async (req, res) => {
  try {
    const projectsRef = db.collection('projects');
    const snapshot = await projectsRef.where('owner_id', '==', req.user.id).get();
    
    const projects = [];
    snapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get a single project
router.get('/:id', protect, async (req, res) => {
  try {
    const docRef = db.collection('projects').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const project = doc.data();

    // Check ownership
    if (project.owner_id !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: { id: doc.id, ...project } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a project
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, brief, status, startDate, endDate } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const newProject = {
      name,
      description: description || '',
      brief: brief || '',
      status: status || 'In Progress',
      startDate: startDate || null,
      endDate: endDate || null,
      owner_id: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('projects').add(newProject);

    res.status(201).json({ success: true, data: { id: docRef.id, ...newProject } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a project
router.put('/:id', protect, async (req, res) => {
  try {
    const docRef = db.collection('projects').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (doc.data().owner_id !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { name, description, brief, status, startDate, endDate } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (brief !== undefined) updates.brief = brief;
    if (status !== undefined) updates.status = status;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    updates.updatedAt = new Date().toISOString();

    await docRef.update(updates);
    
    const updatedDoc = await docRef.get();
    res.json({ success: true, data: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a project
router.delete('/:id', protect, async (req, res) => {
  try {
    const docRef = db.collection('projects').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (doc.data().owner_id !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Optional: Delete all tasks associated with this project
    const tasksRef = db.collection('tasks');
    // Using projectId now based on task schema
    const tasksSnapshot = await tasksRef.where('projectId', '==', req.params.id).get();
    
    const batch = db.batch();
    tasksSnapshot.forEach(taskDoc => {
      batch.delete(taskDoc.ref);
    });
    batch.delete(docRef);
    
    await batch.commit();

    res.json({ success: true, message: 'Project removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
