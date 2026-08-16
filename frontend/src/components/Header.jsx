import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";

export default function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

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

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Get role display name
    const getRoleDisplay = (role) => {
        if (!role) return "User";
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <header className="flex h-16 items-center justify-between border-b bg-white px-6">
                <h2 className="text-xl font-semibold">
                    Dashboard
                </h2>

                <div className="flex items-center gap-4">
                    {/* User Info */}
                    <div className="text-right">
                        <p className="font-medium">
                            {user?.name || "User"}
                        </p>
                        <p className="text-sm text-gray-500">
                            {user?.email || "user@example.com"}
                        </p>
                    </div>

                    {/* User Avatar */}
                    <div className="relative group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                            {getInitials(user?.name)}
                        </div>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200 hidden group-hover:block">
                            <div className="px-4 py-2 border-b border-gray-200">
                                <p className="text-sm font-medium text-gray-800">
                                    {user?.name || "User"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.email || "user@example.com"}
                                </p>
                                <p className="text-xs mt-1">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                        user?.role === "admin" 
                                            ? "bg-purple-100 text-purple-700" 
                                            : "bg-blue-100 text-blue-700"
                                    }`}>
                                        {getRoleDisplay(user?.role)}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}