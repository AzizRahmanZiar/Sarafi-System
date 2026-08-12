// src/pages/UserAccount.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Plus, 
    Minus, 
    Wallet, 
    History, 
    RefreshCw,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Clock,
    DollarSign,
    User,
    Mail,
    Phone,
    CreditCard,
    Receipt,
    FileText,
    Search,
    Calendar,
    Copy,
    Check,
    Edit,
    Trash2,
    Eye,
    ChevronDown,
    ChevronUp,
    Send,
    ArrowUpRight,
    ArrowDownLeft,
    Circle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Import components
import { 
    Button, 
    Input, 
    Select, 
    Form, 
    Modal
} from '../components/common';

// Import utils
import { ROLES, ROLE_COLORS, ROLE_LABELS } from '../utils';

const UserAccount = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role === ROLES.ADMIN;
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [balance, setBalance] = useState(0);
    const [allBalances, setAllBalances] = useState({});
    const [perCurrencyStats, setPerCurrencyStats] = useState([]);
    const [totalStats, setTotalStats] = useState({
        total_deposits: 0,
        total_withdrawals: 0,
        transaction_count: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCurrency, setFilterCurrency] = useState('all');
    const [copied, setCopied] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [expandedTransaction, setExpandedTransaction] = useState(null);
    const [currencyOptions, setCurrencyOptions] = useState([]);
    
    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    
    // Form data
    const [formData, setFormData] = useState({
        amount: '',
        currency_id: '',
        description: '',
        type: 'deposit'
    });

    useEffect(() => {
        if (id) {
            fetchUserData();
            fetchCurrencies();
        }
    }, [id]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch user details
            const userResponse = await api.get(`/users/${id}`);
            if (userResponse.data.success) {
                setUser(userResponse.data.data);
            } else {
                setError('User not found');
                setLoading(false);
                return;
            }
            
            // ✅ Fetch user balance (with all currencies)
            try {
                const balanceResponse = await api.get(`/users/${id}/balance`);
                if (balanceResponse.data.success) {
                    const data = balanceResponse.data.data;
                    setBalance(data.balance || 0);
                    setAllBalances(data.all_balances || {});
                    if (data.currency) {
                        setSelectedCurrency(data.currency);
                    }
                }
            } catch (err) {
                console.error('Error fetching balance:', err);
                // Don't set error here, just log it
            }
            
            // ✅ Fetch user transactions (with stats)
            try {
                const transactionResponse = await api.get(`/users/${id}/transactions`);
                if (transactionResponse.data.success) {
                    const txData = transactionResponse.data.data || [];
                    setTransactions(txData);
                    
                    // Set per-currency stats
                    if (transactionResponse.data.stats?.per_currency) {
                        setPerCurrencyStats(transactionResponse.data.stats.per_currency);
                    }
                    
                    if (transactionResponse.data.stats?.totals) {
                        setTotalStats(transactionResponse.data.stats.totals);
                    }
                }
            } catch (err) {
                console.error('Error fetching transactions:', err);
                setTransactions([]);
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError(err.response?.data?.message || 'Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrencies = async () => {
        try {
            const response = await api.get('/currencies/available');
            if (response.data.success) {
                let currencyData = response.data.data || [];
                setCurrencies(currencyData);
                
                // ✅ Set currency options for selects
                const options = currencyData.map(c => ({
                    value: c.id,
                    label: `${c.symbol || c.code} ${c.code} - ${c.name}`
                }));
                setCurrencyOptions(options);
                
                if (currencyData.length > 0) {
                    // ✅ Find the currency that matches the user's balance
                    let defaultCurrency = null;
                    
                    // Try to find by allBalances
                    if (Object.keys(allBalances).length > 0) {
                        const firstCurrencyCode = Object.keys(allBalances)[0];
                        defaultCurrency = currencyData.find(c => c.code === firstCurrencyCode);
                    }
                    
                    // Fallback to first currency
                    if (!defaultCurrency) {
                        defaultCurrency = currencyData[0];
                    }
                    
                    setSelectedCurrency(defaultCurrency);
                    setFormData(prev => ({ 
                        ...prev, 
                        currency_id: defaultCurrency?.id || '' 
                    }));
                }
            }
        } catch (err) {
            console.error('Error fetching currencies:', err);
        }
    };

    const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    // ✅ Handle Add Money with proper validation
    const handleAddMoney = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        try {
            const amount = parseFloat(formData.amount);
            
            if (isNaN(amount) || amount <= 0) {
                setFormErrors({ amount: ['Amount must be greater than 0'] });
                setSubmitting(false);
                return;
            }
            
            const response = await api.post(`/users/${id}/add-money`, {
                amount: amount,
                currency_id: parseInt(formData.currency_id),
                description: formData.description || 'Deposit',
            });

            if (response.data.success) {
                setAddModalOpen(false);
                setFormData({ ...formData, amount: '', description: '' });
                showSuccess(`💰 Money added successfully!`);
                await fetchUserData();
            }
        } catch (err) {
            console.error('Add money error:', err);
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                setFormErrors({ general: err.response?.data?.message || 'Failed to add money' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Handle Withdraw Money with proper balance check
    const handleWithdrawMoney = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        try {
            const amount = parseFloat(formData.amount);
            
            if (isNaN(amount) || amount <= 0) {
                setFormErrors({ amount: ['Amount must be greater than 0'] });
                setSubmitting(false);
                return;
            }
            
            // ✅ Check balance for selected currency
            const currencyObj = currencies.find(c => c.id === parseInt(formData.currency_id));
            const currencyBalance = allBalances[currencyObj?.code] || 0;
            
            if (amount > currencyBalance) {
                setFormErrors({ 
                    general: `Insufficient balance. Available: ${currencyBalance} ${currencyObj?.code}` 
                });
                setSubmitting(false);
                return;
            }
            
            const response = await api.post(`/users/${id}/withdraw-money`, {
                amount: amount,
                currency_id: parseInt(formData.currency_id),
                description: formData.description || 'Withdrawal',
            });

            if (response.data.success) {
                setWithdrawModalOpen(false);
                setFormData({ ...formData, amount: '', description: '' });
                showSuccess(`💸 Money withdrawn successfully!`);
                await fetchUserData();
            }
        } catch (err) {
            console.error('Withdraw error:', err);
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else if (err.response?.data?.data?.current_balance !== undefined) {
                // ✅ Handle insufficient balance from backend
                const errorData = err.response.data.data;
                setFormErrors({ 
                    general: `Insufficient balance. Available: ${errorData.current_balance} ${errorData.currency}` 
                });
            } else {
                setFormErrors({ general: err.response?.data?.message || 'Failed to withdraw money' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Handle Update Transaction with proper validation
    const handleUpdateTransaction = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        try {
            const amount = parseFloat(formData.amount);
            
            if (isNaN(amount) || amount <= 0) {
                setFormErrors({ amount: ['Amount must be greater than 0'] });
                setSubmitting(false);
                return;
            }
            
            const response = await api.put(`/transactions/${selectedTransaction.id}`, {
                amount: amount,
                description: formData.description || '',
                type: formData.type
            });

            if (response.data.success) {
                setEditModalOpen(false);
                showSuccess('✅ Transaction updated successfully!');
                await fetchUserData();
            }
        } catch (err) {
            console.error('Update transaction error:', err);
            if (err.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                setFormErrors({ general: err.response?.data?.message || 'Failed to update transaction' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Handle Delete Transaction
    const handleDeleteTransaction = async () => {
        setSubmitting(true);
        try {
            const response = await api.delete(`/transactions/${selectedTransaction.id}`);
            if (response.data.success) {
                setDeleteModalOpen(false);
                showSuccess('🗑️ Transaction deleted successfully!');
                await fetchUserData();
            }
        } catch (err) {
            console.error('Delete transaction error:', err);
            setFormErrors({ general: err.response?.data?.message || 'Failed to delete transaction' });
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Handle View Transaction
    const handleViewTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        setViewModalOpen(true);
    };

    // ✅ Handle Edit Transaction
    const handleEditTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        setFormData({
            amount: transaction.amount.toString(),
            description: transaction.description || '',
            type: transaction.type,
            currency_id: transaction.currency_id
        });
        setFormErrors({});
        setEditModalOpen(true);
    };

    // ✅ Handle Delete Click
    const handleDeleteClick = (transaction) => {
        setSelectedTransaction(transaction);
        setDeleteModalOpen(true);
    };

    // ✅ Toggle expand for transaction details
    const toggleExpand = (id) => {
        setExpandedTransaction(expandedTransaction === id ? null : id);
    };

    // ✅ Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    };

    // ✅ Format currency helper
    const formatCurrency = (amount, currency = 'USD') => {
        if (amount === undefined || amount === null) return '0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // ✅ Get transaction type color
    const getTransactionTypeColor = (type) => {
        switch(type) {
            case 'deposit': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
            case 'withdrawal': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
            case 'transfer': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
            case 'fee': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400';
            case 'refund': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
            default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    // ✅ Get transaction type icon
    const getTransactionTypeIcon = (type) => {
        switch(type) {
            case 'deposit': return <ArrowDownLeft className="w-4 h-4" />;
            case 'withdrawal': return <ArrowUpRight className="w-4 h-4" />;
            case 'transfer': return <Send className="w-4 h-4" />;
            case 'fee': return <AlertCircle className="w-4 h-4" />;
            case 'refund': return <RefreshCw className="w-4 h-4" />;
            default: return <Circle className="w-4 h-4" />;
        }
    };

    // ✅ Filter transactions
    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.currency_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.reference && tx.reference.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'all' || tx.type === filterType;
        const matchesCurrency = filterCurrency === 'all' || tx.currency_code === filterCurrency;
        return matchesSearch && matchesType && matchesCurrency;
    });

    // ✅ Transaction Card Component
    const TransactionCard = ({ transaction }) => {
        const isExpanded = expandedTransaction === transaction.id;
        const typeColor = getTransactionTypeColor(transaction.type);
        const typeIcon = getTransactionTypeIcon(transaction.type);
        const isPositive = transaction.type === 'deposit' || transaction.type === 'refund';

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeColor}`}>
                                {typeIcon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-gray-900 dark:text-white capitalize">
                                        {transaction.type}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor}`}>
                                        {transaction.status || 'Completed'}
                                    </span>
                                    {transaction.reference && (
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            #{transaction.reference}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{formatDate(transaction.created_at)}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                    <span className="truncate">{transaction.description || 'No description'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                                <div className={`font-bold text-lg ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isPositive ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency_code)}
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                    Balance: {formatCurrency(transaction.balance_after, transaction.currency_code)}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleViewTransaction(transaction)}
                                    className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                    title="View"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleEditTransaction(transaction)}
                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(transaction)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => toggleExpand(transaction.id)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                                >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Transaction ID</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">#{transaction.id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Reference</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.reference || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Currency</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.currency_code}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Status</p>
                                <p className={`text-sm font-medium capitalize ${transaction.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {transaction.status || 'Completed'}
                                </p>
                            </div>
                            <div className="col-span-2 md:col-span-4">
                                <p className="text-xs text-gray-400 dark:text-gray-500">Description</p>
                                <p className="text-sm text-gray-900 dark:text-white">{transaction.description || '-'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-3 text-gray-500">Loading user data...</span>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">😕</div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">{error || 'User not found'}</p>
                <Button onClick={() => navigate('/dashboard/accounts')} className="mt-4">
                    Back to Accounts
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/accounts')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="capitalize">{user?.role}</span> • {user?.email}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={fetchUserData}
                        icon={RefreshCw}
                        loading={loading}
                        size="sm"
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} className="text-sm hover:underline">
                        Dismiss
                    </button>
                </div>
            )}

            {/* Per Currency Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {perCurrencyStats.length > 0 ? (
                    perCurrencyStats.map((stat) => (
                        <div key={stat.currency_code} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{stat.currency_code}</h4>
                                <span className={`text-sm font-semibold ${stat.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatCurrency(stat.balance, stat.currency_code)}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Deposits</p>
                                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(stat.total_deposits, stat.currency_code)}
                                    </p>
                                    <p className="text-xs text-gray-400">{stat.deposit_count} transactions</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Withdrawals</p>
                                    <p className="font-semibold text-red-600 dark:text-red-400">
                                        {formatCurrency(stat.total_withdrawals, stat.currency_code)}
                                    </p>
                                    <p className="text-xs text-gray-400">{stat.withdrawal_count} transactions</p>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                                Total: {stat.transaction_count} transactions
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                        No transactions found for any currency
                    </div>
                )}
            </div>

            {/* All Balances Overview */}
            {Object.keys(allBalances).length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        All Balances by Currency
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(allBalances).map(([currency, amount]) => (
                            <div key={currency} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="font-bold text-sm text-gray-900 dark:text-white">{currency}</span>
                                <span className={`text-sm font-semibold ${amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatCurrency(amount, currency)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <Button 
                    onClick={() => setAddModalOpen(true)} 
                    className="bg-emerald-500 hover:bg-emerald-600"
                    size="sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Money
                </Button>
                <Button 
                    onClick={() => setWithdrawModalOpen(true)} 
                    className="bg-red-500 hover:bg-red-600"
                    size="sm"
                >
                    <Minus className="w-4 h-4" />
                    Withdraw
                </Button>
                <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryModalOpen(true)}
                    icon={History}
                >
                    Full History
                </Button>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        Recent Transactions
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-40 md:w-48"
                            />
                        </div>
                        <div className="flex gap-1">
                            {['all', 'deposit', 'withdrawal'].map((type) => (
                                <Button
                                    key={type}
                                    variant={filterType === type ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => setFilterType(type)}
                                    className={`text-xs capitalize ${filterType === type && type === 'deposit' ? 'bg-emerald-500 hover:bg-emerald-600' : ''} ${filterType === type && type === 'withdrawal' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                        <select
                            value={filterCurrency}
                            onChange={(e) => setFilterCurrency(e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Currencies</option>
                            {Object.keys(allBalances).map((currency) => (
                                <option key={currency} value={currency}>{currency}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                        {(searchTerm || filterType !== 'all' || filterCurrency !== 'all') && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterCurrency('all'); }}
                                className="mt-2"
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTransactions.slice(0, 5).map((transaction) => (
                            <TransactionCard key={transaction.id} transaction={transaction} />
                        ))}
                        {filteredTransactions.length > 5 && (
                            <button
                                onClick={() => setHistoryModalOpen(true)}
                                className="w-full py-2 text-sm text-primary-500 hover:text-primary-600 font-medium border border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                            >
                                View all {filteredTransactions.length} transactions →
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ===== MODALS ===== */}

            {/* Add Money Modal */}
            <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Money">
                <Form onSubmit={handleAddMoney} error={formErrors.general}>
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            Current balance for {selectedCurrency?.code}: <strong>
                                {formatCurrency(allBalances[selectedCurrency?.code] || 0, selectedCurrency?.code)}
                            </strong>
                        </p>
                        {Object.keys(allBalances).length > 1 && (
                            <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                <span>All balances: </span>
                                {Object.entries(allBalances).map(([code, amount]) => (
                                    <span key={code} className="ml-2">
                                        {code}: {formatCurrency(amount, code)}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <Select
                        label="Currency"
                        name="currency_id"
                        value={formData.currency_id}
                        onChange={(e) => {
                            const currency = currencies.find(c => c.id === parseInt(e.target.value));
                            setSelectedCurrency(currency);
                            setFormData({ ...formData, currency_id: e.target.value });
                        }}
                        options={currencyOptions}
                        required
                    />

                    <Input
                        label="Amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        error={formErrors.amount?.[0]}
                        placeholder="0.00"
                        required
                    />

                    <Input
                        label="Description (Optional)"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Add a note"
                    />

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setAddModalOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" loading={submitting} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                            <Plus className="w-4 h-4" />
                            Add Money
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Withdraw Money Modal */}
            <Modal isOpen={withdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} title="Withdraw Money">
                <Form onSubmit={handleWithdrawMoney} error={formErrors.general}>
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            Current balance for {selectedCurrency?.code}: <strong>
                                {formatCurrency(allBalances[selectedCurrency?.code] || 0, selectedCurrency?.code)}
                            </strong>
                        </p>
                        {Object.keys(allBalances).length > 1 && (
                            <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                <span>All balances: </span>
                                {Object.entries(allBalances).map(([code, amount]) => (
                                    <span key={code} className="ml-2">
                                        {code}: {formatCurrency(amount, code)}
                                    </span>
                                ))}
                            </div>
                        )}
                        {parseFloat(allBalances[selectedCurrency?.code] || 0) <= 0 && (
                            <p className="text-sm text-red-500 mt-1">⚠️ Insufficient balance in this currency</p>
                        )}
                    </div>

                    <Select
                        label="Currency"
                        name="currency_id"
                        value={formData.currency_id}
                        onChange={(e) => {
                            const currency = currencies.find(c => c.id === parseInt(e.target.value));
                            setSelectedCurrency(currency);
                            setFormData({ ...formData, currency_id: e.target.value });
                        }}
                        options={currencyOptions}
                        required
                    />

                    <Input
                        label="Amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={allBalances[selectedCurrency?.code] || 0}
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        error={formErrors.amount?.[0]}
                        placeholder="0.00"
                        required
                    />

                    <Input
                        label="Description (Optional)"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Add a note"
                    />

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setWithdrawModalOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            loading={submitting} 
                            className="flex-1 bg-red-500 hover:bg-red-600"
                            disabled={parseFloat(allBalances[selectedCurrency?.code] || 0) <= 0}
                        >
                            <Minus className="w-4 h-4" />
                            Withdraw
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* View Transaction Modal */}
            <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Transaction Details" size="lg">
                {selectedTransaction && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTransactionTypeColor(selectedTransaction.type)}`}>
                                {getTransactionTypeIcon(selectedTransaction.type)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                    {selectedTransaction.type}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(selectedTransaction.created_at)}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Amount</p>
                                <p className={`text-lg font-bold ${selectedTransaction.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {selectedTransaction.type === 'deposit' ? '+' : '-'}{formatCurrency(selectedTransaction.amount, selectedTransaction.currency_code)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Balance After</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(selectedTransaction.balance_after, selectedTransaction.currency_code)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Currency</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedTransaction.currency_code}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Status</p>
                                <p className={`text-sm font-medium capitalize ${selectedTransaction.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {selectedTransaction.status || 'Completed'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-400 dark:text-gray-500">Description</p>
                                <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.description || '-'}</p>
                            </div>
                            {selectedTransaction.reference && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Reference</p>
                                    <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedTransaction.reference}</p>
                                </div>
                            )}
                            {selectedTransaction.metadata && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Metadata</p>
                                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-lg overflow-auto">
                                        {JSON.stringify(selectedTransaction.metadata, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                                Close
                            </Button>
                            <Button 
                                variant="secondary" 
                                onClick={() => { setViewModalOpen(false); handleEditTransaction(selectedTransaction); }}
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Transaction Modal */}
            <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Transaction">
                <Form onSubmit={handleUpdateTransaction} error={formErrors.general}>
                    <Select
                        label="Type"
                        name="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        options={[
                            { value: 'deposit', label: 'Deposit' },
                            { value: 'withdrawal', label: 'Withdrawal' },
                            { value: 'transfer', label: 'Transfer' },
                            { value: 'fee', label: 'Fee' },
                            { value: 'refund', label: 'Refund' }
                        ]}
                        required
                    />

                    <Input
                        label="Amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        error={formErrors.amount?.[0]}
                        required
                    />

                    <Input
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Transaction description"
                    />

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setEditModalOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" loading={submitting} className="flex-1 bg-blue-500 hover:bg-blue-600">
                            <Check className="w-4 h-4" />
                            Update
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Delete Transaction Modal */}
            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Transaction">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Transaction</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Are you sure you want to delete this transaction?<br />
                        <span className="text-sm">
                            <strong>Amount:</strong> {selectedTransaction && formatCurrency(selectedTransaction.amount, selectedTransaction.currency_code)}<br />
                            <strong>Type:</strong> {selectedTransaction?.type}
                        </span>
                    </p>
                    <p className="text-sm text-red-500 mb-4">This action cannot be undone.</p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleDeleteTransaction} 
                            loading={submitting} 
                            className="flex-1 bg-red-500 hover:bg-red-600"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Transaction History Modal */}
            <Modal 
                isOpen={historyModalOpen} 
                onClose={() => setHistoryModalOpen(false)} 
                title={`Transaction History`}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-3 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                                Total: <strong className="text-gray-900 dark:text-white">{transactions.length}</strong>
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                                Deposits: <strong className="text-emerald-600 dark:text-emerald-400">
                                    {transactions.filter(t => t.type === 'deposit').length}
                                </strong>
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                                Withdrawals: <strong className="text-red-600 dark:text-red-400">
                                    {transactions.filter(t => t.type === 'withdrawal').length}
                                </strong>
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-40"
                                />
                            </div>
                            <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={fetchUserData}
                                icon={RefreshCw}
                                loading={loading}
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-1 flex-wrap">
                        {['all', 'deposit', 'withdrawal'].map((type) => (
                            <Button
                                key={type}
                                variant={filterType === type ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setFilterType(type)}
                                className={`text-xs capitalize ${filterType === type && type === 'deposit' ? 'bg-emerald-500 hover:bg-emerald-600' : ''} ${filterType === type && type === 'withdrawal' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                            >
                                {type}
                            </Button>
                        ))}
                        <select
                            value={filterCurrency}
                            onChange={(e) => setFilterCurrency(e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ml-1"
                        >
                            <option value="all">All Currencies</option>
                            {Object.keys(allBalances).map((currency) => (
                                <option key={currency} value={currency}>{currency}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {filteredTransactions.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                            </div>
                        ) : (
                            filteredTransactions.map((transaction) => (
                                <TransactionCard key={transaction.id} transaction={transaction} />
                            ))
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserAccount;