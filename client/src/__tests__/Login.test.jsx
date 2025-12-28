import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import Login from '../components/Login';
import Signup from '../components/Signup';
import Dashboard from '../components/Dashboard';

// Mock axios
vi.mock('axios');

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        render(
            <BrowserRouter>
                <Login onLogin={vi.fn()} />
            </BrowserRouter>
        );
        
        // Check heading
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        
        // Check for email input - Name is empty "", so just get by role
        const emailInput = screen.getByRole('textbox');
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toHaveAttribute('type', 'email');
        
        // Check for login button
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('handles successful login', async () => {
        const mockOnLogin = vi.fn();
        axios.post.mockResolvedValueOnce({ 
            data: { 
                message: 'Login successful',
                token: 'mock-token',
                isVerified: false
            } 
        });

        render(
            <BrowserRouter>
                <Login onLogin={mockOnLogin} />
            </BrowserRouter>
        );

        // Get inputs directly - labels are not connected
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const loginButton = screen.getByRole('button', { name: /login/i });

        // Fill form
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test123!@#' } });
        
        // Submit
        fireEvent.click(loginButton);

        // Wait for API call
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                '/api/auth/login',
                expect.objectContaining({
                    email: 'test@example.com',
                    password: 'Test123!@#'
                })
            );
        });
    });

    it('displays error message on failed login', async () => {
        axios.post.mockRejectedValueOnce({ 
            response: { 
                status: 401,
                data: { message: 'Invalid email or password' } 
            } 
        });

        render(
            <BrowserRouter>
                <Login onLogin={vi.fn()} />
            </BrowserRouter>
        );

        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const loginButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrong' } });
        fireEvent.click(loginButton);

        // Wait for error message to appear
        await waitFor(() => {
            const errorElement = screen.queryByText(/invalid/i) || screen.queryByText(/error/i);
            expect(errorElement).toBeInTheDocument();
        });
    });
});

describe('Signup Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders signup form correctly', () => {
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );
        
        expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
        
        // Check for password requirements
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });

    it('submits signup form successfully', async () => {
        axios.post.mockResolvedValueOnce({ 
            data: { 
                message: 'Signup successful! Please check your email.',
                success: true
            } 
        });

        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const signupButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test123!@#' } });
        fireEvent.click(signupButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                '/api/auth/signup',
                expect.objectContaining({
                    email: 'new@example.com',
                    password: 'Test123!@#'
                })
            );
        });
    });

    it('shows error for duplicate email', async () => {
        axios.post.mockRejectedValueOnce({ 
            response: { 
                status: 400,
                data: { message: 'Email already registered' } 
            } 
        });

        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const signupButton = screen.getByRole('button', { name: /sign up/i });

        fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test123!@#' } });
        fireEvent.click(signupButton);

        await waitFor(() => {
            expect(screen.getByText(/already registered/i)).toBeInTheDocument();
        });
    });
});

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock global fetch
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    email: 'test@example.com',
                    isVerified: false,
                    message: 'You need to validate your email'
                })
            })
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders dashboard with user email', async () => {
        const mockUser = {
            email: 'test@example.com',
            isVerified: false
        };

        await act(async () => {
            render(<Dashboard user={mockUser} onLogout={vi.fn()} />);
        });

        await waitFor(() => {
            expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
            expect(screen.getByText('test@example.com')).toBeInTheDocument();
        });
    });

    it('shows verification message for unverified user', async () => {
        const mockUser = {
            email: 'test@example.com',
            isVerified: false
        };

        await act(async () => {
            render(<Dashboard user={mockUser} onLogout={vi.fn()} />);
        });

        await waitFor(() => {
            const message = screen.getByText(/validate your email/i);
            expect(message).toBeInTheDocument();
        });
    });

    it('shows success message for verified user', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    email: 'verified@example.com',
                    isVerified: true,
                    message: 'Your email is validated'
                })
            })
        );

        const mockUser = {
            email: 'verified@example.com',
            isVerified: true
        };

        await act(async () => {
            render(<Dashboard user={mockUser} onLogout={vi.fn()} />);
        });

        await waitFor(() => {
            const message = screen.getByText(/email is validated/i);
            expect(message).toBeInTheDocument();
        });
    });

    it('calls logout handler when button clicked', async () => {
        const mockLogout = vi.fn();
        const mockUser = {
            email: 'test@example.com',
            isVerified: false
        };

        await act(async () => {
            render(<Dashboard user={mockUser} onLogout={mockLogout} />);
        });

        await waitFor(() => {
            const logoutButton = screen.getByRole('button', { name: /logout/i });
            fireEvent.click(logoutButton);
            expect(mockLogout).toHaveBeenCalled();
        });
    });
});