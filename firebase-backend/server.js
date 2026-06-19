require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // You can restrict this later when deploying to Vercel
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'Firebase Firestore (NoSQL)' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Using port 5001 so it doesn't conflict with your MySQL backend running on port 5000
const PORT = process.env.PORT || 5001; 

app.listen(PORT, () => {
  console.log(`Firebase backend server is running on port ${PORT}`);
});
