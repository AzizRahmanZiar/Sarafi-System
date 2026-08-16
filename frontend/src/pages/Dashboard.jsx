import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { 
    FaUser, 
    FaEnvelope, 
    FaPhone, 
    FaUserTag, 
    FaCheckCircle,
    FaSignOutAlt 
} from "react-icons/fa";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem("user");
        
        if (!userData) {
            // If no user data, redirect to login
            navigate("/login");
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        } catch (error) {
            console.error("Error parsing user data:", error);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToast({
            message: "Logged out successfully!",
            type: "success"
        });
        setTimeout(() => {
            navigate("/login");
        }, 1500);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="text-xl text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="mx-auto max-w-4xl">
                {/* Header with Logout */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Dashboard
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors"
                    >
                        <FaSignOutAlt className="w-4 h-4" />
                        Logout
                    </button>
                </div>

                {/* Welcome Card */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FaUser className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Welcome back, {user?.name || "User"}!
                            </h2>
                            <p className="mt-1 text-gray-500">
                                Welcome to the Money Exchange Management System.
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Information Card */}
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h3 className="mb-4 text-xl font-semibold text-gray-700 flex items-center gap-2">
                        <FaUser className="w-5 h-5 text-gray-500" />
                        Your Profile Information
                    </h3>
                    
                    <div className="space-y-3">
                        <div className="flex items-center border-b border-gray-100 pb-3">
                            <span className="w-32 font-medium text-gray-600 flex items-center gap-2">
                                <FaUser className="w-4 h-4 text-gray-400" />
                                Full Name
                            </span>
                            <span className="text-gray-800">{user?.name || "N/A"}</span>
                        </div>
                        
                        <div className="flex items-center border-b border-gray-100 pb-3">
                            <span className="w-32 font-medium text-gray-600 flex items-center gap-2">
                                <FaEnvelope className="w-4 h-4 text-gray-400" />
                                Email
                            </span>
                            <span className="text-gray-800">{user?.email || "N/A"}</span>
                        </div>
                        
                        <div className="flex items-center border-b border-gray-100 pb-3">
                            <span className="w-32 font-medium text-gray-600 flex items-center gap-2">
                                <FaPhone className="w-4 h-4 text-gray-400" />
                                Phone
                            </span>
                            <span className="text-gray-800">{user?.phone || "N/A"}</span>
                        </div>
                        
                        <div className="flex items-center border-b border-gray-100 pb-3">
                            <span className="w-32 font-medium text-gray-600 flex items-center gap-2">
                                <FaUserTag className="w-4 h-4 text-gray-400" />
                                Role
                            </span>
                            <span className="text-gray-800">
                                <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                                    user?.role === "admin" 
                                        ? "bg-purple-100 text-purple-700" 
                                        : "bg-blue-100 text-blue-700"
                                }`}>
                                    {user?.role || "Staff"}
                                </span>
                            </span>
                        </div>
                        
                        <div className="flex items-center">
                            <span className="w-32 font-medium text-gray-600 flex items-center gap-2">
                                <FaCheckCircle className="w-4 h-4 text-gray-400" />
                                Status
                            </span>
                            <span className="text-gray-800">
                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 flex items-center gap-1">
                                    <FaCheckCircle className="w-3 h-3" />
                                    Active
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FaUserTag className="w-4 h-4" />
                            Role
                        </div>
                        <div className="text-xl font-bold text-gray-800 mt-1">
                            {user?.role === "admin" ? "Administrator" : "Staff Member"}
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FaCheckCircle className="w-4 h-4" />
                            Account Status
                        </div>
                        <div className="text-xl font-bold text-green-600 mt-1">Active</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FaUser className="w-4 h-4" />
                            Member Since
                        </div>
                        <div className="text-xl font-bold text-gray-800 mt-1">
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}