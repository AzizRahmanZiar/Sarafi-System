import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import api from "../services/api";
import ProfileModal from "./ProfileModal";
import { useLanguage } from "../context/LanguageContext";
import { 
    FaTachometerAlt, 
    FaUsers, 
    FaShieldAlt,
    FaUserCircle
} from "react-icons/fa";

export default function Sidebar() {
    const navigate = useNavigate();
    const { t, ready, i18n } = useTranslation();
    const { renderKey, isRTL } = useLanguage();
    const [user, setUser] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const userSectionRef = useRef(null);

    // Remove forceUpdate from dependencies to prevent infinite loops
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

    const isAdmin = user?.role === "admin";

    const handleLogout = async () => {
        try {
            await api.post("/logout");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsProfileModalOpen(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const getText = (key, fallback) => {
        if (!ready) return fallback;
        try {
            const translated = t(key);
            return translated && translated !== key ? translated : fallback;
        } catch (e) {
            return fallback;
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleDisplay = (role) => {
        if (!role) return getText('common.user', 'User');
        const roleKey = `common.${role}`;
        if (ready) {
            try {
                const translated = t(roleKey);
                if (translated && translated !== roleKey) {
                    return translated;
                }
            } catch (e) {
                // Fall through to default
            }
        }
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const displayName = user?.name || getText('common.user', 'User');
    const displayRole = getRoleDisplay(user?.role);
    const dashboardText = getText('navigation.dashboard', 'Dashboard');
    const accountsText = getText('navigation.accounts', 'Accounts');
    const adminPanelText = getText('navigation.adminPanel', 'Admin Panel');
    const staffPermissionsText = getText('navigation.staffPermissions', 'Staff Permissions');
    const appName = getText('app.name', 'Sarafi');

    const isRtl = isRTL || document.documentElement.dir === 'rtl';

    return (
        <>
            <aside 
                key={`sidebar-${renderKey}`}
                className={`w-64 bg-slate-900 text-white min-h-screen flex flex-col ${isRtl ? 'rtl-sidebar' : ''}`}
                dir={isRtl ? 'rtl' : 'ltr'}
            >
                <div className="border-b border-slate-700 p-5">
                    <h1 className={`text-2xl font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
                        {appName}
                    </h1>
                    <p className={`text-xs text-slate-400 mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                        {dashboardText}
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `block rounded-lg px-4 py-2.5 transition-colors ${
                                isActive ? "bg-blue-600" : "hover:bg-slate-700"
                            }`
                        }
                    >
                        <span className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <FaTachometerAlt className="w-5 h-5 flex-shrink-0" />
                            <span>{dashboardText}</span>
                        </span>
                    </NavLink>

                    <NavLink
                        to="/dashboard/accounts"
                        className={({ isActive }) =>
                            `block rounded-lg px-4 py-2.5 transition-colors ${
                                isActive ? "bg-blue-600" : "hover:bg-slate-700"
                            }`
                        }
                    >
                        <span className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <FaUsers className="w-5 h-5 flex-shrink-0" />
                            <span>{accountsText}</span>
                        </span>
                    </NavLink>

                    {isAdmin && (
                        <>
                            <div className="pt-4 mt-4 border-t border-slate-700">
                                <p className={`px-4 text-xs text-slate-400 uppercase tracking-wider mb-2 ${isRtl ? 'text-right' : ''}`}>
                                    {adminPanelText}
                                </p>
                            </div>

                            <NavLink
                                to="/dashboard/staff-permissions"
                                className={({ isActive }) =>
                                    `block rounded-lg px-4 py-2.5 transition-colors ${
                                        isActive ? "bg-blue-600" : "hover:bg-slate-700"
                                    }`
                                }
                            >
                                <span className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <FaShieldAlt className="w-5 h-5 flex-shrink-0" />
                                    <span>{staffPermissionsText}</span>
                                </span>
                            </NavLink>
                        </>
                    )}
                </nav>

                <div 
                    ref={userSectionRef}
                    className="border-t border-slate-700 p-4 cursor-pointer hover:bg-slate-800 transition-colors"
                    onClick={() => setIsProfileModalOpen(true)}
                >
                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {getInitials(user?.name)}
                        </div>
                        <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <p className="text-sm font-medium truncate">
                                {displayName}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                                {displayRole}
                            </p>
                        </div>
                        <FaUserCircle className={`w-4 h-4 text-slate-400 flex-shrink-0 ${isRtl ? 'order-first' : ''}`} />
                    </div>
                </div>
            </aside>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={user}
                onLogout={handleLogout}
                anchorRef={userSectionRef}
                position="sidebar"
            />
        </>
    );
}