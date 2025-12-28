const request = require('supertest');
const axios = require('axios');

// Mock axios before requiring app
jest.mock('axios');

const app = require('../server');

describe('Auth Server API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/signup', () => {
        test('should proxy to Quarkus and return success', async () => {
            const mockResponse = { 
                data: { 
                    message: 'Signup successful! Please check your email to verify your account.',
                    success: true
                }
            };
            axios.post.mockResolvedValue(mockResponse);

            const res = await request(app)
                .post('/api/auth/signup')
                .send({ email: 'test@example.com', password: 'Test123!@#' });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain('Signup successful');
        });

        test('should return error for duplicate email', async () => {
            axios.post.mockRejectedValue({ 
                response: { 
                    status: 400,
                    data: { 
                        message: 'Email already registered',
                        success: false
                    } 
                } 
            });

            const res = await request(app)
                .post('/api/auth/signup')
                .send({ email: 'existing@example.com', password: 'Test123!@#' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Email already registered');
        });
    });

    describe('POST /api/auth/login', () => {
        test('should set session on successful login', async () => {
            const mockResponse = { 
                data: { 
                    token: 'mock-jwt-token',
                    email: 'test@example.com',
                    isVerified: false,
                    message: 'Login successful'
                } 
            };
            axios.post.mockResolvedValue(mockResponse);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'Test123!@#' });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Login successful');
            expect(res.headers['set-cookie']).toBeDefined();
        });

        test('should return error for invalid credentials', async () => {
            axios.post.mockRejectedValue({ 
                response: { 
                    status: 401,
                    data: { 
                        message: 'Invalid email or password',
                        success: false
                    } 
                } 
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });
    });

    describe('GET /api/auth/me', () => {
        test('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Not authenticated');
        });

        test('should return user data if authenticated', async () => {
            const mockLoginResponse = { 
                data: { 
                    token: 'mock-jwt-token',
                    email: 'test@example.com',
                    isVerified: false,
                    message: 'Login successful'
                } 
            };
            
            const mockStatusResponse = {
                data: {
                    email: 'test@example.com',
                    isVerified: false,
                    message: 'You need to validate your email to access the portal'
                }
            };

            axios.post.mockResolvedValue(mockLoginResponse);
            axios.get.mockResolvedValue(mockStatusResponse);

            const agent = request.agent(app);
            
            await agent
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'Test123!@#' });

            const res = await agent.get('/api/auth/me');

            expect(res.statusCode).toBe(200);
            expect(res.body.email).toBe('test@example.com');
            expect(res.body.isVerified).toBe(false);
        });
    });

    describe('POST /api/auth/logout', () => {
        test('should destroy session and clear cookie', async () => {
            const mockLoginResponse = { 
                data: { 
                    token: 'mock-jwt-token',
                    email: 'test@example.com',
                    isVerified: false,
                    message: 'Login successful'
                } 
            };
            axios.post.mockResolvedValue(mockLoginResponse);

            const agent = request.agent(app);
            
            await agent
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'Test123!@#' });

            const res = await agent.post('/api/auth/logout');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Logged out successfully');
            
            const meRes = await agent.get('/api/auth/me');
            expect(meRes.statusCode).toBe(401);
        });
    });

    describe('GET /api/auth/verify', () => {
        test('should proxy verification to Quarkus', async () => {
            axios.get.mockResolvedValue({
                data: '<html>Email verified!</html>'
            });

            const res = await request(app)
                .get('/api/auth/verify?token=test-token-123');

            expect(res.statusCode).toBe(200);
            expect(res.text).toContain('Email verified!');
        });

        test('should return error for invalid token', async () => {
            axios.get.mockRejectedValue({
                response: {
                    status: 404,
                    data: '<html>Invalid token</html>'
                }
            });

            const res = await request(app)
                .get('/api/auth/verify?token=invalid-token');

            expect(res.statusCode).toBe(404);
        });
    });
});