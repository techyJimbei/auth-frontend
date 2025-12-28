const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const QUARKUS_API = process.env.QUARKUS_API || 'http://localhost:8080/api';

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const response = await axios.post(`${QUARKUS_API}/auth/signup`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Signup failed' }
        );
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const response = await axios.post(`${QUARKUS_API}/auth/login`, req.body);

        req.session.user = {
            email: req.body.email,
            token: response.data.token,
            isVerified: response.data.isVerified || false
        };

        res.json({
            message: 'Login successful',
            token: response.data.token,
            isVerified: response.data.isVerified
        });
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Login failed' }
        );
    }
});

// Get current user status (ALWAYS fetch fresh from backend)
app.get('/api/auth/me', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    // Return the user data from session
    // The isVerified status will be updated when user clicks the verification link
    res.json({
        email: req.session.user.email,
        token: req.session.user.token,
        isVerified: req.session.user.isVerified || false
    });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

// Verify email
app.get('/api/auth/verify', async (req, res) => {
    try {
        const response = await axios.get(
            `${QUARKUS_API}/auth/verify?token=${req.query.token}`
        );

        if (req.session.user) {
            req.session.user.isVerified = true;
        }

        res.send(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).send(
            error.response?.data || 'Verification failed'
        );
    }
});

// Only start server if not being required for tests
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Session server running on http://localhost:${PORT}`);
    });
}

module.exports = app;