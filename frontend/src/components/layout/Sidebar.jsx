// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, isMobileOpen, onMobileClose }) => {
    const { logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', icon: <LayoutDashboard className="w-6 h-6" />, label: 'Dashboard' },
        { path: '/dashboard/accounts', icon: <Users className="w-6 h-6" />, label: 'Accounts' },
        { path: '/dashboard/settings', icon: <Settings className="w-6 h-6" />, label: 'Settings' },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onMobileClose}
                />
            )}
            
            <aside className={`
                fixed top-0 left-0 h-full bg-white dark:bg-gray-800 
                border-r border-gray-200 dark:border-gray-700
                flex flex-col transition-all duration-300 z-50
                ${isOpen ? 'w-64' : 'w-20'}
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0">
                        <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="url(#grad)" />
                            <path d="M16 8L8 12V20L16 24L24 20V12L16 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 12L16 16L24 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 16V24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    {isOpen && (
                        <div className="flex flex-col leading-tight">
                            <span className="text-xl font-extrabold text-gray-900 dark:text-white">Admin</span>
                            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-widest uppercase">Dashboard</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-200 cursor-pointer
                                ${isActive 
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                }
                                ${!isOpen ? 'justify-center' : ''}
                            `}
                        >
                            <span className="w-6 h-6 flex items-center justify-center">
                                {item.icon}
                            </span>
                            {isOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
                    <button 
                        onClick={logout}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl w-full
                            transition-all duration-200 cursor-pointer
                            text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                            ${!isOpen ? 'justify-center' : ''}
                        `}
                    >
                        <span className="w-6 h-6 flex items-center justify-center">
                            <LogOut className="w-6 h-6" />
                        </span>
                        {isOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;