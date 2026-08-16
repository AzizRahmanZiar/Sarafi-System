// Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Form from "../components/form/Form";
import Input from "../components/form/Input";
import Label from "../components/form/Label";
import Button from "../components/form/Button";
import Toast from "../components/Toast";
import api from "../services/api";
import { 
    FaUser, 
    FaEnvelope, 
    FaPhone, 
    FaLock, 
    FaCheckCircle,
    FaSignInAlt 
} from "react-icons/fa";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setErrors({});
        setToast(null);

        try {
            // Admin registration endpoint
            const response = await api.post("/register-admin", formData);

            setToast({
                message: response.data.message || "Admin registration successful! Please login.",
                type: "success"
            });

            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                password_confirmation: "",
            });

            // Redirect to login page after successful registration
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                setToast({
                    message: "Please check your input and try again.",
                    type: "error"
                });
            } else if (error.response?.status === 403) {
                setToast({
                    message: error.response.data.message || "Admin already registered. Please login.",
                    type: "error"
                });
            } else {
                setToast({
                    message: "Something went wrong. Please try again.",
                    type: "error"
                });
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-lg">

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Admin Registration
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Register as the first admin user
                    </p>
                </div>

                <Form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter full name"
                                value={formData.name}
                                onChange={handleChange}
                                className="pl-10"
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name[0]}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaEnvelope className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter email"
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

                    <div>
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaPhone className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                id="phone"
                                name="phone"
                                type="text"
                                placeholder="Enter phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="pl-10"
                            />
                        </div>
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.phone[0]}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter password (min 6 characters)"
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

                    <div>
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaCheckCircle className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                placeholder="Confirm password"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                className="pl-10"
                            />
                        </div>
                        {errors.password_confirmation && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.password_confirmation[0]}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register Admin"}
                    </Button>

                </Form>

                {/* Login Link */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                        <FaSignInAlt className="w-3 h-3" />
                        Login
                    </Link>
                </div>

            </div>
        </div>
    );
}