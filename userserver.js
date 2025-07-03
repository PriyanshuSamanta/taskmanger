const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // frontend origin
  credentials: true
}));
app.use(cookieParser());

app.use(session({
  secret: 'user-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 86400000 } // 1 day
}));

// MySQL connection
const db = require('./db');

// User Login Route
app.post('/api/userlogin', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const sql = 'SELECT * FROM user WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (result.length > 0) {
      req.session.user = result[0];
      res.cookie('user', result[0], { maxAge: 86400000 });
      res.json({ success: true, user: result[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// Middleware to check login
const isUserAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  return res.status(401).json({ message: 'Unauthorized' });
};

// Protected User Dashboard
app.get('/api/dashboard', isUserAuthenticated, (req, res) => {
  res.json({ message: 'Welcome to user dashboard!', user: req.session.user });
});

// Logout
app.post('/api/userlogout', (req, res) => {
  res.clearCookie('user');
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
});


app.get('/api/usertasks', (req, res) => {
  // Check if user is logged in
  if (!req.session.user || !req.session.user.name) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  const userName = req.session.user.name;

  const sql = 'SELECT * FROM task WHERE assign_to = ?';
  db.query(sql, [userName], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});


// Start server
const PORT = 5001; // different port than admin server
app.listen(PORT, () => {
  console.log(`User server running at http://localhost:${PORT}`);
});
