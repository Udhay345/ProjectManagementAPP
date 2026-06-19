const pool = require('../config/db');

// @desc    Get dashboard metrics and statistics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Total projects the user is involved in (owner or member)
    const [totalProjectsRows] = await pool.query(
      `SELECT COUNT(DISTINCT p.id) as count FROM projects p 
       LEFT JOIN project_members pm ON p.id = pm.project_id 
       WHERE p.owner_id = ? OR pm.user_id = ?`,
      [userId, userId]
    );
    const totalProjects = totalProjectsRows[0].count;

    // 2. Projects in progress
    const [inProgressProjectsRows] = await pool.query(
      `SELECT COUNT(DISTINCT p.id) as count FROM projects p 
       LEFT JOIN project_members pm ON p.id = pm.project_id 
       WHERE (p.owner_id = ? OR pm.user_id = ?) 
       AND p.status IN ('In Progress', 'On Track', 'At Risk')`,
      [userId, userId]
    );
    const inProgressProjects = inProgressProjectsRows[0].count;

    // 3. Fetch all tasks under projects user is involved in, or assigned to the user
    const [tasksRows] = await pool.query(
      `SELECT t.status FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN project_members pm ON p.id = pm.project_id
       WHERE p.owner_id = ? OR pm.user_id = ? OR t.assignee_id = ?
       GROUP BY t.id`,
      [userId, userId, userId]
    );

    const totalTasks = tasksRows.length;
    const completedTasks = tasksRows.filter(t => t.status === 'Done').length;
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
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
