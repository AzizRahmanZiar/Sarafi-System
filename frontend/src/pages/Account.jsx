// pages/Account.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Table from "../components/table/Table";
import TableHead from "../components/table/TableHead";
import TableBody from "../components/table/TableBody";
import TableRow from "../components/table/TableRow";
import TableHeader from "../components/table/TableHeader";
import TableCell from "../components/table/TableCell";
import TableBadge from "../components/table/TableBadge";
import Form from "../components/form/Form";
import Input from "../components/form/Input";
import Label from "../components/form/Label";
import Select from "../components/form/Select";
import Button from "../components/form/Button";
import Toast from "../components/Toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import api from "../services/api";
import { 
    FaUserPlus, 
    FaUsers, 
    FaUserTie, 
    FaUser, 
    FaUserTag,
    FaUserFriends,
    FaEdit,
    FaTrash
} from "react-icons/fa";

export default function Account({ initialFilter = null }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(initialFilter || "all");
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [toast, setToast] = useState(null);
    
    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        userId: null,
        userName: ""
    });

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "staff",
    });

    const [formErrors, setFormErrors] = useState({});
    const [formLoading, setFormLoading] = useState(false);

    // Get current user data
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    // Check permissions
    const canCreateStaff = userData?.role === 'admin'; // Only admin can create staff
    const canCreateCustomer = userData?.role === 'admin' || userData?.permissions?.includes('create_customer');
    const canCreateSaraf = userData?.role === 'admin' || userData?.permissions?.includes('create_saraf');
    const canEditDelete = userData?.role === 'admin'; // Only admin can edit/delete

    // Handle filter from navigation state
    useEffect(() => {
        if (location.state?.filterRole) {
            setSelectedRole(location.state.filterRole);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/users");
            setUsers(response.data.users);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            if (error.response?.status === 401) {
                navigate("/login");
            }
            setToast({
                message: t('toast.failedToLoad'),
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleRoleChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            role: value,
            password: value !== "staff" ? "" : prev.password,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormErrors({});
        setToast(null);

        try {
            let endpoint = "/create-staff";
            
            // Check permissions before submitting
            if (formData.role === "staff" && !canCreateStaff) {
                setToast({
                    message: t('toast.noCreatePermission', { role: t('common.staff') }),
                    type: "error"
                });
                setFormLoading(false);
                return;
            }
            
            if (formData.role === "customer" && !canCreateCustomer) {
                setToast({
                    message: t('toast.noCreatePermission', { role: t('common.customer') }),
                    type: "error"
                });
                setFormLoading(false);
                return;
            }
            
            if (formData.role === "saraf" && !canCreateSaraf) {
                setToast({
                    message: t('toast.noCreatePermission', { role: t('common.saraf') }),
                    type: "error"
                });
                setFormLoading(false);
                return;
            }

            if (formData.role === "customer") {
                endpoint = "/create-customer";
            } else if (formData.role === "saraf") {
                endpoint = "/create-saraf";
            }

            const payload = { ...formData };
            if (formData.role === "customer" || formData.role === "saraf") {
                delete payload.password;
            }

            const response = await api.post(endpoint, payload);

            const roleDisplay = formData.role === 'staff' ? t('common.staff') : 
                               formData.role === 'customer' ? t('common.customer') : 
                               t('common.saraf');

            setToast({
                message: t('toast.userCreated', { role: roleDisplay }),
                type: "success"
            });

            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                role: "staff",
            });
            setShowForm(false);
            fetchUsers();

        } catch (error) {
            if (error.response?.status === 422) {
                setFormErrors(error.response.data.errors || {});
                setToast({
                    message: t('toast.pleaseCheckInput'),
                    type: "error"
                });
            } else if (error.response?.status === 403) {
                setToast({
                    message: error.response.data.message || t('toast.unauthorized'),
                    type: "error"
                });
            } else {
                setToast({
                    message: t('toast.somethingWentWrong'),
                    type: "error"
                });
                console.error(error);
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = (user) => {
        if (!canEditDelete) {
            setToast({
                message: t('toast.noEditPermission'),
                type: "error"
            });
            return;
        }
        
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            password: "",
            role: user.role,
        });
        setShowForm(true);
    };

    const openDeleteModal = (userId, userName) => {
        if (!canEditDelete) {
            setToast({
                message: t('toast.noDeletePermission'),
                type: "error"
            });
            return;
        }
        
        setDeleteModal({
            isOpen: true,
            userId: userId,
            userName: userName
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            userId: null,
            userName: ""
        });
    };

    const handleConfirmDelete = async () => {
        const { userId, userName } = deleteModal;
        
        try {
            await api.delete(`/users/${userId}`);
            setToast({
                message: t('toast.userDeleted', { name: userName }),
                type: "success"
            });
            closeDeleteModal();
            fetchUsers();
        } catch (error) {
            setToast({
                message: error.response?.data?.message || t('toast.somethingWentWrong'),
                type: "error"
            });
            console.error(error);
            closeDeleteModal();
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormErrors({});
        setToast(null);

        try {
            const payload = { ...formData };
            if (formData.role === "customer" || formData.role === "saraf") {
                delete payload.password;
            }

            const response = await api.put(`/users/${editingUser.id}`, payload);

            setToast({
                message: response.data.message || t('toast.userUpdated'),
                type: "success"
            });

            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                role: "staff",
            });
            setEditingUser(null);
            setShowForm(false);
            fetchUsers();

        } catch (error) {
            if (error.response?.status === 422) {
                setFormErrors(error.response.data.errors || {});
                setToast({
                    message: t('toast.pleaseCheckInput'),
                    type: "error"
                });
            } else if (error.response?.status === 403) {
                setToast({
                    message: error.response.data.message || t('toast.unauthorized'),
                    type: "error"
                });
            } else {
                setToast({
                    message: t('toast.somethingWentWrong'),
                    type: "error"
                });
                console.error(error);
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingUser(null);
        setFormData({
            name: "",
            email: "",
            phone: "",
            password: "",
            role: "staff",
        });
        setFormErrors({});
    };

    // Filter users by role
    const filteredUsers = selectedRole === "all"
        ? users
        : users.filter(user => user.role === selectedRole);

    const getRoleCount = (role) => {
        return users.filter(user => user.role === role).length;
    };

    // Get role icon
    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': 
                return <FaUserTie className="w-4 h-4" />;
            case 'staff': 
                return <FaUser className="w-4 h-4" />;
            case 'customer': 
                return <FaUserFriends className="w-4 h-4" />;
            case 'saraf': 
                return <FaUserTag className="w-4 h-4" />;
            default: 
                return <FaUser className="w-4 h-4" />;
        }
    };

    // Handle card click to filter users
    const handleCardClick = (role) => {
        setSelectedRole(role);
        document.getElementById('user-table')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Get role display name
    const getRoleDisplay = (role) => {
        switch (role) {
            case 'admin': return t('common.admin');
            case 'staff': return t('common.staff');
            case 'customer': return t('common.customer');
            case 'saraf': return t('common.saraf');
            default: return role;
        }
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

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                userName={deleteModal.userName}
            />

            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('accounts.title')}</h1>
                    <p className="text-gray-500">{t('accounts.description')}</p>
                </div>
                {(canCreateStaff || canCreateCustomer || canCreateSaraf) && (
                    <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                        <FaUserPlus className="w-4 h-4 mr-2" />
                        {t('accounts.addNewUser')}
                    </Button>
                )}
            </div>

            {/* Stats Cards - Clickable */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div 
                    className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-blue-500"
                    onClick={() => handleCardClick("all")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{t('dashboard.totalUsers')}</p>
                            <p className="text-2xl font-bold">{users.length}</p>
                        </div>
                        <FaUsers className="w-8 h-8 text-blue-500 opacity-20" />
                    </div>
                    {selectedRole === "all" && (
                        <div className="mt-2 h-1 bg-blue-500 rounded-full"></div>
                    )}
                </div>
                
                <div 
                    className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-blue-500"
                    onClick={() => handleCardClick("staff")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{t('dashboard.staff')}</p>
                            <p className="text-2xl font-bold text-blue-600">{getRoleCount('staff')}</p>
                        </div>
                        <FaUser className="w-8 h-8 text-blue-500 opacity-20" />
                    </div>
                    {selectedRole === "staff" && (
                        <div className="mt-2 h-1 bg-blue-600 rounded-full"></div>
                    )}
                </div>
                
                <div 
                    className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-green-500"
                    onClick={() => handleCardClick("customer")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{t('dashboard.customers')}</p>
                            <p className="text-2xl font-bold text-green-600">{getRoleCount('customer')}</p>
                        </div>
                        <FaUserFriends className="w-8 h-8 text-green-500 opacity-20" />
                    </div>
                    {selectedRole === "customer" && (
                        <div className="mt-2 h-1 bg-green-600 rounded-full"></div>
                    )}
                </div>
                
                <div 
                    className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-yellow-500"
                    onClick={() => handleCardClick("saraf")}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{t('dashboard.saraf')}</p>
                            <p className="text-2xl font-bold text-yellow-600">{getRoleCount('saraf')}</p>
                        </div>
                        <FaUserTag className="w-8 h-8 text-yellow-500 opacity-20" />
                    </div>
                    {selectedRole === "saraf" && (
                        <div className="mt-2 h-1 bg-yellow-600 rounded-full"></div>
                    )}
                </div>
            </div>

            {/* Create/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                {editingUser ? (
                                    <>
                                        <FaUsers className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-xl font-bold">{t('accounts.editUser')}</h2>
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-xl font-bold">{t('accounts.createNewUser')}</h2>
                                    </>
                                )}
                            </div>

                            <Form
                                onSubmit={editingUser ? handleUpdate : handleSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="name" required>{t('accounts.fullName')}</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder={t('register.enterFullName')}
                                        value={formData.name}
                                        onChange={handleChange}
                                        error={formErrors.name?.[0]}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email" required>{t('accounts.email')}</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder={t('register.enterEmail')}
                                        value={formData.email}
                                        onChange={handleChange}
                                        error={formErrors.email?.[0]}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">{t('accounts.phone')}</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        placeholder={t('register.enterPhone')}
                                        value={formData.phone}
                                        onChange={handleChange}
                                        error={formErrors.phone?.[0]}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="role" required>{t('accounts.role')}</Label>
                                    <Select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleRoleChange}
                                        error={formErrors.role?.[0]}
                                    >
                                        {canCreateStaff && <option value="staff">{t('common.staff')}</option>}
                                        {canCreateCustomer && <option value="customer">{t('common.customer')}</option>}
                                        {canCreateSaraf && <option value="saraf">{t('common.saraf')}</option>}
                                    </Select>
                                    {!canCreateStaff && !canCreateCustomer && !canCreateSaraf && (
                                        <p className="mt-1 text-sm text-yellow-600">
                                            {t('toast.noCreatePermission', { role: t('common.user') })}
                                        </p>
                                    )}
                                </div>

                                {formData.role === "staff" && (
                                    <div>
                                        <Label htmlFor="password" required={!editingUser}>
                                            {editingUser ? t('accounts.newPassword') : t('accounts.password')}
                                        </Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder={editingUser ? t('accounts.enterNewPassword') : t('accounts.enterPassword')}
                                            value={formData.password}
                                            onChange={handleChange}
                                            error={formErrors.password?.[0]}
                                        />
                                    </div>
                                )}

                                {formData.role !== "staff" && (
                                    <p className="text-sm text-gray-500 italic">
                                        {t('accounts.noteNoLogin', { role: getRoleDisplay(formData.role) })}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={formLoading}
                                    >
                                        {formLoading ? t('accounts.saving') : 
                                         editingUser ? t('accounts.updateUser') : t('accounts.createUser')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleCancel}
                                    >
                                        {t('accounts.cancel')}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div id="user-table" className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FaUsers className="w-5 h-5 text-gray-500" />
                        <h2 className="text-lg font-semibold">
                            {selectedRole === "all" 
                                ? t('accounts.allUsers') 
                                : `${getRoleDisplay(selectedRole)}s`}
                            {selectedRole !== "all" && (
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({t('accounts.usersCount', { count: filteredUsers.length })})
                                </span>
                            )}
                        </h2>
                    </div>
                    <Select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-40"
                    >
                        <option value="all">{t('accounts.allUsers')}</option>
                        <option value="admin">{t('common.admin')}</option>
                        <option value="staff">{t('common.staff')}</option>
                        <option value="customer">{t('common.customer')}</option>
                        <option value="saraf">{t('common.saraf')}</option>
                    </Select>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {t('accounts.noUsers')}
                    </div>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>{t('table.name')}</TableHeader>
                                <TableHeader>{t('table.email')}</TableHeader>
                                <TableHeader>{t('table.phone')}</TableHeader>
                                <TableHeader>{t('table.role')}</TableHeader>
                                <TableHeader>{t('table.permissions')}</TableHeader>
                                <TableHeader>{t('table.createdBy')}</TableHeader>
                                <TableHeader className="text-right">{t('table.actions')}</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(user.role)}
                                            {user.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone || "-"}</TableCell>
                                    <TableCell>
                                        <TableBadge role={user.role} />
                                    </TableCell>
                                    <TableCell>
                                        {user.role === 'staff' ? (
                                            user.permissions && user.permissions.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.permissions.map(perm => (
                                                        <span key={perm} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                            {t(`permissions.${perm}`, perm.replace('_', ' '))}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">{t('common.none')}</span>
                                            )
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.creator ? user.creator.name : t('common.self')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {canEditDelete && user.id !== userData?.id && (
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title={t('common.edit')}
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                            )}
                                            {canEditDelete && user.id !== userData?.id && (
                                                <button
                                                    onClick={() => openDeleteModal(user.id, user.name)}
                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                    title={t('common.delete')}
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            )}
                                            {(!canEditDelete || user.id === userData?.id) && (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}