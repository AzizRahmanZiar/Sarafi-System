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
    const { t, ready } = useTranslation();
    const { renderKey, isRTL } = useLanguage();
    const [user, setUser] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const userSectionRef = useRef(null);
    const [isRtl, setIsRtl] = useState(false);

    // Force update when language changes
    useEffect(() => {
        const isRtlValue = isRTL || document.documentElement.dir === 'rtl';
        setIsRtl(isRtlValue);
        // Force document direction
        if (isRtlValue) {
            document.documentElement.dir = 'rtl';
            document.body.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
            document.body.dir = 'ltr';
        }
    }, [isRTL, renderKey]);

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

    // Get current RTL state
    const currentIsRtl = isRtl || document.documentElement.dir === 'rtl';

    return (
        <>
            <aside 
                key={`sidebar-${renderKey}`}
                className={`sidebar-container w-64 bg-slate-900 text-white min-h-screen flex flex-col ${currentIsRtl ? 'sidebar-rtl' : 'sidebar-ltr'}`}
                dir={currentIsRtl ? 'rtl' : 'ltr'}
            >
                {/* Logo Section */}
                <div className={`sidebar-header border-b border-slate-700 p-5 ${currentIsRtl ? 'text-right' : 'text-left'}`}>
                    <h1 className={`sidebar-title text-2xl font-bold ${currentIsRtl ? 'text-right' : 'text-left'}`}>
                        {appName}
                    </h1>
                    <p className={`sidebar-subtitle text-xs text-slate-400 mt-1 ${currentIsRtl ? 'text-right' : 'text-left'}`}>
                        {dashboardText}
                    </p>
                </div>

                {/* Navigation Links */}
                <nav className={`sidebar-nav flex-1 p-4 ${currentIsRtl ? 'space-y-2' : 'space-y-2'}`}>
                    {/* Dashboard Link */}
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `sidebar-link block rounded-lg px-4 py-2.5 transition-colors ${
                                isActive ? "bg-blue-600" : "hover:bg-slate-700"
                            } ${currentIsRtl ? 'text-right' : 'text-left'}`
                        }
                    >
                        <span className={`sidebar-link-content flex items-center gap-3 ${currentIsRtl ? 'flex-row-reverse' : ''}`}>
                            <FaTachometerAlt className={`sidebar-icon w-5 h-5 flex-shrink-0 ${currentIsRtl ? 'order-last' : ''}`} />
                            <span className={`sidebar-link-text flex-1 ${currentIsRtl ? 'text-right' : 'text-left'}`}>{dashboardText}</span>
                        </span>
                    </NavLink>

                    {/* Accounts Link */}
                    <NavLink
                        to="/dashboard/accounts"
                        className={({ isActive }) =>
                            `sidebar-link block rounded-lg px-4 py-2.5 transition-colors ${
                                isActive ? "bg-blue-600" : "hover:bg-slate-700"
                            } ${currentIsRtl ? 'text-right' : 'text-left'}`
                        }
                    >
                        <span className={`sidebar-link-content flex items-center gap-3 ${currentIsRtl ? 'flex-row-reverse' : ''}`}>
                            <FaUsers className={`sidebar-icon w-5 h-5 flex-shrink-0 ${currentIsRtl ? 'order-last' : ''}`} />
                            <span className={`sidebar-link-text flex-1 ${currentIsRtl ? 'text-right' : 'text-left'}`}>{accountsText}</span>
                        </span>
                    </NavLink>

                    {isAdmin && (
                        <>
                            <div className="sidebar-divider pt-4 mt-4 border-t border-slate-700">
                                <p className={`sidebar-divider-text px-4 text-xs text-slate-400 uppercase tracking-wider mb-2 ${currentIsRtl ? 'text-right' : 'text-left'}`}>
                                    {adminPanelText}
                                </p>
                            </div>

                            {/* Staff Permissions Link */}
                            <NavLink
                                to="/dashboard/staff-permissions"
                                className={({ isActive }) =>
                                    `sidebar-link block rounded-lg px-4 py-2.5 transition-colors ${
                                        isActive ? "bg-blue-600" : "hover:bg-slate-700"
                                    } ${currentIsRtl ? 'text-right' : 'text-left'}`
                                }
                            >
                                <span className={`sidebar-link-content flex items-center gap-3 ${currentIsRtl ? 'flex-row-reverse' : ''}`}>
                                    <FaShieldAlt className={`sidebar-icon w-5 h-5 flex-shrink-0 ${currentIsRtl ? 'order-last' : ''}`} />
                                    <span className={`sidebar-link-text flex-1 ${currentIsRtl ? 'text-right' : 'text-left'}`}>{staffPermissionsText}</span>
                                </span>
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* User Profile Section */}
                <div 
                    ref={userSectionRef}
                    className="sidebar-user-section border-t border-slate-700 p-4 cursor-pointer hover:bg-slate-800 transition-colors"
                    onClick={() => setIsProfileModalOpen(true)}
                >
                    <div className={`sidebar-user-content flex items-center gap-3 ${currentIsRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="sidebar-avatar h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {getInitials(user?.name)}
                        </div>
                        <div className={`sidebar-user-info flex-1 min-w-0 ${currentIsRtl ? 'text-right' : 'text-left'}`}>
                            <p className={`sidebar-user-name text-sm font-medium truncate ${currentIsRtl ? 'text-right' : 'text-left'}`}>
                                {displayName}
                            </p>
                            <p className={`sidebar-user-role text-xs text-slate-400 truncate ${currentIsRtl ? 'text-right' : 'text-left'}`}>
                                {displayRole}
                            </p>
                        </div>
                        <FaUserCircle className={`sidebar-user-icon w-4 h-4 text-slate-400 flex-shrink-0 ${currentIsRtl ? 'order-first' : ''}`} />
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