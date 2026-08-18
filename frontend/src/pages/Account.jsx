// pages/Account.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
            // Clear the state to prevent re-applying on refresh
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
            // Only redirect to login if it's a 401 error
            if (error.response?.status === 401) {
                navigate("/login");
            }
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
            // Clear password if not staff
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
                    message: "You don't have permission to create staff users.",
                    type: "error"
                });
                setFormLoading(false);
                return;
            }
            
            if (formData.role === "customer" && !canCreateCustomer) {
                setToast({
                    message: "You don't have permission to create customers.",
                    type: "error"
                });
                setFormLoading(false);
                return;
            }
            
            if (formData.role === "saraf" && !canCreateSaraf) {
                setToast({
                    message: "You don't have permission to create saraf users.",
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

            // For customers and saraf, don't send password
            const payload = { ...formData };
            if (formData.role === "customer" || formData.role === "saraf") {
                delete payload.password;
            }

            const response = await api.post(endpoint, payload);

            setToast({
                message: response.data.message || `${formData.role} created successfully!`,
                type: "success"
            });

            // Reset form
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
                    message: "Please check your input and try again.",
                    type: "error"
                });
            } else if (error.response?.status === 403) {
                setToast({
                    message: error.response.data.message || "Unauthorized. You don't have permission to create this user type.",
                    type: "error"
                });
            } else {
                setToast({
                    message: "Something went wrong. Please try again later.",
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
                message: "You don't have permission to edit users.",
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

    // Open delete confirmation modal
    const openDeleteModal = (userId, userName) => {
        if (!canEditDelete) {
            setToast({
                message: "You don't have permission to delete users.",
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

    // Close delete confirmation modal
    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            userId: null,
            userName: ""
        });
    };

    // Handle delete confirmation
    const handleConfirmDelete = async () => {
        const { userId, userName } = deleteModal;
        
        try {
            await api.delete(`/users/${userId}`);
            setToast({
                message: `User "${userName}" deleted successfully!`,
                type: "success"
            });
            closeDeleteModal();
            fetchUsers();
        } catch (error) {
            setToast({
                message: error.response?.data?.message || "Failed to delete user.",
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
                message: response.data.message || "User updated successfully!",
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
                    message: "Please check your input and try again.",
                    type: "error"
                });
            } else if (error.response?.status === 403) {
                setToast({
                    message: error.response.data.message || "Unauthorized. You don't have permission to update users.",
                    type: "error"
                });
            } else {
                setToast({
                    message: "Something went wrong. Please try again later.",
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
        // Scroll to table
        document.getElementById('user-table')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="p-6">
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
                    <h1 className="text-2xl font-bold text-gray-800">Accounts</h1>
                    <p className="text-gray-500">Manage staff, customers, and saraf users</p>
                </div>
                {(canCreateStaff || canCreateCustomer || canCreateSaraf) && (
                    <Button onClick={() => setShowForm(true)}>
                        <FaUserPlus className="w-4 h-4 mr-2" />
                        Add New User
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
                            <p className="text-sm text-gray-500">Total Users</p>
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
                            <p className="text-sm text-gray-500">Staff</p>
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
                            <p className="text-sm text-gray-500">Customers</p>
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
                            <p className="text-sm text-gray-500">Saraf</p>
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
                                        <h2 className="text-xl font-bold">Edit User</h2>
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-xl font-bold">Create New User</h2>
                                    </>
                                )}
                            </div>

                            <Form
                                onSubmit={editingUser ? handleUpdate : handleSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="name" required>Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        error={formErrors.name?.[0]}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email" required>Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        error={formErrors.email?.[0]}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        error={formErrors.phone?.[0]}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="role" required>Role</Label>
                                    <Select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleRoleChange}
                                        error={formErrors.role?.[0]}
                                    >
                                        {canCreateStaff && <option value="staff">Staff</option>}
                                        {canCreateCustomer && <option value="customer">Customer</option>}
                                        {canCreateSaraf && <option value="saraf">Saraf</option>}
                                    </Select>
                                    {!canCreateStaff && !canCreateCustomer && !canCreateSaraf && (
                                        <p className="mt-1 text-sm text-yellow-600">
                                            You don't have permission to create any user types.
                                        </p>
                                    )}
                                </div>

                                {formData.role === "staff" && (
                                    <div>
                                        <Label htmlFor="password" required={!editingUser}>
                                            {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                                        </Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder={editingUser ? "Enter new password" : "Enter password (min 6 characters)"}
                                            value={formData.password}
                                            onChange={handleChange}
                                            error={formErrors.password?.[0]}
                                        />
                                    </div>
                                )}

                                {formData.role !== "staff" && (
                                    <p className="text-sm text-gray-500 italic">
                                        Note: {formData.role}s don't need to login. They will be created with a default password.
                                    </p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={formLoading}
                                    >
                                        {formLoading ? "Saving..." : editingUser ? "Update User" : "Create User"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleCancel}
                                    >
                                        Cancel
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
                                ? "All Users" 
                                : `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}s`}
                            {selectedRole !== "all" && (
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({filteredUsers.length} users)
                                </span>
                            )}
                        </h2>
                    </div>
                    <Select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-40"
                    >
                        <option value="all">All Users</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="customer">Customer</option>
                        <option value="saraf">Saraf</option>
                    </Select>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No {selectedRole !== "all" ? selectedRole : ""} users found
                    </div>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Email</TableHeader>
                                <TableHeader>Phone</TableHeader>
                                <TableHeader>Role</TableHeader>
                                <TableHeader>Permissions</TableHeader>
                                <TableHeader>Created By</TableHeader>
                                <TableHeader className="text-right">Actions</TableHeader>
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
                                                            {perm.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">No permissions</span>
                                            )
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.creator ? user.creator.name : "Self"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Edit Button - Only admin can edit */}
                                            {canEditDelete && user.id !== userData?.id && (
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit user"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                            )}
                                            {/* Delete Button - Only admin can delete and not self */}
                                            {canEditDelete && user.id !== userData?.id && (
                                                <button
                                                    onClick={() => openDeleteModal(user.id, user.name)}
                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete user"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            )}
                                            {/* Show message if no actions available */}
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