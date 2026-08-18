import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Toast from "./Toast";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
    const navigate = useNavigate();
    const { t, ready } = useTranslation();
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState(null);

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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToast({
            message: ready ? t('toast.logoutSuccess') : 'Logged out successfully!',
            type: "success"
        });
        setTimeout(() => {
            navigate("/login");
        }, 1500);
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

    const getText = (key, fallback) => {
        return ready ? t(key) : fallback;
    };

    const getRoleDisplay = (role) => {
        if (!role) return getText('common.user', 'User');
        const roleKey = `common.${role}`;
        if (ready) {
            const translated = t(roleKey);
            if (translated !== roleKey) {
                return translated;
            }
        }
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

            <header className="flex h-16 items-center justify-between border-b bg-white px-6" dir={document.documentElement.dir}>
                <h2 className="text-xl font-semibold">
                    {getText('navigation.dashboard', 'Dashboard')}
                </h2>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher />

                    <div className={document.documentElement.dir === 'rtl' ? 'text-left' : 'text-right'}>
                        <p className="font-medium">
                            {user?.name || getText('common.user', 'User')}
                        </p>
                        <p className="text-sm text-gray-500">
                            {user?.email || "user@example.com"}
                        </p>
                    </div>

                    <div className="relative group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                            {getInitials(user?.name)}
                        </div>
                        
                        <div className={`absolute ${document.documentElement.dir === 'rtl' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200 hidden group-hover:block z-50`}>
                            <div className="px-4 py-2 border-b border-gray-200">
                                <p className="text-sm font-medium text-gray-800">
                                    {user?.name || getText('common.user', 'User')}
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
                                {getText('navigation.logout', 'Logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}