const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get projects owned by the user
    const projectsSnapshot = await db.collection('projects').where('owner_id', '==', userId).get();
    const totalProjects = projectsSnapshot.size;
    let inProgressProjects = 0;
    
    projectsSnapshot.forEach(doc => {
      const data = doc.data();
      // Match frontend status strings
      if (['In Progress', 'On Track', 'At Risk', 'active'].includes(data.status)) {
        inProgressProjects++;
      }
    });

    // Get tasks owned by the user
    const tasksSnapshot = await db.collection('tasks').where('owner_id', '==', userId).get();
    const totalTasks = tasksSnapshot.size;
    let completedTasks = 0;

    tasksSnapshot.forEach(doc => {
      const status = doc.data().status;
      if (status === 'done' || status === 'Done') {
        completedTasks++;
      }
    });

    const pendingTasks = totalTasks - completedTasks;

    res.status(200).json({
      success: true,
      data: {
        totalProjects,
        inProgressProjects,
        totalTasks,
        completedTasks,
        pendingTasks
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
