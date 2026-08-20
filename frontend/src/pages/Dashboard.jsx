// pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Toast from "../components/Toast";
import api from "../services/api";
import { 
    FaUsers, 
    FaUser, 
    FaUserFriends, 
    FaUserTag,
    FaSignOutAlt,
    FaArrowRight,
    FaArrowLeft
} from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const isRtl = isRTL || document.documentElement.dir === 'rtl';
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        staff: 0,
        customers: 0,
        saraf: 0
    });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (!token || !userData) {
            navigate("/login", { replace: true });
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            fetchUserStats();
        } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
        }
    }, []);

    // Fetch user statistics
    const fetchUserStats = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            const response = await api.get("/users");
            const users = response.data.users || [];
            
            const staffCount = users.filter(u => u.role === "staff").length;
            const customerCount = users.filter(u => u.role === "customer").length;
            const sarafCount = users.filter(u => u.role === "saraf").length;
            
            setStats({
                total: users.length,
                staff: staffCount,
                customers: customerCount,
                saraf: sarafCount
            });
        } catch (error) {
            console.error("Failed to fetch user stats:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
                return;
            }
            setToast({
                message: t('toast.failedToLoad'),
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToast({
            message: t('toast.logoutSuccess'),
            type: "success"
        });
        setTimeout(() => {
            navigate("/login", { replace: true });
        }, 1500);
    };

    // Navigate to accounts page with filter
    const navigateToAccounts = (role = "all") => {
        console.log("Navigating to accounts with role:", role);
        navigate("accounts", { 
            state: { filterRole: role },
            replace: false
        });
    };

    // Get the correct arrow icon based on RTL
    const ArrowIcon = isRtl ? FaArrowLeft : FaArrowRight;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="text-xl text-gray-600">{t('common.loading')}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6" dir={document.documentElement.dir}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="mx-auto max-w-6xl">
                {/* Header with Logout */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {t('dashboard.title')}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {t('dashboard.welcome', { name: user?.name || t('common.user') })}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors"
                    >
                        <FaSignOutAlt className="w-4 h-4" />
                        {t('navigation.logout')}
                    </button>
                </div>

                {/* Quick Stats Cards - Clickable */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Total Users Card */}
                    <div 
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
                        onClick={() => navigateToAccounts("all")}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FaUsers className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{t('dashboard.totalUsers')}</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                            <span>{t('dashboard.viewAll')}</span>
                            <ArrowIcon className="w-3 h-3" />
                        </p>
                    </div>

                    {/* Staff Card */}
                    <div 
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
                        onClick={() => navigateToAccounts("staff")}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FaUser className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{t('dashboard.staff')}</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{stats.staff}</p>
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                            <span>{t('dashboard.viewStaff')}</span>
                            <ArrowIcon className="w-3 h-3" />
                        </p>
                    </div>

                    {/* Customers Card */}
                    <div 
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-green-500"
                        onClick={() => navigateToAccounts("customer")}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-green-100 p-3 rounded-full">
                                <FaUserFriends className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{t('dashboard.customers')}</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">{stats.customers}</p>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <span>{t('dashboard.viewCustomers')}</span>
                            <ArrowIcon className="w-3 h-3" />
                        </p>
                    </div>

                    {/* Saraf Card */}
                    <div 
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-yellow-500"
                        onClick={() => navigateToAccounts("saraf")}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <FaUserTag className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{t('dashboard.saraf')}</p>
                        <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.saraf}</p>
                        <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                            <span>{t('dashboard.viewSaraf')}</span>
                            <ArrowIcon className="w-3 h-3" />
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">{t('dashboard.manageStaff')}</h3>
                        <p className="text-blue-100 text-sm mb-4">{t('dashboard.manageStaffDesc')}</p>
                        <button 
                            onClick={() => navigateToAccounts("staff")}
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                        >
                            {t('dashboard.viewStaff')}
                        </button>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">{t('dashboard.customerManagement')}</h3>
                        <p className="text-green-100 text-sm mb-4">{t('dashboard.customerManagementDesc')}</p>
                        <button 
                            onClick={() => navigateToAccounts("customer")}
                            className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                        >
                            {t('dashboard.viewCustomers')}
                        </button>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">{t('dashboard.sarafManagement')}</h3>
                        <p className="text-yellow-100 text-sm mb-4">{t('dashboard.sarafManagementDesc')}</p>
                        <button 
                            onClick={() => navigateToAccounts("saraf")}
                            className="bg-white text-yellow-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors"
                        >
                            {t('dashboard.viewSaraf')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}