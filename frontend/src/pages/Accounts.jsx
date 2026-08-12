// src/pages/Accounts.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Import components
import { Button, Input, Select, Form, Modal, ViewModal, DeleteModal } from '../components/common';

// Import hooks
import { useCrud } from '../hooks';

// Import utils
import { ROLES, ROLE_COLORS, ROLE_LABELS } from '../utils';

const Accounts = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === ROLES.ADMIN;
    
    // Use CRUD hook
    const { items: users, loading, error, fetchItems, createItem, deleteItem } = useCrud('/company-users');
    
    // State
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [successMessage, setSuccessMessage] = useState('');
    const [viewModal, setViewModal] = useState({ isOpen: false, user: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: '',
        role: ROLES.CUSTOMER,
    });

    // Fetch users on mount
    useEffect(() => {
        fetchItems();
    }, []);

    // Show success message
    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    // Handle user creation
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        try {
            // Determine endpoint based on role
            const endpoints = {
                [ROLES.STAFF]: '/create-staff',
                [ROLES.CUSTOMER]: '/create-customer',
                [ROLES.SARAF]: '/create-saraf',
            };

            const endpoint = endpoints[formData.role] || '/create-customer';
            
            // Build payload
            let payload = {};
            
            if (formData.role === ROLES.STAFF) {
                payload = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: 'staff',
                };
            } else {
                payload = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || '',
                    address: formData.address || '',
                };
            }

            const result = await createItem(payload, endpoint);
            
            if (result) {
                setShowModal(false);
                resetForm();
                showSuccess(`${formData.role} created successfully!`);
                await fetchItems();
            }
        } catch (err) {
            console.error('Error creating user:', err);
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                setFormErrors({ general: err.response?.data?.message || 'Failed to create user' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            phone: '',
            address: '',
            role: ROLES.CUSTOMER,
        });
        setFormErrors({});
    };

    // Handle delete
    const handleDeleteUser = async () => {
        try {
            await deleteItem(deleteModal.userId);
            showSuccess('User deleted successfully!');
            setDeleteModal({ isOpen: false, userId: null, userName: '' });
            await fetchItems();
        } catch (error) {
            alert(error.message || 'Failed to delete user');
        }
    };

    // Navigate to user account
    const handleRowClick = (user) => {
        navigate(`/dashboard/accounts/${user.id}`);
    };

    // Role options
    const roleOptions = [
        { value: ROLES.STAFF, label: 'Staff' },
        { value: ROLES.CUSTOMER, label: 'Customer' },
        { value: ROLES.SARAF, label: 'Saraf' },
    ];

    // Filter users
    const filteredUsers = users.filter(u => {
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });

    // Table columns
    const columns = [
        { 
            key: 'name', 
            header: 'User',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        row.role === ROLES.ADMIN
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                    }`}>
                        {row.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{row.name}</span>
                </div>
            )
        },
        { key: 'email', header: 'Email' },
        { 
            key: 'role', 
            header: 'Role',
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[row.role]}`}>
                    {ROLE_LABELS[row.role] || row.role}
                </span>
            )
        },
        {
            key: 'can_login',
            header: 'Login Access',
            render: (row) => (
                row.can_login ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        Can Login
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        No Login
                    </span>
                )
            )
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    row.is_active !== false
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                    {row.is_active !== false ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setViewModal({ isOpen: true, user: row }); }}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/accounts/${row.id}`); }}
                                className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            {row.role !== ROLES.ADMIN && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteModal({
                                            isOpen: true,
                                            userId: row.id,
                                            userName: row.name,
                                        });
                                    }}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            )
        }
    ];

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {isAdmin ? 'Manage all user accounts' : 'View and manage customers & saraf'}
                    </p>
                    <p className="text-xs text-primary-500 dark:text-primary-400 mt-1">
                        💡 Click on any user to view their account details
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={fetchItems} loading={loading} icon={RefreshCw}>
                        Refresh
                    </Button>
                    <Button onClick={() => setShowModal(true)} icon={Plus}>
                        Create Account
                    </Button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                    <span className="text-2xl">✅</span>
                    <span className="flex-1">{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} className="text-sm hover:underline">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
                <Button
                    variant={filterRole === 'all' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setFilterRole('all')}
                >
                    All Users ({users.length})
                </Button>
                {roleOptions.map((role) => (
                    <Button
                        key={role.value}
                        variant={filterRole === role.value ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setFilterRole(role.value)}
                    >
                        {role.label} ({users.filter(u => u.role === role.value).length})
                    </Button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr 
                                        key={user.id} 
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                        onClick={() => handleRowClick(user)}
                                    >
                                        {columns.map((col, idx) => (
                                            <td key={idx} className="px-4 py-3">
                                                {col.render ? col.render(user) : user[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Account">
                <Form onSubmit={handleCreateUser} error={formErrors.general}>
                    <Select
                        label="Account Type"
                        name="role"
                        value={formData.role}
                        onChange={(e) => {
                            setFormData({ ...formData, role: e.target.value });
                            if (e.target.value !== ROLES.STAFF) {
                                setFormData(prev => ({
                                    ...prev,
                                    password: '',
                                    password_confirmation: '',
                                }));
                            }
                        }}
                        options={roleOptions}
                        required
                    />

                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={formErrors.name?.[0]}
                        placeholder="Enter full name"
                        required
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={formErrors.email?.[0]}
                        placeholder="Enter email address"
                        required
                    />

                    <Input
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        error={formErrors.phone?.[0]}
                        placeholder="Enter phone number"
                    />

                    <Input
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        error={formErrors.address?.[0]}
                        placeholder="Enter address"
                    />

                    {formData.role === ROLES.STAFF && (
                        <>
                            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Password required for Staff accounts
                            </p>
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={formErrors.password?.[0]}
                                placeholder="••••••••"
                                required
                                minLength="6"
                            />
                            <Input
                                label="Confirm Password"
                                name="password_confirmation"
                                type="password"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                error={formErrors.password_confirmation?.[0]}
                                placeholder="••••••••"
                                required
                            />
                        </>
                    )}

                    {formData.role !== ROLES.STAFF && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                            Password will be auto-generated for {formData.role} accounts.
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" loading={submitting} className="flex-1">
                            Create Account
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* View User Modal */}
            <ViewModal
                isOpen={viewModal.isOpen}
                onClose={() => setViewModal({ isOpen: false, user: null })}
                title="User Details"
                data={viewModal.user}
                fields={[
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'address', label: 'Address' },
                    { key: 'role', label: 'Role', type: 'badge', badgeClass: (value) => ROLE_COLORS[value] || '' },
                    { key: 'created_at', label: 'Joined', type: 'date' },
                    { key: 'can_login', label: 'Login Access', type: 'boolean' },
                    { key: 'is_active', label: 'Status', type: 'badge', badgeClass: (value) => value !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700' },
                ]}
            />

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
                onDelete={handleDeleteUser}
                itemName={deleteModal.userName}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                loading={loading}
            />
        </div>
    );
};

export default Accounts;