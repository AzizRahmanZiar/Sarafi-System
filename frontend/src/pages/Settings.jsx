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
    FaUser
} from "react-icons/fa";

export default function Settings() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [staffUsers, setStaffUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [permissions, setPermissions] = useState({
        create_customer: false,
        create_saraf: false
    });
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchStaffUsers();
    }, []);

    const fetchStaffUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/users");
            const staff = response.data.users.filter(user => user.role === 'staff');
            setStaffUsers(staff);
            
            if (staff.length > 0) {
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
            
            const updatedStaff = staffUsers.find(s => s.id === selectedStaff.id);
            if (updatedStaff) {
                setSelectedStaff(updatedStaff);
                setPermissions({
                    create_customer: updatedStaff.permissions?.includes('create_customer') || false,
                    create_saraf: updatedStaff.permissions?.includes('create_saraf') || false
                });
            }
        } catch (error) {
            setToast({
                message: error.response?.data?.message || t('toast.somethingWentWrong'),
                type: "error"
            });
            console.error(error);
        } finally {
            setSaving(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64" dir={document.documentElement.dir}>
                <div className="text-center">
                    <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                    <div className="text-xl text-gray-600">{t('common.loading')}</div>
                </div>
            </div>
        );
    }

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
                    <span className="text-sm text-gray-500 ml-2">
                        ({t('settings.permissionCount', { count: staffUsers.length })})
                    </span>
                </div>
            </div>

            {staffUsers.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{t('settings.noStaffFound')}</p>
                    <p className="text-sm text-gray-400 mt-1">{t('settings.createStaffFirst')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Staff List with Search */}
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

                    {/* Permissions Editor */}
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
                                        {/* Create Customer Permission */}
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

                                        {/* Create Saraf Permission */}
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

                                    {/* Summary of permissions */}
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
            )}
        </div>
    );
}