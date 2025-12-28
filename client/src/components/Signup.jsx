import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Password Validation State
    const [passwordTouched, setPasswordTouched] = useState(false);
    const passwordRequirements = [
        { id: 'min', label: 'At least 8 characters', regex: /.{8,}/ },
        { id: 'upper', label: 'One uppercase letter', regex: /[A-Z]/ },
        { id: 'lower', label: 'One lowercase letter', regex: /[a-z]/ },
        { id: 'digit', label: 'One digit', regex: /[0-9]/ },
        { id: 'special', label: 'One special character (@#$%^&+=!)', regex: /[@#$%^&+=!]/ },
    ];

    // Email Autocomplete State
    const [suggestions, setSuggestions] = useState([]);
    const commonDomains = ['gmail.com', 'live.com', 'yahoo.com'];

    const navigate = useNavigate();

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, email: value });

        if (value.includes('@')) {
            const [username, domainPart] = value.split('@');
            if (username && !commonDomains.includes(domainPart)) { // Ensure complete email isn't already a common domain match to stop suggestive spam
                const matches = commonDomains.filter(d => d.startsWith(domainPart));
                setSuggestions(matches.map(d => `${username}@${d}`));
                return;
            }
        }
        setSuggestions([]);
    };

    const selectSuggestion = (suggestion) => {
        setFormData({ ...formData, email: suggestion });
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Final Client-side Check
        const isPasswordValid = passwordRequirements.every(req => req.regex.test(formData.password));
        if (!isPasswordValid) {
            setError('Please meet all password requirements.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/auth/signup', formData);
            setSuccess(response.data.message || 'Signup successful! Please check your email.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group input-wrapper">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={handleEmailChange}
                            required
                            autoComplete="off"
                        />
                        {suggestions.length > 0 && (
                            <ul className="suggestions-list">
                                {suggestions.map((s, index) => (
                                    <li key={index} className="suggestion-item" onClick={() => selectSuggestion(s)}>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value });
                                setPasswordTouched(true);
                            }}
                            required
                        />

                        {/* Real-time Password Validation Feedback */}
                        <div className="password-requirements">
                            {passwordRequirements.map(req => {
                                const isMet = req.regex.test(formData.password);
                                return (
                                    <div key={req.id} className={`requirement-item ${isMet ? 'met' : (passwordTouched ? 'missing' : '')}`}>
                                        <span className="requirement-icon">{isMet ? '✓' : '○'}</span>
                                        {req.label}
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>
                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}