// src/pages/auth/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Building2, User, Mail, Lock, Phone, MapPin, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingCurrencies, setLoadingCurrencies] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [availableCurrencies, setAvailableCurrencies] = useState([]);
    const [formData, setFormData] = useState({
        company_name: '',
        admin_name: '',
        admin_email: '',
        admin_phone: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});

    // ✅ ONLY redirect if user is already logged in AND not in registration process
    useEffect(() => {
        // If user is logged in and we're not in the middle of registration
        // AND we haven't just successfully registered
        if (user && !success && !loading) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate, success, loading]);

    // ✅ Fetch currencies (for display only)
    useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        try {
            setLoadingCurrencies(true);
            
            try {
                const response = await api.get('/currencies/available');
                if (response.data.success && response.data.data?.length > 0) {
                    setAvailableCurrencies(response.data.data);
                }
            } catch (apiError) {
                console.log('API fetch failed:', apiError.message);
            }
            
            // Fallback currencies (for display only)
            const fallback = [
                { id: 1, code: 'USD', name: 'US Dollar', symbol: '$' },
                { id: 2, code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
                { id: 3, code: 'EUR', name: 'Euro', symbol: '€' },
                { id: 4, code: 'GBP', name: 'British Pound', symbol: '£' },
            ];
            setAvailableCurrencies(fallback);
        } catch (error) {
            console.error('Error fetching currencies:', error);
        } finally {
            setLoadingCurrencies(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    // ✅ Fixed: Submit only what the backend expects
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // ✅ Validate password match
        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // ✅ Validate password length
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            // ✅ Send only what the backend expects
            const response = await api.post('/register', {
                name: formData.admin_name,
                email: formData.admin_email,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
                company_name: formData.company_name,
                role: 'admin',
            });
            
            if (response.data.success) {
                setSuccess(true);
                const { user, token } = response.data.data;
                
                // ✅ Store token and user
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // ✅ Navigate after a short delay (this is the key fix)
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 1500);
            }
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
                const firstError = Object.values(err.response.data.errors)[0];
                if (firstError) {
                    setError(firstError[0] || 'Please fix the validation errors');
                }
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ✅ If registration is successful, show success screen
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registration Successful!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Welcome {formData.admin_name}! Your account has been created.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Redirecting to dashboard...
                    </p>
                    <div className="mt-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 text-white mb-4">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Account</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Start managing your business with your own dashboard
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Company Information
                        </h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                    errors.company_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition`}
                                placeholder="Company Name *"
                                required
                            />
                            {errors.company_name && (
                                <p className="text-xs text-red-500">{errors.company_name[0]}</p>
                            )}
                        </div>
                    </div>

                    {/* Currency Info (Display Only) */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Supported Currencies
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Your company will have access to these currencies by default.
                            You can manage them later in the settings.
                        </p>
                        {loadingCurrencies ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {availableCurrencies.map((currency) => (
                                    <span 
                                        key={currency.code}
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        {currency.symbol} {currency.code}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Admin Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Admin Account
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    name="admin_name"
                                    value={formData.admin_name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-xl border ${
                                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition`}
                                    placeholder="Admin Name *"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500">{errors.name[0]}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="email"
                                    name="admin_email"
                                    value={formData.admin_email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-xl border ${
                                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition`}
                                    placeholder="Admin Email *"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email[0]}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="admin_phone"
                                    value={formData.admin_phone}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 rounded-xl border ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition`}
                                    placeholder="Admin Phone (Optional)"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 rounded-xl border ${
                                            errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition`}
                                        placeholder="Password *"
                                        required
                                        minLength="8"
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-red-500">{errors.password[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                        placeholder="Confirm Password *"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creating Account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;