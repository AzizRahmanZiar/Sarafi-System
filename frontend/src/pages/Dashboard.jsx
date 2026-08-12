// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Users, Store, BadgeCheck, TrendingUp, DollarSign, RefreshCw, Settings, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        staff: 0,
        customers: 0,
        saraf: 0,
        total_users: 0,
        currencies: { total: 0, default: null, list: [] }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/dashboard-stats');
            
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setError('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    // Stat cards
    const statCards = [
        { title: 'Total Staff', value: stats.staff || 0, icon: Users, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20', border: 'border-primary-200 dark:border-primary-800' },
        { title: 'Total Customers', value: stats.customers || 0, icon: Store, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
        { title: 'Total Saraf', value: stats.saraf || 0, icon: BadgeCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
        { title: 'Total Users', value: stats.total_users || 0, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name}!</p>
            </div>
            
            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                    <span className="flex-1">{error}</span>
                    <button onClick={fetchDashboardStats} className="text-sm underline hover:no-underline">
                        Retry
                    </button>
                </div>
            )}
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border-l-4 ${stat.border}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.title}</p>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Currency Card */}
            <div 
                className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate('/dashboard/settings')}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Currency Settings</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your company's currencies</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary-500">
                        <span className="text-sm font-medium">Manage</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Currencies</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currencies?.total || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Default Currency</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats.currencies?.default?.code || 'USD'}
                        </p>
                        <p className="text-xs text-gray-400">{stats.currencies?.default?.name || 'US Dollar'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Currencies</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {stats.currencies?.list?.slice(0, 5).map((currency, index) => (
                                <span key={index} className={`px-2 py-1 rounded text-xs font-medium ${
                                    currency.pivot?.is_default 
                                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                }`}>
                                    {currency.code}
                                </span>
                            ))}
                            {(stats.currencies?.list?.length || 0) > 5 && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                    +{stats.currencies.list.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        {[
                            { icon: '👤', label: 'Create New Account', path: '/dashboard/accounts' },
                            { icon: '👥', label: 'Manage Users', path: '/dashboard/accounts' },
                            { icon: '⚙️', label: 'Settings', path: '/dashboard/settings' },
                        ].map((action, idx) => (
                            <button 
                                key={idx}
                                onClick={() => navigate(action.path)}
                                className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all text-left text-gray-700 dark:text-gray-300"
                            >
                                <span className="text-xl">{action.icon}</span>
                                <span>{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">System Status</span>
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium flex items-center gap-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Online
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date().toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Admin</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;