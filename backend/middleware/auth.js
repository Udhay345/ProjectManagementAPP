const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Protect routes - JWT validation
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_12345');

      // Get user from database (excluding password)
      const [rows] = await pool.query(
        'SELECT id, name, email, role, status, avatar, department FROM users WHERE id = ?',
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      req.user = rows[0];
      next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Validate Project Ownership
const authorizeProjectOwner = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID is required' });
    }

    const [rows] = await pool.query('SELECT owner_id FROM projects WHERE id = ?', [projectId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access or modify this project' });
    }

    next();
  } catch (error) {
    console.error('Project ownership validation error:', error.message);
    return res.status(500).json({ success: false, message: 'Server validation error' });
  }
};

// Validate Task Ownership (Project Owner or Task Assignee)
const authorizeTaskOwnerOrAssignee = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    // Join task with its project to check project owner and assignee
    const [rows] = await pool.query(
      `SELECT t.assignee_id, p.owner_id 
       FROM tasks t 
       JOIN projects p ON t.project_id = p.id 
       WHERE t.id = ?`,
      [taskId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const isOwner = rows[0].owner_id === req.user.id;
    const isAssignee = rows[0].assignee_id === req.user.id;

    if (!isOwner && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Not authorized to access or modify this task' });
    }

    // Attach project owner status for downstream usage
    req.isProjectOwner = isOwner;
    next();
  } catch (error) {
    console.error('Task ownership validation error:', error.message);
    return res.status(500).json({ success: false, message: 'Server validation error' });
  }
};

module.exports = {
  protect,
  authorizeProjectOwner,
  authorizeTaskOwnerOrAssignee
};
