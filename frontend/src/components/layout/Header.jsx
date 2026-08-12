// src/components/layout/Header.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, Search, Notifications, AccountCircle, ArrowDropDown, DarkMode, LightMode, Logout, Settings } from '@mui/icons-material';

const Header = ({ onMenuClick, onMobileMenuClick }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    const dropdownRef = useRef(null);

    // Apply dark mode
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 h-18 flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={onMobileMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle menu"
                >
                    <Menu className="text-gray-600 dark:text-gray-400" />
                </button>
                
                <div className={`
                    flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl transition-all duration-300
                    ${searchOpen ? 'ring-2 ring-primary-500 bg-white dark:bg-gray-800' : ''}
                    ${searchOpen ? 'w-64 md:w-80' : 'w-40 md:w-56'}
                `}>
                    <Search className="text-gray-400 mx-3" />
                    <input 
                        type="text" 
                        placeholder="Search..."
                        className="bg-transparent py-2.5 pr-3 text-sm outline-none w-full text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        onFocus={() => setSearchOpen(true)}
                        onBlur={() => setSearchOpen(false)}
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 md:gap-2">
                {/* Theme Toggle */}
                <button 
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                    aria-label="Toggle theme"
                >
                    {isDarkMode ? <LightMode /> : <DarkMode />}
                </button>

                {/* Profile */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        className="flex items-center gap-2 md:gap-3 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setProfileOpen(!profileOpen)}
                    >
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=6366f1&color=fff&size=40`} 
                                alt={user?.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="hidden md:flex flex-col text-left leading-tight">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'Admin User'}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Administrator'}</span>
                        </div>
                        <ArrowDropDown className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Dropdown */}
                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
                            <div className="px-5 py-4 flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=6366f1&color=fff&size=50`} 
                                        alt={user?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 dark:text-white">{user?.name || 'Admin User'}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'admin@example.com'}</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700" />
                            <button 
                                onClick={() => { setProfileOpen(false); navigate('/dashboard/settings'); }}
                                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Settings className="text-gray-400" />
                                <span>Settings</span>
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700" />
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <Logout />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;