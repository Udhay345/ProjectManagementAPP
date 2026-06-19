const pool = require('../config/db');

// Helper to format a project object with its nested members and tasks
const formatProject = (project, members = [], tasks = []) => {
  return {
    id: String(project.id),
    name: project.name,
    description: project.description || '',
    brief: project.brief || '',
    status: project.status,
    startDate: project.start_date || '',
    endDate: project.end_date || '',
    progress: parseInt(project.progress || '0'),
    ownerId: project.owner_id,
    members: members.map(m => ({
      id: String(m.id),
      name: m.name,
      email: m.email,
      role: m.role || 'Developer',
      status: m.status || 'Active',
      avatar: m.avatar || '',
      department: m.department || 'ENGINEERING'
    })),
    tasks: tasks.map(t => {
      // Parse JSON fields safely (handle both pre-parsed objects and stringified JSON)
      let parsedLabels = [];
      let parsedSubtasks = [];
      let parsedComments = [];

      try {
        parsedLabels = typeof t.labels === 'string' ? JSON.parse(t.labels) : (t.labels || []);
      } catch (e) { parsedLabels = []; }

      try {
        parsedSubtasks = typeof t.subtasks === 'string' ? JSON.parse(t.subtasks) : (t.subtasks || []);
      } catch (e) { parsedSubtasks = []; }

      try {
        parsedComments = typeof t.comments === 'string' ? JSON.parse(t.comments) : (t.comments || []);
      } catch (e) { parsedComments = []; }

      return {
        id: String(t.id),
        projectId: String(t.project_id),
        projectName: project.name,
        title: t.title,
        description: t.description || '',
        status: t.status || 'To Do',
        priority: t.priority || 'Medium',
        dueDate: t.due_date || '',
        labels: parsedLabels,
        subtasks: parsedSubtasks,
        comments: parsedComments,
        assignee: t.assignee_id ? {
          id: String(t.assignee_id),
          name: t.assignee_name,
          email: t.assignee_email,
          role: t.assignee_role || 'Developer',
          status: t.assignee_status || 'Active',
          avatar: t.assignee_avatar || '',
          department: t.assignee_department || 'ENGINEERING'
        } : null
      };
    })
  };
};

