import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Settings as SettingsIcon,
    DollarSign,
    Users,
    Shield,
    Bell,
    Globe,
    ChevronRight,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [companyData, setCompanyData] = useState(null);
    const [currencies, setCurrencies] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const companyRes = await api.get('/company-settings');
            if (companyRes.data.success) {
                setCompanyData(companyRes.data.data);
            }

            const currencyRes = await api.get('/currencies');
            if (currencyRes.data.success) {
                setCurrencies(currencyRes.data.data.currencies || []);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const settingsSections = [
        {
            id: 'currencies',
            title: 'Currencies',
            description: 'Manage your company currencies',
            icon: DollarSign,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800',
            action: () => navigate('/dashboard/settings/currencies'),
            badge: `${currencies.length} currencies`
        },
        {
            id: 'accounts',
            title: 'Account Management',
            description: 'Manage staff, customers and saraf',
            icon: Users,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-200 dark:border-amber-800',
            action: () => navigate('/dashboard/accounts'),
        },
        {
            id: 'security',
            title: 'Security',
            description: 'Manage your security settings',
            icon: Shield,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            border: 'border-purple-200 dark:border-purple-800',
            action: () => {},
            comingSoon: true
        },
        {
            id: 'notifications',
            title: 'Notifications',
            description: 'Configure notification preferences',
            icon: Bell,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            action: () => {},
            comingSoon: true
        },
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your company settings and preferences</p>
                </div>
                <button
                    onClick={fetchSettings}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button onClick={fetchSettings} className="text-sm underline hover:no-underline">Retry</button>
                </div>
            )}

            {/* Company Info Card */}
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
                            <Globe className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {companyData?.company?.name || user?.company?.name || 'Your Company'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {companyData?.company?.email || user?.email || 'No email set'}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs text-gray-400">
                                    {currencies.length} currencies
                                </span>
                                <span className="text-xs text-gray-400">
                                    Default: {currencies.find(c => c.pivot?.is_default)?.code || 'USD'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settingsSections.map((section) => (
                    <div
                        key={section.id}
                        onClick={section.comingSoon ? undefined : section.action}
                        className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border ${section.border} transition-all ${
                            section.comingSoon 
                                ? 'opacity-60 cursor-not-allowed' 
                                : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${section.bg} flex items-center justify-center ${section.color}`}>
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        {section.title}
                                        {section.comingSoon && (
                                            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                                                Soon
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
                                    {section.badge && (
                                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                            {section.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {!section.comingSoon && (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Currency Stats */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Currency Overview</h3>
                    <button
                        onClick={() => navigate('/dashboard/settings/currencies')}
                        className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
                    >
                        Manage Currencies
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {currencies.length || 0}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Default</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {currencies.find(c => c.pivot?.is_default)?.code || 'USD'}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">System</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {currencies.filter(c => c.is_system).length || 0}
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Custom</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {currencies.filter(c => !c.is_system).length || 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;