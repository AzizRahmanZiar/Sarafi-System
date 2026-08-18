// layouts/Sidebar.jsx
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import { 
    FaTachometerAlt, 
    FaUsers, 
    FaCog, 
    FaSignOutAlt,
    FaShieldAlt
} from "react-icons/fa";

export default function Sidebar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
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

    // Check user role
    const isAdmin = user?.role === "admin";

    const handleLogout = async () => {
        try {
            await api.post("/logout");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
            {/* Logo */}
            <div className="border-b border-slate-700 p-5">
                <h1 className="text-2xl font-bold">
                    Money Exchange
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Management System
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {/* Dashboard link */}
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `block rounded-lg px-4 py-2.5 transition-colors ${
                            isActive
                                ? "bg-blue-600"
                                : "hover:bg-slate-700"
                        }`
                    }
                >
                    <span className="flex items-center gap-3">
                        <FaTachometerAlt className="w-5 h-5" />
                        Dashboard
                    </span>
                </NavLink>

                {/* Accounts link - visible to both admin and staff */}
                <NavLink
                    to="/dashboard/accounts"
                    className={({ isActive }) =>
                        `block rounded-lg px-4 py-2.5 transition-colors ${
                            isActive
                                ? "bg-blue-600"
                                : "hover:bg-slate-700"
                        }`
                    }
                >
                    <span className="flex items-center gap-3">
                        <FaUsers className="w-5 h-5" />
                        Accounts
                    </span>
                </NavLink>

                {/* Admin-only links */}
                {isAdmin && (
                    <>
                        <div className="pt-4 mt-4 border-t border-slate-700">
                            <p className="px-4 text-xs text-slate-400 uppercase tracking-wider mb-2">
                                Admin Panel
                            </p>
                        </div>

                        <NavLink
                            to="/dashboard/staff-permissions"
                            className={({ isActive }) =>
                                `block rounded-lg px-4 py-2.5 transition-colors ${
                                    isActive
                                        ? "bg-blue-600"
                                        : "hover:bg-slate-700"
                                }`
                            }
                        >
                            <span className="flex items-center gap-3">
                                <FaShieldAlt className="w-5 h-5" />
                                Settings system
                            </span>
                        </NavLink>

                      
                    </>
                )}
            </nav>

            {/* User info at bottom */}
            <div className="border-t border-slate-700 p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.name || "User"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {user?.email || "user@example.com"}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                        <FaSignOutAlt className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}