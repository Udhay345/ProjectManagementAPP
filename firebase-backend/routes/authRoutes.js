const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const pool = require('../config/mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please add all fields' });
    }

    // Check if user exists in Firebase
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Check if user exists in MySQL
    try {
      const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ success: false, message: 'User already exists in SQL Database' });
      }
    } catch (err) {
      console.log('MySQL fallback check failed during registration:', err.message);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role || 'Developer';
    const userDept = department || 'ENGINEERING';
    const userStatus = 'Active';
    const userAvatar = avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`;

    // Create user in Firebase
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: userRole,
      department: userDept,
      status: userStatus,
      avatar: userAvatar,
      createdAt: new Date().toISOString()
    };

    const docRef = await usersRef.add(newUser);

    // Also attempt to create in MySQL to keep in sync
    try {
      await pool.query(
        `INSERT INTO users (name, email, password, role, status, avatar, department) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, userRole, userStatus, userAvatar, userDept]
      );
    } catch (err) {
      console.log('Failed to mirror user to MySQL:', err.message);
    }

    // Create token
    const token = jwt.sign({ id: docRef.id }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '30d'
    });

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        name,
        email,
        role: userRole,
        department: userDept,
        status: userStatus,
        avatar: userAvatar,
        token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersRef = db.collection('users');
    let snapshot;
    try {
      snapshot = await usersRef.where('email', '==', email).get();
    } catch (err) {
      console.log('Firebase login check failed:', err.message);
    }

    let user = null;
    let userId = null;
    let fromMysql = false;

    if (snapshot && !snapshot.empty) {
      const userDoc = snapshot.docs[0];
      user = userDoc.data();
      userId = userDoc.id;
    } else {
      // Check MySQL
      try {
        const [rows] = await pool.query(
          'SELECT id, name, email, password, role, status, avatar, department FROM users WHERE email = ?',
          [email]
        );
        if (rows.length > 0) {
          user = rows[0];
          userId = String(user.id);
          fromMysql = true;
        }
      } catch (err) {
        console.log('MySQL login check failed:', err.message);
      }
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // If logged in from MySQL but not in Firebase, migrate them
    if (fromMysql) {
      try {
        const newUser = {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role || 'Developer',
          department: user.department || 'ENGINEERING',
          status: user.status || 'Active',
          avatar: user.avatar || '',
          createdAt: new Date().toISOString()
        };
        const docRef = await usersRef.add(newUser);
        userId = docRef.id; // use firebase id for the token
        console.log(`Migrated user ${user.email} to Firebase.`);
      } catch (err) {
        console.log('Failed to migrate user to Firebase:', err.message);
      }
    }

    // Create token
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'fallback_secret', {
      expiresIn: '30d'
    });

    res.status(200).json({
      success: true,
      data: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role || 'Developer',
        department: user.department || 'ENGINEERING',
        status: user.status || 'Active',
        avatar: user.avatar || '',
        token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Me (users)
router.get('/users', protect, async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role || 'Developer',
        status: data.status || 'Active',
        avatar: data.avatar || '',
        department: data.department || 'ENGINEERING'
      });
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
