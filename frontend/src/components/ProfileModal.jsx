import { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useLanguage } from "../context/LanguageContext";
import { 
    FaTimes, 
    FaEnvelope, 
    FaShieldAlt, 
    FaCalendarAlt, 
    FaSignOutAlt,
    FaUserCircle,
    FaCog,
    FaQuestionCircle
} from "react-icons/fa";

export default function ProfileModal({ 
    isOpen, 
    onClose, 
    user, 
    onLogout, 
    anchorRef, 
    position = "header"
}) {
    const { t, ready, i18n } = useTranslation();
    const { isRTL, renderKey, forceUpdate } = useLanguage();
    const modalRef = useRef(null);
    const [modalStyle, setModalStyle] = useState({});

    useEffect(() => {
        const handleLanguageChange = () => {
            forceUpdate();
        };

        i18n.on('languageChanged', handleLanguageChange);
        window.addEventListener('languageChange', handleLanguageChange);

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
            window.removeEventListener('languageChange', handleLanguageChange);
        };
    }, [i18n, forceUpdate]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target) && 
                anchorRef.current && !anchorRef.current.contains(e.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
            calculatePosition();
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, anchorRef, isRTL, renderKey]);

    const calculatePosition = () => {
        if (anchorRef && anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            const modalWidth = 380;
            const modalHeight = 550;
            
            let top, left, right;

            if (position === "sidebar") {
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                
                if (spaceBelow >= modalHeight + 20) {
                    top = rect.bottom + window.scrollY + 10;
                } else {
                    top = rect.top + window.scrollY - modalHeight - 10;
                }
                
                if (isRTL) {
                    right = window.innerWidth - rect.left + window.scrollX + 10;
                } else {
                    left = rect.right + window.scrollX + 10;
                }
            } else {
                top = rect.bottom + window.scrollY + 10;
                
                if (isRTL) {
                    right = window.innerWidth - rect.right + window.scrollX;
                    left = undefined;
                } else {
                    left = rect.right - modalWidth + window.scrollX;
                    right = undefined;
                }
            }

            if (left !== undefined && left + modalWidth > window.innerWidth - 20) {
                left = window.innerWidth - modalWidth - 20;
            }
            if (right !== undefined && right + modalWidth > window.innerWidth - 20) {
                right = window.innerWidth - modalWidth - 20;
            }
            if (top + modalHeight > window.innerHeight - 20) {
                top = window.innerHeight - modalHeight - 20;
            }
            if (top < 20) {
                top = 20;
            }

            setModalStyle({ top, left, right });
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

    const getRoleColor = (role) => {
        if (role === 'admin') {
            return 'bg-purple-100 text-purple-700';
        } else if (role === 'manager') {
            return 'bg-blue-100 text-blue-700';
        } else {
            return 'bg-gray-100 text-gray-700';
        }
    };

    if (!isOpen) return null;

    const positionStyle = {
        position: 'fixed',
        top: modalStyle.top || '60px',
        zIndex: 1000,
        width: '380px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
        ...modalStyle
    };

    const rtlStyles = isRTL ? {
        direction: 'rtl',
        textAlign: 'right'
    } : {};

    const emailLabel = getText('profile.email', 'Email');
    const roleLabel = getText('profile.role', 'Role');
    const memberSinceLabel = getText('profile.memberSince', 'Member Since');
    const quickActionsLabel = getText('profile.quickActions', 'Quick Actions');
    const profileLabel = getText('profile.profile', 'Profile');
    const settingsLabel = getText('profile.settings', 'Settings');
    const helpLabel = getText('profile.help', 'Help');
    const logoutLabel = getText('navigation.logout', 'Logout');
    const versionLabel = getText('profile.version', 'Version');
    const userLabel = getText('common.user', 'User');
    const displayName = user?.name || userLabel;
    const displayRole = getRoleDisplay(user?.role);

    return (
        <>
            <div 
                className="fixed inset-0 z-40"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                onClick={onClose}
            />
            
            <div 
                key={`modal-${renderKey}`}
                ref={modalRef}
                style={{ ...positionStyle, ...rtlStyles }}
                className={`animate-slideDown ${isRTL ? 'rtl' : 'ltr'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <button
                    onClick={onClose}
                    className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 z-10`}
                >
                    <FaTimes className={`w-4 h-4 ${isRTL ? 'ml-0 mr-auto' : ''}`} />
                </button>

                <div className={`px-6 pt-6 pb-4 ${isRTL ? 'text-right' : 'text-center'}`}>
                    <div className={`relative ${isRTL ? 'flex justify-start' : 'inline-block'} ${isRTL ? 'w-full' : ''}`}>
                        <div className={`h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ${isRTL ? 'mr-0' : 'mx-auto'}`}>
                            {getInitials(user?.name)}
                        </div>
                        <div className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} h-5 w-5 rounded-full bg-green-500 border-2 border-white`}></div>
                    </div>
                    <h3 className={`mt-3 text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-center'}`}>
                        {displayName}
                    </h3>
                    <p className={`text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-center'}`}>
                        {user?.email || "user@example.com"}
                    </p>
                    <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role)} ${isRTL ? 'float-right' : ''}`}>
                        {displayRole}
                    </span>
                    {isRTL && <div className="clear-both"></div>}
                </div>

                <div className={`px-6 py-3 border-t border-gray-100 ${isRTL ? 'text-right' : ''}`}>
                    <div className="space-y-2">
                        <div className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 ${isRTL ? 'ml-0 mr-0' : ''}`}>
                                <FaEnvelope className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs text-gray-500 font-medium uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                                    {emailLabel}
                                </p>
                                <p className={`text-sm font-medium text-gray-900 truncate ${isRTL ? 'text-right' : ''}`}>
                                    {user?.email || "user@example.com"}
                                </p>
                            </div>
                        </div>

                        <div className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0 ${isRTL ? 'ml-0 mr-0' : ''}`}>
                                <FaShieldAlt className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs text-gray-500 font-medium uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                                    {roleLabel}
                                </p>
                                <p className={`text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                                    {displayRole}
                                </p>
                            </div>
                        </div>

                        {user?.createdAt && (
                            <div className={`flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className={`h-9 w-9 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0 ${isRTL ? 'ml-0 mr-0' : ''}`}>
                                    <FaCalendarAlt className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs text-gray-500 font-medium uppercase tracking-wider ${isRTL ? 'text-right' : ''}`}>
                                        {memberSinceLabel}
                                    </p>
                                    <p className={`text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                                        {new Date(user.createdAt).toLocaleDateString(isRTL ? 'dr' : 'en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`px-6 py-3 border-t border-gray-100 ${isRTL ? 'text-right' : ''}`}>
                    <p className={`text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 ${isRTL ? 'text-right' : ''}`}>
                        {quickActionsLabel}
                    </p>
                    <div className={`grid grid-cols-3 gap-2 ${isRTL ? 'rtl-grid' : ''}`}>
                        <button className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 ${isRTL ? 'ml-0 mr-0' : ''}`}>
                                <FaUserCircle className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-gray-600">{profileLabel}</span>
                        </button>
                        <button className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 ${isRTL ? 'ml-0 mr-0' : ''}`}>
                                <FaCog className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-gray-600">{settingsLabel}</span>
                        </button>
                        <button className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 ${isRTL ? 'ml-0 mr-0' : ''}`}>
                                <FaQuestionCircle className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-gray-600">{helpLabel}</span>
                        </button>
                    </div>
                </div>

                <div className="px-6 py-3 border-t border-gray-100">
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                        <FaSignOutAlt className="w-4 h-4" />
                        {logoutLabel}
                    </button>
                </div>

                <div className={`px-6 py-2 text-center border-t border-gray-100 ${isRTL ? 'text-right' : ''}`}>
                    <p className="text-xs text-gray-400">
                        {versionLabel} 1.0.0
                    </p>
                </div>
            </div>
        </>
    );
}