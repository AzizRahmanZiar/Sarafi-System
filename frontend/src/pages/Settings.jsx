// pages/Settings.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Toast from "../components/Toast";
import api from "../services/api";
import { 
    FaUsers, 
    FaUserCheck, 
    FaUserTimes,
    FaShieldAlt,
    FaSave,
    FaUserCog,
    FaSpinner,
    FaCheckCircle,
    FaTimesCircle,
    FaUser,
    FaMoneyBillWave,
    FaPlus,
    FaEdit,
    FaTrash,
    FaStar,
    FaRegStar,
    FaExchangeAlt,
    FaDollarSign,
    FaEuroSign,
    FaPoundSign,
    FaYenSign,
    FaBitcoin,
    FaPlusCircle,
    FaMinusCircle
} from "react-icons/fa";

export default function Settings() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('permissions');
    const [staffUsers, setStaffUsers] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [permissions, setPermissions] = useState({
        create_customer: false,
        create_saraf: false
    });
    const [searchTerm, setSearchTerm] = useState("");
    
    // Currency state
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState(null);
    const [currencyForm, setCurrencyForm] = useState({
        name: '',
        code: '',
        symbol: '',
        rate: '',
        is_default: false,
        rates: []
    });
    const [currencyLoading, setCurrencyLoading] = useState(false);

    useEffect(() => {
        fetchStaffUsers();
        fetchCurrencies();
    }, []);

    const fetchStaffUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/users");
            const staff = response.data.users.filter(user => user.role === 'staff');
            setStaffUsers(staff);
            
            if (staff.length > 0 && activeTab === 'permissions') {
                setSelectedStaff(staff[0]);
                setPermissions({
                    create_customer: staff[0].permissions?.includes('create_customer') || false,
                    create_saraf: staff[0].permissions?.includes('create_saraf') || false
                });
            }
        } catch (error) {
            console.error("Failed to fetch staff:", error);
            if (error.response?.status === 401) {
                navigate("/login");
            }
            setToast({
                message: t('toast.failedToLoadStaff'),
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrencies = async () => {
        try {
            const response = await api.get("/currencies");
            setCurrencies(response.data.currencies || []);
        } catch (error) {
            console.error("Failed to fetch currencies:", error);
            setToast({
                message: t('settings.currency.failedToLoad') || "Failed to load currencies",
                type: "error"
            });
        }
    };

    const handleStaffSelect = (staff) => {
        setSelectedStaff(staff);
        setPermissions({
            create_customer: staff.permissions?.includes('create_customer') || false,
            create_saraf: staff.permissions?.includes('create_saraf') || false
        });
    };

    const handlePermissionChange = (permission) => {
        setPermissions(prev => ({
            ...prev,
            [permission]: !prev[permission]
        }));
    };

    const handleSavePermissions = async () => {
        if (!selectedStaff) return;

        setSaving(true);
        try {
            const permissionList = [];
            if (permissions.create_customer) permissionList.push('create_customer');
            if (permissions.create_saraf) permissionList.push('create_saraf');

            await api.put(`/users/${selectedStaff.id}/permissions`, {
                permissions: permissionList
            });

            setToast({
                message: t('toast.permissionsUpdated', { name: selectedStaff.name }),
                type: "success"
            });

            await fetchStaffUsers();
        } catch (error) {
            console.error("Error saving permissions:", error);
            setToast({
                message: error.response?.data?.message || t('toast.somethingWentWrong'),
                type: "error"
            });
        } finally {
            setSaving(false);
        }
    };

    // Currency CRUD operations
    const handleOpenCurrencyModal = (currency = null) => {
        if (currency) {
            let ratesArray = [];
            if (currency.rates) {
                if (Array.isArray(currency.rates)) {
                    ratesArray = currency.rates;
                } else if (typeof currency.rates === 'object') {
                    ratesArray = Object.entries(currency.rates).map(([key, value]) => ({
                        currency: key,
                        rate: value
                    }));
                }
            }
            
            setEditingCurrency(currency);
            setCurrencyForm({
                name: currency.name,
                code: currency.code,
                symbol: currency.symbol || '',
                rate: currency.rate || '',
                is_default: currency.is_default,
                rates: ratesArray
            });
        } else {
            setEditingCurrency(null);
            setCurrencyForm({
                name: '',
                code: '',
                symbol: '',
                rate: '',
                is_default: currencies.length === 0,
                rates: []
            });
        }
        setShowCurrencyModal(true);
    };

    const handleCloseCurrencyModal = () => {
        setShowCurrencyModal(false);
        setEditingCurrency(null);
        setCurrencyForm({
            name: '',
            code: '',
            symbol: '',
            rate: '',
            is_default: false,
            rates: []
        });
    };

    const handleAddRate = () => {
        setCurrencyForm(prev => ({
            ...prev,
            rates: [...prev.rates, { currency: '', rate: '' }]
        }));
    };

    const handleRemoveRate = (index) => {
        setCurrencyForm(prev => ({
            ...prev,
            rates: prev.rates.filter((_, i) => i !== index)
        }));
    };

    const handleRateChange = (index, field, value) => {
        setCurrencyForm(prev => {
            const newRates = [...prev.rates];
            newRates[index] = { ...newRates[index], [field]: value };
            return { ...prev, rates: newRates };
        });
    };

    const handleCurrencySubmit = async (e) => {
        e.preventDefault();
        setCurrencyLoading(true);

        try {
            const ratesData = currencyForm.rates
                .filter(r => r.currency && r.rate)
                .map(r => ({
                    currency: r.currency.toUpperCase(),
                    rate: parseFloat(r.rate)
                }));

            const data = {
                name: currencyForm.name,
                code: currencyForm.code.toUpperCase(),
                symbol: currencyForm.symbol || null,
                rate: parseFloat(currencyForm.rate) || 1,
                is_default: currencyForm.is_default,
                rates: ratesData
            };

            console.log("Sending data:", data);

            let response;
            if (editingCurrency) {
                response = await api.put(`/currencies/${editingCurrency.id}`, data);
                setToast({
                    message: t('settings.currency.updatedSuccess') || "Currency updated successfully!",
                    type: "success"
                });
            } else {
                response = await api.post("/currencies", data);
                setToast({
                    message: t('settings.currency.createdSuccess') || "Currency created successfully!",
                    type: "success"
                });
            }

            console.log("Response:", response.data);

            await fetchCurrencies();
            handleCloseCurrencyModal();
        } catch (error) {
            console.error("Error saving currency:", error);
            console.error("Error response:", error.response?.data);
            
            let errorMessage = t('settings.currency.failedToCreate') || "Failed to save currency";
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                errorMessage = errors.join(', ');
            }
            
            setToast({
                message: errorMessage,
                type: "error"
            });
        } finally {
            setCurrencyLoading(false);
        }
    };

    const handleDeleteCurrency = async (currency) => {
        if (!window.confirm(t('settings.currency.deleteConfirm', { name: currency.name }))) return;

        try {
            await api.delete(`/currencies/${currency.id}`);
            await fetchCurrencies();
            setToast({
                message: t('settings.currency.deletedSuccess') || "Currency deleted successfully!",
                type: "success"
            });
        } catch (error) {
            console.error("Error deleting currency:", error);
            setToast({
                message: error.response?.data?.message || t('settings.currency.failedToDelete') || "Failed to delete currency",
                type: "error"
            });
        }
    };

    const handleSetDefaultCurrency = async (currency) => {
        try {
            await api.patch(`/currencies/${currency.id}/default`);
            await fetchCurrencies();
            setToast({
                message: t('settings.currency.defaultUpdated') || "Default currency updated!",
                type: "success"
            });
        } catch (error) {
            console.error("Error setting default currency:", error);
            setToast({
                message: error.response?.data?.message || "Failed to set default currency",
                type: "error"
            });
        }
    };

    const getPermissionStatus = (staff, permission) => {
        return staff.permissions?.includes(permission) || false;
    };

    const filteredStaff = staffUsers.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPermissionDescription = (staff) => {
        const hasCustomer = getPermissionStatus(staff, 'create_customer');
        const hasSaraf = getPermissionStatus(staff, 'create_saraf');
        
        if (hasCustomer && hasSaraf) return t('settings.fullPermissions');
        if (hasCustomer) return t('settings.customerOnly');
        if (hasSaraf) return t('settings.sarafOnly');
        return t('settings.noPermissionsSet');
    };

    const getDefaultCurrency = () => {
        return currencies.find(c => c.is_default);
    };

    const getCurrencyIcon = (code) => {
        const icons = {
            'USD': '💵',
            'EUR': '💶',
            'GBP': '💷',
            'JPY': '💴',
            'CNY': '💰',
            'AFN': '🇦🇫',
            'AFG': '🇦🇫',
            'PKR': '🇵🇰',
            'INR': '🇮🇳',
            'AED': '🇦🇪',
            'SAR': '🇸🇦',
            'IRR': '🇮🇷',
            'TRY': '🇹🇷',
            'CAD': '🇨🇦',
            'AUD': '🇦🇺',
            'CHF': '🇨🇭',
            'RUB': '🇷🇺',
            'BRL': '🇧🇷',
            'KRW': '🇰🇷',
            'SGD': '🇸🇬',
            'MYR': '🇲🇾',
        };
        return icons[code] || '💱';
    };

    // Render Permissions Tab
    const renderPermissionsTab = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                        <div className="text-xl text-gray-600">{t('common.loading')}</div>
                    </div>
                </div>
            );
        }

        if (staffUsers.length === 0) {
            return (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{t('settings.noStaffFound')}</p>
                    <p className="text-sm text-gray-400 mt-1">{t('settings.createStaffFirst')}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow lg:col-span-1">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                            <FaUsers className="w-4 h-4" />
                            {t('settings.staffMembers')} ({staffUsers.length})
                        </h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('settings.searchStaff')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                        {filteredStaff.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                {t('settings.noStaffFound')}
                            </div>
                        ) : (
                            filteredStaff.map((staff) => {
                                const hasPermissions = staff.permissions && staff.permissions.length > 0;
                                const hasCustomerPerm = getPermissionStatus(staff, 'create_customer');
                                const hasSarafPerm = getPermissionStatus(staff, 'create_saraf');
                                
                                return (
                                    <button
                                        key={staff.id}
                                        onClick={() => handleStaffSelect(staff)}
                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                            selectedStaff?.id === staff.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm flex-shrink-0">
                                                {staff.name ? staff.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "S"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{staff.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{staff.email}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {hasPermissions ? (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <FaCheckCircle className="w-3 h-3" />
                                                        {t('settings.permissionCount', { count: staff.permissions.length })}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <FaTimesCircle className="w-3 h-3" />
                                                        {t('settings.nonePermissions')}
                                                    </span>
                                                )}
                                                <div className="flex gap-1">
                                                    {hasCustomerPerm && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">C</span>
                                                    )}
                                                    {hasSarafPerm && (
                                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">S</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow lg:col-span-2">
                    {selectedStaff ? (
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-semibold">
                                    {selectedStaff.name ? selectedStaff.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "S"}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-800">{selectedStaff.name}</h2>
                                    <p className="text-sm text-gray-500">{selectedStaff.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{t('common.staff')}</span>
                                        <span className="text-xs text-gray-400">|</span>
                                        <span className="text-xs text-gray-500">
                                            {t('settings.created', { date: selectedStaff.created_at ? new Date(selectedStaff.created_at).toLocaleDateString() : 'N/A' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">{t('settings.permissionStatus')}</div>
                                    {(selectedStaff.permissions && selectedStaff.permissions.length > 0) ? (
                                        <span className="text-sm text-green-600 font-medium flex items-center gap-1 justify-end">
                                            <FaCheckCircle className="w-4 h-4" />
                                            {t('settings.activePermissions', { count: selectedStaff.permissions.length })}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-400 font-medium flex items-center gap-1 justify-end">
                                            <FaTimesCircle className="w-4 h-4" />
                                            {t('settings.nonePermissions')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">{t('settings.managePermissions')}</h3>
                                
                                <div className="space-y-4">
                                    <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                                        permissions.create_customer ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                                    }`}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FaUserCheck className={`w-4 h-4 ${permissions.create_customer ? 'text-green-600' : 'text-gray-400'}`} />
                                                <span className={`font-medium ${permissions.create_customer ? 'text-gray-800' : 'text-gray-600'}`}>
                                                    {t('settings.createCustomers')}
                                                </span>
                                                {permissions.create_customer && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                        {t('common.active')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {t('settings.createCustomersDesc')}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                                            <input
                                                type="checkbox"
                                                checked={permissions.create_customer}
                                                onChange={() => handlePermissionChange('create_customer')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                                        permissions.create_saraf ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'
                                    }`}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <FaUserCog className={`w-4 h-4 ${permissions.create_saraf ? 'text-yellow-600' : 'text-gray-400'}`} />
                                                <span className={`font-medium ${permissions.create_saraf ? 'text-gray-800' : 'text-gray-600'}`}>
                                                    {t('settings.createSaraf')}
                                                </span>
                                                {permissions.create_saraf && (
                                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                                        {t('common.active')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {t('settings.createSarafDesc')}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                                            <input
                                                type="checkbox"
                                                checked={permissions.create_saraf}
                                                onChange={() => handlePermissionChange('create_saraf')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 text-sm text-blue-700">
                                        <FaShieldAlt className="w-4 h-4" />
                                        <span>
                                            {t('settings.hasPermissions', { 
                                                name: selectedStaff.name, 
                                                permDesc: getPermissionDescription(selectedStaff) 
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        if (selectedStaff) {
                                            setPermissions({
                                                create_customer: selectedStaff.permissions?.includes('create_customer') || false,
                                                create_saraf: selectedStaff.permissions?.includes('create_saraf') || false
                                            });
                                        }
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    {t('settings.reset')}
                                </button>
                                <button
                                    onClick={handleSavePermissions}
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <FaSpinner className="w-4 h-4 animate-spin" />
                                            {t('common.loading')}
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="w-4 h-4" />
                                            {t('settings.savePermissions')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>{t('settings.selectStaff')}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render Currencies Tab
    const renderCurrenciesTab = () => {
        const defaultCurrency = getDefaultCurrency();
        const otherCurrencies = currencies.filter(c => !c.is_default);

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FaMoneyBillWave className="w-5 h-5 text-green-600" />
                            {t('settings.currency.title') || 'نوي أسعار (Currency Rates)'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('settings.currency.exchangeRates') || 'Manage exchange rates for all currencies against multiple currencies.'}
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenCurrencyModal()}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <FaPlus className="w-4 h-4" />
                        {t('settings.currency.addCurrency') || 'Add Currency'}
                    </button>
                </div>

                {/* Default Currency */}
                {defaultCurrency && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center text-2xl text-white">
                                    {getCurrencyIcon(defaultCurrency.code)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-gray-800">{defaultCurrency.name}</h3>
                                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                            {t('settings.currency.defaultLabel') || 'محلي نوم (Default)'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm">
                                        <span className="font-mono bg-white px-3 py-1 rounded-lg border border-gray-200 font-bold">
                                            {defaultCurrency.code}
                                        </span>
                                        <span className="text-gray-600">
                                            <span className="font-medium">{t('settings.currency.baseRate') || 'Base Rate:'}</span> 1 {defaultCurrency.code} = 1 {defaultCurrency.code}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleOpenCurrencyModal(defaultCurrency)}
                                className="p-2 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                            >
                                <FaEdit className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Other Currencies */}
                {otherCurrencies.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                <FaExchangeAlt className="w-4 h-4 text-gray-400" />
                                {t('settings.currency.exchangeRates') || 'د اسعارو نرخونه (Exchange Rates)'}
                            </h4>
                            <span className="text-sm text-gray-500">{otherCurrencies.length} currencies</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {otherCurrencies.map((currency) => {
                                const rates = currency.rates || {};
                                const hasRates = Object.keys(rates).length > 0;
                                
                                return (
                                    <div key={currency.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                                                    {getCurrencyIcon(currency.code)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-semibold text-gray-800 text-lg">{currency.name}</span>
                                                        <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                            {currency.code}
                                                        </span>
                                                        {currency.symbol && (
                                                            <span className="text-sm text-gray-500">({currency.symbol})</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                                        {hasRates ? (
                                                            Object.entries(rates).map(([rateCurrency, rateValue]) => (
                                                                <span key={rateCurrency} className="text-sm">
                                                                    <span className="font-medium">1 {currency.code} =</span>
                                                                    <span className="ml-1 font-mono bg-blue-50 px-2 py-0.5 rounded">
                                                                        {parseFloat(rateValue).toFixed(2)} {rateCurrency}
                                                                    </span>
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-gray-400">{t('settings.currency.noRates') || 'No rates configured'}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => handleSetDefaultCurrency(currency)}
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                                                    title={t('settings.currency.setDefault') || "Set as default"}
                                                >
                                                    <FaStar className="w-3.5 h-3.5" />
                                                    {t('settings.currency.setDefault') || 'Set Default'}
                                                </button>
                                                <button
                                                    onClick={() => handleOpenCurrencyModal(currency)}
                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCurrency(currency)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* No Currencies */}
                {currencies.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                        <div className="text-6xl mb-4">💱</div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">{t('settings.currency.title') || 'No currencies added yet'}</h3>
                        <p className="text-gray-500 text-sm mb-4">{t('settings.currency.exchangeRates') || 'Add your first currency to start managing exchange rates.'}</p>
                        <button
                            onClick={() => handleOpenCurrencyModal()}
                            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <FaPlus className="w-4 h-4" />
                            {t('settings.currency.addCurrency') || 'Add Currency'}
                        </button>
                    </div>
                )}

                {/* Currency Modal */}
                {showCurrencyModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {editingCurrency ? t('settings.currency.editCurrency') || 'Edit Currency' : t('settings.currency.addCurrency') || 'Add New Currency'}
                                </h3>
                                <button
                                    onClick={handleCloseCurrencyModal}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FaTimesCircle className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCurrencySubmit} className="p-6 space-y-4">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('settings.currency.currencyName') || 'Currency Name'} *
                                        </label>
                                        <input
                                            type="text"
                                            value={currencyForm.name}
                                            onChange={(e) => setCurrencyForm({...currencyForm, name: e.target.value})}
                                            placeholder={t('settings.currency.namePlaceholder') || "e.g., US Dollar"}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('settings.currency.currencyCode') || 'Currency Code'} *
                                        </label>
                                        <input
                                            type="text"
                                            value={currencyForm.code}
                                            onChange={(e) => setCurrencyForm({...currencyForm, code: e.target.value.toUpperCase()})}
                                            placeholder={t('settings.currency.codePlaceholder') || "e.g., USD"}
                                            maxLength="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                                            required
                                        />
                                        <p className="text-xs text-gray-400 mt-1">3-letter ISO code</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('settings.currency.symbol') || 'Symbol'}
                                    </label>
                                    <input
                                        type="text"
                                        value={currencyForm.symbol}
                                        onChange={(e) => setCurrencyForm({...currencyForm, symbol: e.target.value})}
                                        placeholder={t('settings.currency.symbolPlaceholder') || "e.g., $, €, £, ¥"}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Exchange Rates */}
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {t('settings.currency.rates') || 'Exchange Rates'} (1 {currencyForm.code || 'Currency'} = ?)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddRate}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            <FaPlusCircle className="w-4 h-4" />
                                            {t('settings.currency.addRate') || 'Add Rate'}
                                        </button>
                                    </div>

                                    {currencyForm.rates.map((rate, index) => (
                                        <div key={index} className="flex items-center gap-3 mb-2">
                                            <input
                                                type="text"
                                                value={rate.currency}
                                                onChange={(e) => handleRateChange(index, 'currency', e.target.value.toUpperCase())}
                                                placeholder="e.g., AFG"
                                                maxLength="3"
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-sm"
                                            />
                                            <span className="text-gray-500">=</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={rate.rate}
                                                onChange={(e) => handleRateChange(index, 'rate', e.target.value)}
                                                placeholder={t('settings.currency.ratePlaceholder') || "Rate"}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRate(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <FaMinusCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {currencyForm.rates.length === 0 && (
                                        <p className="text-sm text-gray-400 text-center py-2">
                                            {t('settings.currency.noRates') || 'No rates added. Click "Add Rate" to add exchange rates.'}
                                        </p>
                                    )}
                                </div>

                                {/* Default Currency */}
                                <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        checked={currencyForm.is_default}
                                        onChange={(e) => {
                                            setCurrencyForm({...currencyForm, is_default: e.target.checked});
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_default" className="text-sm font-medium text-gray-700">
                                        {t('settings.currency.defaultLabel') || 'Set as default currency (محلي نوم)'}
                                    </label>
                                </div>

                                <div className="pt-4 border-t border-gray-200 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseCurrencyModal}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        {t('common.cancel') || 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={currencyLoading}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {currencyLoading ? (
                                            <>
                                                <FaSpinner className="w-4 h-4 animate-spin" />
                                                {t('common.loading') || 'Saving...'}
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="w-4 h-4" />
                                                {editingCurrency ? (t('common.update') || 'Update') : (t('common.save') || 'Create')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6" dir={document.documentElement.dir}>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <FaShieldAlt className="w-6 h-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-800">{t('settings.title')}</h1>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('permissions')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                        activeTab === 'permissions'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaUserCog className="w-4 h-4 inline mr-2" />
                    {t('navigation.staffPermissions') || 'Staff Permissions'}
                </button>
                <button
                    onClick={() => setActiveTab('currencies')}
                    className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                        activeTab === 'currencies'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaMoneyBillWave className="w-4 h-4 inline mr-2" />
                    {t('settings.currency.title') || 'Currencies'}
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'permissions' && renderPermissionsTab()}
            {activeTab === 'currencies' && renderCurrenciesTab()}
        </div>
    );
}