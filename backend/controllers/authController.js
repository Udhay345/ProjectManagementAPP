const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generateToken, validateEmail } = require('../utils/helpers');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, avatar } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set default role/dept/status if not provided
    const userRole = role || 'Developer';
    const userDept = department || 'ENGINEERING';
    const userStatus = 'Active';
    const userAvatar = avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`; // default placeholder avatar

    // Insert user into database
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, status, avatar, department) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, userRole, userStatus, userAvatar, userDept]
    );

    const userId = result.insertId;

    res.status(201).json({
      success: true,
      data: {
        id: userId,
        name,
        email,
        role: userRole,
        status: userStatus,
        avatar: userAvatar,
        department: userDept,
        token: generateToken(userId)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, status, avatar, department FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        department: user.department,
        token: token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (team members)
// @route   GET /api/auth/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status, avatar, department FROM users'
    );
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers
};
