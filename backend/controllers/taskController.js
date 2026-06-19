const pool = require('../config/db');

// Helper to recalculate project progress based on tasks status
const updateProjectProgress = async (projectId) => {
  try {
    const [tasks] = await pool.query('SELECT status FROM tasks WHERE project_id = ?', [projectId]);
    if (tasks.length === 0) {
      await pool.query('UPDATE projects SET progress = 0 WHERE id = ?', [projectId]);
      return 0;
    }
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const progress = Math.round((completedTasks / tasks.length) * 100);
    await pool.query('UPDATE projects SET progress = ? WHERE id = ?', [progress, projectId]);
    return progress;
  } catch (error) {
    console.error('Error updating project progress:', error.message);
  }
};

// Helper to format a single task object
const formatTask = (task) => {
  let parsedLabels = [];
  let parsedSubtasks = [];
  let parsedComments = [];

  try {
    parsedLabels = typeof task.labels === 'string' ? JSON.parse(task.labels) : (task.labels || []);
  } catch (e) { parsedLabels = []; }

  try {
    parsedSubtasks = typeof task.subtasks === 'string' ? JSON.parse(task.subtasks) : (task.subtasks || []);
  } catch (e) { parsedSubtasks = []; }

  try {
    parsedComments = typeof task.comments === 'string' ? JSON.parse(task.comments) : (task.comments || []);
  } catch (e) { parsedComments = []; }

  return {
    id: String(task.id),
    projectId: String(task.project_id),
    projectName: task.project_name || '',
    title: task.title,
    description: task.description || '',
    status: task.status || 'To Do',
    priority: task.priority || 'Medium',
    dueDate: task.due_date || '',
    labels: parsedLabels,
    subtasks: parsedSubtasks,
    comments: parsedComments,
    assignee: task.assignee_id ? {
      id: String(task.assignee_id),
      name: task.assignee_name,
      email: task.assignee_email,
      role: task.assignee_role || 'Developer',
      status: task.assignee_status || 'Active',
      avatar: task.assignee_avatar || '',
      department: task.assignee_department || 'ENGINEERING'
    } : null
  };
};