// @desc    Get all projects (optionally filtered by involvement)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    // Fetch all projects (or projects where the user is an owner or member)
    const [projects] = await pool.query(
      `SELECT DISTINCT p.* FROM projects p 
       LEFT JOIN project_members pm ON p.id = pm.project_id 
       WHERE p.owner_id = ? OR pm.user_id = ? 
       ORDER BY p.created_at DESC`,
      [req.user.id, req.user.id]
    );

    const formattedProjects = [];

    for (const project of projects) {
      // Get members of this project
      const [members] = await pool.query(
        `SELECT u.id, u.name, u.email, u.role, u.status, u.avatar, u.department 
         FROM users u 
         JOIN project_members pm ON u.id = pm.user_id 
         WHERE pm.project_id = ?`,
        [project.id]
      );

      // Get tasks of this project
      const [tasks] = await pool.query(
        `SELECT t.*, 
                u.name as assignee_name, u.email as assignee_email, 
                u.role as assignee_role, u.status as assignee_status, 
                u.avatar as assignee_avatar, u.department as assignee_department 
         FROM tasks t 
         LEFT JOIN users u ON t.assignee_id = u.id 
         WHERE t.project_id = ?`,
        [project.id]
      );

      formattedProjects.push(formatProject(project, members, tasks));
    }

    res.status(200).json({
      success: true,
      data: formattedProjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const project = projects[0];

    // Check if the requesting user has authorization (owner or member)
    const [memberships] = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, req.user.id]
    );

    if (project.owner_id !== req.user.id && memberships.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this project' });
    }

    // Get members
    const [members] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.avatar, u.department 
       FROM users u 
       JOIN project_members pm ON u.id = pm.user_id 
       WHERE pm.project_id = ?`,
      [projectId]
    );

    // Get tasks
    const [tasks] = await pool.query(
      `SELECT t.*, 
              u.name as assignee_name, u.email as assignee_email, 
              u.role as assignee_role, u.status as assignee_status, 
              u.avatar as assignee_avatar, u.department as assignee_department 
       FROM tasks t 
       LEFT JOIN users u ON t.assignee_id = u.id 
       WHERE t.project_id = ?`,
      [projectId]
    );

    res.status(200).json({
      success: true,
      data: formatProject(project, members, tasks)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, description, brief, status, startDate, endDate, members } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const projectStatus = status || 'In Progress';
    const projStartDate = startDate || null;
    const projEndDate = endDate || null;
    const initialProgress = 0;

    // Insert project
    const [result] = await pool.query(
      `INSERT INTO projects (name, description, brief, status, start_date, end_date, progress, owner_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, brief || null, projectStatus, projStartDate, projEndDate, initialProgress, req.user.id]
    );

    const projectId = result.insertId;

    // Add owner as a member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id) VALUES (?, ?)',
      [projectId, req.user.id]
    );

    // Add selected members if provided
    if (members && Array.isArray(members)) {
      for (const memberId of members) {
        if (memberId !== req.user.id) {
          await pool.query(
            'INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)',
            [projectId, memberId]
          );
        }
      }
    }

    // Retrieve the fully populated project for response
    const [projectRows] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    const [memberRows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.avatar, u.department 
       FROM users u 
       JOIN project_members pm ON u.id = pm.user_id 
       WHERE pm.project_id = ?`,
      [projectId]
    );

    res.status(201).json({
      success: true,
      data: formatProject(projectRows[0], memberRows, [])
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Owner only - verified via middleware)
const updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { name, description, brief, status, startDate, endDate, progress, members } = req.body;

    // Build the update query dynamically based on provided fields
    const updateFields = [];
    const queryParams = [];

    if (name !== undefined) { updateFields.push('name = ?'); queryParams.push(name); }
    if (description !== undefined) { updateFields.push('description = ?'); queryParams.push(description); }
    if (brief !== undefined) { updateFields.push('brief = ?'); queryParams.push(brief); }
    if (status !== undefined) { updateFields.push('status = ?'); queryParams.push(status); }
    if (startDate !== undefined) { updateFields.push('start_date = ?'); queryParams.push(startDate); }
    if (endDate !== undefined) { updateFields.push('end_date = ?'); queryParams.push(endDate); }
    if (progress !== undefined) { updateFields.push('progress = ?'); queryParams.push(progress); }

    if (updateFields.length > 0) {
      queryParams.push(projectId);
      await pool.query(
        `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
        queryParams
      );
    }

    // Sync project members if members list is passed
    if (members && Array.isArray(members)) {
      // Clear existing members
      await pool.query('DELETE FROM project_members WHERE project_id = ?', [projectId]);
      
      // Ensure owner is added back
      await pool.query('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [projectId, req.user.id]);
      
      // Add other members
      for (const memberId of members) {
        if (memberId !== req.user.id) {
          await pool.query(
            'INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)',
            [projectId, memberId]
          );
        }
      }
    }

    // Get the updated project details
    const [projectRows] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    const [memberRows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.avatar, u.department 
       FROM users u 
       JOIN project_members pm ON u.id = pm.user_id 
       WHERE pm.project_id = ?`,
      [projectId]
    );
    const [taskRows] = await pool.query(
      `SELECT t.*, 
              u.name as assignee_name, u.email as assignee_email, 
              u.role as assignee_role, u.status as assignee_status, 
              u.avatar as assignee_avatar, u.department as assignee_department 
       FROM tasks t 
       LEFT JOIN users u ON t.assignee_id = u.id 
       WHERE t.project_id = ?`,
      [projectId]
    );

    res.status(200).json({
      success: true,
      data: formatProject(projectRows[0], memberRows, taskRows)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Owner only - verified via middleware)
const deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // Delete project (cascades automatically to project_members and tasks in MySQL)
    await pool.query('DELETE FROM projects WHERE id = ?', [projectId]);

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks successfully deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
