import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaLock, FaUserPlus, FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../services/api";
import Toast from "../components/Toast";

export default function Login() {
    const navigate = useNavigate();
    const { t, ready } = useTranslation();
    const [isChecking, setIsChecking] = useState(true);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [adminExists, setAdminExists] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard", { replace: true });
            return;
        }
        setIsChecking(false);
    }, [navigate]);

    useEffect(() => {
        if (!isChecking) {
            const checkAdmin = async () => {
                try {
                    const response = await api.get('/check-admin');
                    setAdminExists(response.data.exists);
                } catch {
                    setAdminExists(true);
                }
            };
            checkAdmin();
        }
    }, [isChecking]);

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, []);

    const getText = (key, fallback) => ready ? t(key) : fallback;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setErrors({});
        setToast(null);

        try {
            const response = await api.post("/login", formData);
            
            if (response.data.token) localStorage.setItem("token", response.data.token);
            if (response.data.user) localStorage.setItem("user", JSON.stringify(response.data.user));
            
            if (rememberMe) {
                localStorage.setItem("rememberedEmail", formData.email);
            } else {
                localStorage.removeItem("rememberedEmail");
            }

            setToast({ message: getText('toast.loginSuccess', 'Welcome back!'), type: "success" });
            setTimeout(() => navigate("/dashboard", { replace: true }), 1500);

        } catch (error) {
            const msg = error.response?.data?.message || getText('toast.somethingWentWrong', 'Something went wrong.');
            setToast({ message: msg, type: "error" });
            if (error.response?.status === 422) setErrors(error.response.data.errors || {});
        } finally {
            setLoading(false);
        }
    };

    if (isChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500">{getText('common.loading', 'Loading...')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    {/* Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-sm mb-4">
                            S
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">{getText('app.name', 'Sarafi')}</h1>
                        <p className="text-gray-500 text-sm mt-1">{getText('login.description', 'Welcome back')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {getText('login.emailLabel', 'Email Address')}
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={getText('login.enterEmail', 'Enter your email')}
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-400' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm`}
                                    required
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email[0]}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                {getText('login.passwordLabel', 'Password')}
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={getText('login.enterPassword', 'Enter your password')}
                                    className={`w-full pl-10 pr-10 py-3 rounded-lg border ${errors.password ? 'border-red-400' : 'border-gray-200'} bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password[0]}</p>}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                {getText('login.rememberMe', 'Remember me')}
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setToast({ 
                                        message: getText('login.forgotPasswordComingSoon', 'Forgot password functionality coming soon!'), 
                                        type: "info" 
                                    });
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
                            >
                                {getText('login.forgotPassword', 'Forgot Password?')}
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    {getText('login.loggingIn', 'Signing in...')}
                                </span>
                            ) : (
                                getText('login.loginButton', 'Sign In')
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    {!adminExists && (
                        <p className="mt-6 text-center text-sm text-gray-500">
                            {getText('login.noAccount', "Don't have an account?")}{" "}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                                {getText('login.registerLink', 'Create one')}
                            </Link>
                        </p>
                    )}
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">
                    {getText('app.name', 'Sarafi')} v1.0
                </p>
            </div>
        </div>
    );
}