// @desc    Get all tasks for the logged in user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    // Get tasks that are in projects the user owns or is a member of
    const [tasks] = await pool.query(
      `SELECT t.*, p.name as project_name,
              u.name as assignee_name, u.email as assignee_email, 
              u.role as assignee_role, u.status as assignee_status, 
              u.avatar as assignee_avatar, u.department as assignee_department 
       FROM tasks t 
       JOIN projects p ON t.project_id = p.id 
       LEFT JOIN project_members pm ON p.id = pm.project_id 
       LEFT JOIN users u ON t.assignee_id = u.id 
       WHERE p.owner_id = ? OR pm.user_id = ? OR t.assignee_id = ?
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [req.user.id, req.user.id, req.user.id]
    );

    res.status(200).json({
      success: true,
      data: tasks.map(formatTask)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const [tasks] = await pool.query(
      `SELECT t.*, p.name as project_name,
              u.name as assignee_name, u.email as assignee_email, 
              u.role as assignee_role, u.status as assignee_status, 
              u.avatar as assignee_avatar, u.department as assignee_department 
       FROM tasks t 
       JOIN projects p ON t.project_id = p.id 
       LEFT JOIN users u ON t.assignee_id = u.id 
       WHERE t.id = ?`,
      [taskId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = tasks[0];

    // Check authorization (user is owner of the task's project, or is project member, or is assignee)
    const [memberships] = await pool.query(
      'SELECT 1 FROM project_members pm JOIN projects p ON pm.project_id = p.id WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)',
      [task.project_id, req.user.id, req.user.id]
    );

    if (task.assignee_id !== req.user.id && memberships.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this task' });
    }

    res.status(200).json({
      success: true,
      data: formatTask(task)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { projectId, title, description, status, priority, dueDate, assigneeId, labels, subtasks } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ success: false, message: 'Project ID and title are required' });
    }

    // Verify user is member of project to create tasks in it
    const [projectRows] = await pool.query('SELECT owner_id FROM projects WHERE id = ?', [projectId]);
    if (projectRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const [memberships] = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (projectRows[0].owner_id !== req.user.id && memberships.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to add tasks to this project' });
    }

    const taskStatus = status || 'To Do';
    const taskPriority = priority || 'Medium';
    const taskDueDate = dueDate || null;
    const taskAssigneeId = assigneeId || null;
    
    // Store array/objects as JSON strings
    const taskLabels = labels ? JSON.stringify(labels) : JSON.stringify([]);
    const taskSubtasks = subtasks ? JSON.stringify(subtasks) : JSON.stringify([]);
    const taskComments = JSON.stringify([]); // New tasks start with 0 comments

    const [result] = await pool.query(
      `INSERT INTO tasks (project_id, title, description, status, priority, due_date, assignee_id, labels, subtasks, comments) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, title, description || null, taskStatus, taskPriority, taskDueDate, taskAssigneeId, taskLabels, taskSubtasks, taskComments]
    );

    const taskId = result.insertId;

    // Recalculate project progress
    await updateProjectProgress(projectId);

    // Get the newly created task with assignee join
    const [newTaskRows] = await pool.query(
      `SELECT t.*, p.name as project_name,
              u.name as assignee_name, u.email as assignee_email, 
              u.role as assignee_role, u.status as assignee_status, 
              u.avatar as assignee_avatar, u.department as assignee_department 
       FROM tasks t 
       JOIN projects p ON t.project_id = p.id 
       LEFT JOIN users u ON t.assignee_id = u.id 
       WHERE t.id = ?`,
      [taskId]
    );

    res.status(201).json({
      success: true,
      data: formatTask(newTaskRows[0])
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (Project Owner or Task Assignee verified by middleware)
const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { title, description, status, priority, dueDate, assigneeId, labels, subtasks, comments } = req.body;

    // Build update fields
    const updateFields = [];
    const queryParams = [];

    if (title !== undefined) { updateFields.push('title = ?'); queryParams.push(title); }
    if (description !== undefined) { updateFields.push('description = ?'); queryParams.push(description); }
    if (status !== undefined) { updateFields.push('status = ?'); queryParams.push(status); }
    if (priority !== undefined) { updateFields.push('priority = ?'); queryParams.push(priority); }
    if (dueDate !== undefined) { updateFields.push('due_date = ?'); queryParams.push(dueDate); }
    if (assigneeId !== undefined) { updateFields.push('assignee_id = ?'); queryParams.push(assigneeId || null); }
    if (labels !== undefined) { updateFields.push('labels = ?'); queryParams.push(JSON.stringify(labels)); }
    if (subtasks !== undefined) { updateFields.push('subtasks = ?'); queryParams.push(JSON.stringify(subtasks)); }
    if (comments !== undefined) { updateFields.push('comments = ?'); queryParams.push(JSON.stringify(comments)); }

    // If there is anything to update
    if (updateFields.length > 0) {
      queryParams.push(taskId);
      await pool.query(
        `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`,
        queryParams
      );
    }

    // Fetch task details to get project ID
    const [tasks] = await pool.query('SELECT project_id FROM tasks WHERE id = ?', [taskId]);
    const projectId = tasks[0].project_id;

    // Recalculate project progress
    await updateProjectProgress(projectId);

    // Get the updated task details
    const [updatedTaskRows] = await pool.query(
      `SELECT t.*, p.name as project_name,
              u.name as assignee_name, u.email as assignee_email, 
              u.role as assignee_role, u.status as assignee_status, 
              u.avatar as assignee_avatar, u.department as assignee_department 
       FROM tasks t 
       JOIN projects p ON t.project_id = p.id 
       LEFT JOIN users u ON t.assignee_id = u.id 
       WHERE t.id = ?`,
      [taskId]
    );

    res.status(200).json({
      success: true,
      data: formatTask(updatedTaskRows[0])
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Project Owner or Task Assignee verified by middleware)
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    // Get task details to know project ID before deletion
    const [tasks] = await pool.query('SELECT project_id FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    const projectId = tasks[0].project_id;

    // Delete task
    await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);

    // Recalculate project progress
    await updateProjectProgress(projectId);

    res.status(200).json({
      success: true,
      message: 'Task successfully deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
