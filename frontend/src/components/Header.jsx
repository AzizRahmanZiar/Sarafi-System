import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Toast from "./Toast";
import LanguageSwitcher from "./LanguageSwitcher";
import ProfileModal from "./ProfileModal";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
    const navigate = useNavigate();
    const { t, ready } = useTranslation();
    const { renderKey, isRTL } = useLanguage();
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const avatarRef = useRef(null);

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
        setIsProfileModalOpen(false);
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
        if (!ready) return fallback;
        try {
            const translated = t(key);
            return translated && translated !== key ? translated : fallback;
        } catch (e) {
            return fallback;
        }
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

    const isRtl = isRTL || document.documentElement.dir === 'rtl';

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <header 
                key={`header-${renderKey}`}
                className={`flex h-16 items-center justify-between border-b bg-white px-6 ${isRtl ? 'rtl-header' : ''}`}
                dir={isRtl ? 'rtl' : 'ltr'}
            >
                {/* Left side - Language Switcher */}
                <div className={`flex items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <LanguageSwitcher />
                </div>

                {/* Right side - User Profile */}
                <div 
                    ref={avatarRef}
                    className={`flex items-center gap-3 cursor-pointer group ${isRtl ? 'flex-row-reverse' : ''}`}
                    onClick={() => setIsProfileModalOpen(true)}
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0">
                        {getInitials(user?.name)}
                    </div>
                    <div className={`hidden sm:block ${isRtl ? 'text-right' : 'text-left'}`}>
                        <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                            {displayName}
                        </p>
                       
                    </div>
                </div>
            </header>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={user}
                onLogout={handleLogout}
                anchorRef={avatarRef}
                position="header"
            />
        </>
    );
}