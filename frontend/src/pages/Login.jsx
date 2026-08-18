import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Form from "../components/form/Form";
import Input from "../components/form/Input";
import Label from "../components/form/Label";
import Button from "../components/form/Button";
import Toast from "../components/Toast";
import api from "../services/api";
import { FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";

export default function Login() {
    const navigate = useNavigate();
    const { t, ready } = useTranslation();
    const [isChecking, setIsChecking] = useState(true);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [adminExists, setAdminExists] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard", { replace: true });
            return;
        }
        setIsChecking(false);
    }, [navigate]);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await api.get('/check-admin');
                setAdminExists(response.data.exists);
            } catch (error) {
                console.error('Failed to check admin:', error);
                setAdminExists(true);
            }
        };
        
        if (!isChecking) {
            checkAdmin();
        }
    }, [isChecking]);

    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        if (savedEmail) {
            setFormData(prev => ({
                ...prev,
                email: savedEmail
            }));
            setRememberMe(true);
        }
    }, []);

    const getText = (key, fallback) => {
        return ready ? t(key) : fallback;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleRememberMeChange = (e) => {
        setRememberMe(e.target.checked);
        if (!e.target.checked) {
            localStorage.removeItem("rememberedEmail");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setLoading(true);
        setErrors({});
        setToast(null);

        try {
            const response = await api.post("/login", formData);

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }

            if (response.data.user) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );
            }

            if (rememberMe) {
                localStorage.setItem("rememberedEmail", formData.email);
            } else {
                localStorage.removeItem("rememberedEmail");
            }

            setToast({
                message: getText('toast.loginSuccess', 'Login successful!'),
                type: "success"
            });

            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 1500);

        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                setToast({
                    message: getText('toast.pleaseCheckInput', 'Please check your input and try again.'),
                    type: "error"
                });
            } else if (error.response?.status === 401) {
                setErrors({
                    email: [
                        error.response.data.message ||
                            getText('login.invalidCredentials', 'Invalid email or password.'),
                    ],
                });
                setToast({
                    message: error.response.data.message || getText('login.invalidCredentials', 'Invalid email or password.'),
                    type: "error"
                });
            } else if (error.response?.status === 403) {
                setToast({
                    message: error.response.data.message || getText('login.onlyAdminStaff', 'Only admin and staff can login.'),
                    type: "error"
                });
            } else {
                setToast({
                    message: getText('toast.somethingWentWrong', 'Something went wrong. Please try again later.'),
                    type: "error"
                });
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    if (isChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="text-xl text-gray-600">{getText('common.loading', 'Loading...')}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4" dir={document.documentElement.dir}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {getText('login.title', 'Login')}
                    </h1>
                    <p className="mt-2 text-gray-500">
                        {getText('login.description', 'Login to your account')}
                    </p>
                </div>

                <Form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <Label htmlFor="email">
                            {getText('login.emailLabel', 'Email')}
                        </Label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaEnvelope className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder={getText('login.enterEmail', 'Enter your email')}
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-10"
                            />
                        </div>

                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.email[0]}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <Label htmlFor="password">
                            {getText('login.passwordLabel', 'Password')}
                        </Label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder={getText('login.enterPassword', 'Enter your password')}
                                value={formData.password}
                                onChange={handleChange}
                                className="pl-10"
                            />
                        </div>

                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.password[0]}
                            </p>
                        )}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center">
                        <input
                            id="rememberMe"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={handleRememberMeChange}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label 
                            htmlFor="rememberMe"
                            className="ml-2 text-sm text-gray-600 cursor-pointer"
                        >
                            {getText('login.rememberMe', 'Remember Me')}
                        </Label>
                    </div>

                    {/* Login Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? getText('login.loggingIn', 'Logging in...') : getText('login.loginButton', 'Login')}
                    </Button>

                </Form>

                {/* Register Link - Only show if no admin exists */}
                {!adminExists && (
                    <div className="mt-6 text-center text-sm text-gray-600">
                        {getText('login.noAccount', "Don't have an account?")}{" "}
                        <Link
                            to="/register"
                            className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                            <FaUserPlus className="w-3 h-3" />
                            {getText('login.registerLink', 'Register')}
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}