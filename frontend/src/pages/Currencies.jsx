import { useState, useEffect } from 'react';
import { 
    DollarSign, 
    Plus, 
    Pencil, 
    Trash2, 
    X,
    Star,
    AlertCircle,
    Search,
    Globe,
    ArrowLeft,
    Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Import from components
import { 
    ViewModal, 
    EditModal, 
    DeleteModal,
    Button,
    Input,
    Form,
    Modal
} from '../components/common';

const Currencies = () => {
    const navigate = useNavigate();
    const [currencies, setCurrencies] = useState([]);
    const [availableCurrencies, setAvailableCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    
    // Modal states
    const [viewModal, setViewModal] = useState({ isOpen: false, currency: null });
    const [editModal, setEditModal] = useState({ isOpen: false, currency: null });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        currencyId: null,
        currencyName: '',
        isSystemCurrency: false
    });
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        symbol: '',
        exchange_rate: 1.0000,
        is_default: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            await Promise.all([fetchCurrencies(), fetchAvailableCurrencies()]);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load currencies');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrencies = async () => {
        const response = await api.get('/currencies');
        if (response.data.success) {
            setCurrencies(response.data.data.currencies || []);
        }
    };

    const fetchAvailableCurrencies = async () => {
        const response = await api.get('/currencies/available');
        if (response.data.success) {
            setAvailableCurrencies(response.data.data || []);
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleAddCurrency = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        try {
            const response = await api.post('/currencies/create', formData);
            if (response.data.success) {
                setShowAddModal(false);
                setFormData({ code: '', name: '', symbol: '', exchange_rate: 1.0000, is_default: false });
                await fetchData();
                showSuccess('Currency created successfully!');
            } else {
                setFormErrors({ general: response.data.message });
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                setFormErrors({ general: err.response?.data?.message || 'Failed to create currency' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateCurrency = async (id, data) => {
        const response = await api.put(`/currencies/${id}`, data);
        if (response.data.success) {
            await fetchData();
            showSuccess('Currency updated successfully!');
            return { success: true };
        }
        return { success: false, message: response.data.message };
    };

    const handleDeleteCurrency = async () => {
        setDeleting(true);
        try {
            const response = await api.delete(`/currencies/${deleteModal.currencyId}`);
            if (response.data.success) {
                setDeleteModal({ isOpen: false, currencyId: null, currencyName: '', isSystemCurrency: false });
                await fetchData();
                showSuccess('Currency deleted successfully!');
            } else {
                alert(response.data.message || 'Failed to delete currency');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete currency');
        } finally {
            setDeleting(false);
        }
    };

    const handleRemoveFromCompany = async () => {
        setDeleting(true);
        try {
            const response = await api.delete(`/currencies/remove/${deleteModal.currencyId}`);
            if (response.data.success) {
                setDeleteModal({ isOpen: false, currencyId: null, currencyName: '', isSystemCurrency: false });
                await fetchData();
                showSuccess('Currency removed from company successfully!');
            } else {
                alert(response.data.message || 'Failed to remove currency');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to remove currency');
        } finally {
            setDeleting(false);
        }
    };

    const handleSetDefault = async (currencyId) => {
        try {
            const response = await api.put(`/currencies/${currencyId}/default`);
            if (response.data.success) {
                await fetchData();
                showSuccess('Default currency updated!');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to set default currency');
        }
    };

    const handleAddSystemCurrency = async (currencyId) => {
        try {
            const response = await api.post('/currencies/add', { currency_id: currencyId });
            if (response.data.success) {
                await fetchData();
                showSuccess('Currency added to your company!');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add currency');
        }
    };

    const openDeleteModal = (currency) => {
        setDeleteModal({
            isOpen: true,
            currencyId: currency.id,
            currencyName: currency.name,
            isSystemCurrency: currency.is_system || false
        });
    };

    const openEditModal = (currency) => {
        setFormData({
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
            exchange_rate: currency.exchange_rate,
            is_default: currency.pivot?.is_default || false
        });
        setFormErrors({});
        setEditModal({ isOpen: true, currency });
    };

    const filteredCurrencies = currencies.filter(c => 
        c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAvailableToAdd = availableCurrencies.filter(c => !c.is_added);

    const currencyViewFields = [
        { key: 'code', label: 'Code' },
        { key: 'symbol', label: 'Symbol' },
        { key: 'exchange_rate', label: 'Exchange Rate', type: 'currency', symbol: '' },
        { key: 'is_default', label: 'Default Currency', type: 'boolean' },
        { key: 'is_system', label: 'System Currency', type: 'boolean' },
        { key: 'is_active', label: 'Active', type: 'boolean' },
    ];

    const currencyEditFields = [
        { key: 'code', label: 'Code', required: true },
        { key: 'name', label: 'Name', required: true },
        { key: 'symbol', label: 'Symbol', required: true },
        { 
            key: 'exchange_rate', 
            label: 'Exchange Rate', 
            type: 'number',
            step: '0.0001',
            min: '0.0001'
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard/settings')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Currencies</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your company currencies</p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setFormData({ 
                            code: '', 
                            name: '', 
                            symbol: '', 
                            exchange_rate: 1.0000, 
                            is_default: currencies.length === 0 
                        });
                        setFormErrors({});
                        setShowAddModal(true);
                    }}
                    icon={Plus}
                >
                    Add Currency
                </Button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span>{successMessage}</span>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={fetchData} className="ml-auto text-sm underline">Retry</button>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search currencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Currency List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    </div>
                ) : filteredCurrencies.length === 0 ? (
                    <div className="p-8 text-center">
                        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No currencies added</p>
                        <button
                            onClick={() => {
                                setFormData({ code: '', name: '', symbol: '', exchange_rate: 1.0000, is_default: true });
                                setFormErrors({});
                                setShowAddModal(true);
                            }}
                            className="mt-2 text-primary-500 hover:text-primary-600 text-sm font-medium"
                        >
                            Add your first currency
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredCurrencies.map((currency) => (
                            <div key={currency.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div 
                                    className="flex items-center gap-4 flex-1 cursor-pointer"
                                    onClick={() => setViewModal({ isOpen: true, currency })}
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                                        {currency.symbol || currency.code?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 dark:text-white">{currency.name}</span>
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400">
                                                {currency.code}
                                            </span>
                                            {currency.pivot?.is_default && (
                                                <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center gap-1">
                                                    <Star className="w-3 h-3" />
                                                    Default
                                                </span>
                                            )}
                                            {currency.is_system ? (
                                                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                                    System
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">
                                                    Custom
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                            <span>Symbol: {currency.symbol}</span>
                                            <span>Rate: {currency.exchange_rate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {!currency.pivot?.is_default && currencies.length > 1 && (
                                        <button
                                            onClick={() => handleSetDefault(currency.id)}
                                            className="p-1.5 text-gray-400 hover:text-emerald-500 transition-colors rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                            title="Set as default"
                                        >
                                            <Star className="w-4 h-4" />
                                        </button>
                                    )}
                                    {!currency.is_system && (
                                        <>
                                            <button
                                                onClick={() => openEditModal(currency)}
                                                className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(currency)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Delete"
                                                disabled={currency.pivot?.is_default}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    {currency.is_system && (
                                        <button
                                            onClick={() => openDeleteModal(currency)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                            title="Remove from company"
                                            disabled={currency.pivot?.is_default}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available System Currencies */}
            {getAvailableToAdd.length > 0 && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available System Currencies</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {getAvailableToAdd.map((currency) => (
                            <button
                                key={currency.id}
                                onClick={() => handleAddSystemCurrency(currency.id)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-gray-200 dark:border-gray-600 rounded-lg transition-all text-sm"
                            >
                                <span className="font-medium">{currency.code}</span>
                                <span className="text-gray-500">{currency.name}</span>
                                <Plus className="w-3 h-3 text-primary-500" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* View Currency Modal */}
            <ViewModal
                isOpen={viewModal.isOpen}
                onClose={() => setViewModal({ isOpen: false, currency: null })}
                title="Currency Details"
                data={viewModal.currency}
                fields={currencyViewFields}
            />

            {/* Edit Currency Modal */}
            <EditModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, currency: null })}
                title="Edit Currency"
                data={editModal.currency}
                fields={currencyEditFields}
                onSave={handleUpdateCurrency}
                onSuccess={fetchData}
                loading={loading}
            />

            {/* Delete Currency Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, currencyId: null, currencyName: '', isSystemCurrency: false })}
                onDelete={deleteModal.isSystemCurrency ? handleRemoveFromCompany : handleDeleteCurrency}
                itemName={deleteModal.currencyName}
                title={deleteModal.isSystemCurrency ? 'Remove Currency' : 'Delete Currency'}
                message={deleteModal.isSystemCurrency 
                    ? `Are you sure you want to remove "${deleteModal.currencyName}" from your company? You can add it back later.`
                    : `Are you sure you want to delete "${deleteModal.currencyName}"? This action cannot be undone.`
                }
                loading={deleting}
                confirmText={deleteModal.isSystemCurrency ? 'Remove' : 'Delete'}
            />

            {/* Create Currency Modal */}
            {showAddModal && (
                <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Currency">
                    <Form onSubmit={handleAddCurrency} error={formErrors.general}>
                        <Input
                            label="Code"
                            name="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            error={formErrors.code?.[0]}
                            placeholder="USD"
                            required
                            maxLength="10"
                        />
                        <Input
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={formErrors.name?.[0]}
                            placeholder="US Dollar"
                            required
                        />
                        <Input
                            label="Symbol"
                            name="symbol"
                            value={formData.symbol}
                            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                            error={formErrors.symbol?.[0]}
                            placeholder="$"
                            required
                            maxLength="10"
                        />
                        <Input
                            label="Exchange Rate"
                            name="exchange_rate"
                            type="number"
                            step="0.0001"
                            value={formData.exchange_rate}
                            onChange={(e) => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 1 })}
                            min="0.0001"
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_default"
                                checked={formData.is_default}
                                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                className="w-4 h-4 text-primary-500 rounded"
                            />
                            <label htmlFor="is_default" className="text-sm text-gray-700 dark:text-gray-300">Set as default</label>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" loading={submitting} className="flex-1">
                                Create
                            </Button>
                        </div>
                    </Form>
                </Modal>
            )}
        </div>
    );
};

export default Currencies;