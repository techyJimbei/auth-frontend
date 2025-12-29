const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Backend API URL
const QUARKUS_API = process.env.QUARKUS_API || 'https://auth-service-qav9.onrender.com/api';

// Frontend Base URL
const FRONTEND_URL = 'https://oppenxai-auth-service.vercel.app';

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  FRONTEND_URL,
  /https:\/\/auth-frontend-.*\.vercel\.app$/
];

app.set('trust proxy', 1);

// CORS Configuration
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') return allowed === origin;
            return allowed.test(origin);
        });
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, 
        sameSite: 'none', 
        domain: undefined 
    }
}));

// --- AUTH ROUTES ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const response = await axios.post(`${QUARKUS_API}/auth/signup`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Signup failed' });
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
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Login failed' });
    }
});

// Get current user status
app.get('/api/auth/me', (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Not authenticated' });
    res.json(req.session.user);
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

/**
 * UPDATED: Verify Email with SPA-Safe Redirect
 * Redirecting to the base URL '/' is safer for Vercel if vercel.json is not set up.
 * Your App.js useEffect will catch the verified state and move the user to /dashboard.
 */
app.get('/api/auth/verify', async (req, res) => {
    try {
        // 1. Trigger Quarkus verification
        await axios.get(`${QUARKUS_API}/auth/verify?token=${req.query.token}`);

        // 2. Update local session if it exists
        if (req.session.user) {
            req.session.user.isVerified = true;
        }

        console.log('Verification successful, redirecting to frontend root...');
        
        // Redirecting to root '/' ensures the SPA loads properly on Vercel
        res.redirect(`${FRONTEND_URL}/?verified=true`);

    } catch (error) {
        console.error('Verification error:', error.message);
        res.redirect(`${FRONTEND_URL}/login?error=verification_failed`);
    }
});

app.post('/api/auth/resend-verification', async (req, res) => {
    try {
        const response = await axios.post(`${QUARKUS_API}/auth/resend-verification`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Failed' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Middleware running on port ${PORT}`);
    });
}

module.exports = app;