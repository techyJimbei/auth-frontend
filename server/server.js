const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Update this to your deployed Quarkus backend URL
const QUARKUS_API = process.env.QUARKUS_API || 'https://auth-service-qav9.onrender.com/api';

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' for cross-origin in production
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Middleware server is running' });
});

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

// Get current user status
app.get('/api/auth/me', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

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

// Resend verification email
app.post('/api/auth/resend-verification', async (req, res) => {
    try {
        const response = await axios.post(`${QUARKUS_API}/auth/resend-verification`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Failed to resend verification email' }
        );
    }
});

// Only start server if not being required for tests
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Session server running on http://localhost:${PORT}`);
        console.log(`Connecting to Quarkus API at: ${QUARKUS_API}`);
    });
}

module.exports = app;