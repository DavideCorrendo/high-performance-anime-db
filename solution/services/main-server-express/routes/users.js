const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Assuming you use axios to fetch from Spring Boot

const SPRING_URL = process.env.DATA_SPRING_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Registration Route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Send to Spring Boot using camelCase to match Java Entity properties
    await axios.post(`${SPRING_URL}/api/profiles`, {
      username: username,
      passwordHash: hashedPassword, // Changed from password_hash
      securityLevel: 'user', // Changed from security_level
    });

    // Redirect to login page after successful registration
    res.redirect('/users/login');
  } catch (error) {
    // Log the ACTUAL error from Spring Boot in your terminal
    console.error(
      'Spring Boot Error:',
      error.response ? error.response.data : error.message
    );

    const errorMessage = encodeURIComponent(
      'Registration failed. Username might already be taken.'
    );
    res.redirect(`/users/register?error=${errorMessage}`);
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch user from Spring Boot
    const response = await axios.get(`${SPRING_URL}/api/profiles/${username}`);
    const user = response.data;

    if (!user) {
      return res.redirect(
        '/users/login?error=' + encodeURIComponent('User not found')
      );
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.redirect(
        '/users/login?error=' + encodeURIComponent('Invalid credentials')
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { username: user.username, role: user.security_level },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set HttpOnly Cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'strict',
    });

    // Redirect to the user's profile page
    res.redirect(`/profile/${user.username}`);
  } catch (error) {
    console.error(error);
    res.redirect(
      '/users/login?error=' +
        encodeURIComponent('Login service currently unavailable')
    );
  }
});

// Logout Route
router.get('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.redirect('/');
});

router.get('/login', (req, res) => {
  res.render('profile/login', {
    title: 'Login',
    error: req.query.error,
  });
});

// Show the registration page
router.get('/register', (req, res) => {
  res.render('profile/register', {
    title: 'Register',
    error: req.query.error,
  });
});

module.exports = router;
