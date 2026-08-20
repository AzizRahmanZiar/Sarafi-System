// pages/Transactions.jsx
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { 
    FaBook, 
    FaSearch,
    FaPlus,
    FaPrint,
    FaDownload,
    FaFilter,
    FaCalendarAlt,
    FaFileInvoice,
    FaEye,
    FaSave,
    FaTrash,
    FaEdit,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaUser,
    FaTimes
} from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
import Toast from "../components/Toast";
import api from "../services/api";

// Import reusable components
import Button from "../components/form/Button";
import Input from "../components/form/Input";
import Select from "../components/form/Select";
import Label from "../components/form/Label";
import Form from "../components/form/Form";
import Table from "../components/table/Table";
import TableBody from "../components/table/TableBody";
import TableCell from "../components/table/TableCell";
import TableHead from "../components/table/TableHead";
import TableHeader from "../components/table/TableHeader";
import TableRow from "../components/table/TableRow";
import TableActions from "../components/table/TableActions";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

export default function Transactions() {
    const { t } = useTranslation();
    const { isRTL } = useLanguage();
    const isRtl = isRTL || document.documentElement.dir === 'rtl';
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [showFilter, setShowFilter] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    
    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        transactionId: null,
        transactionName: ""
    });
    
    // Journal Entry Form State
    const [showJournalForm, setShowJournalForm] = useState(false);
    const [journalForm, setJournalForm] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        entries: [
            { id: 1, account: '', description: '', debit: '', credit: '' }
        ]
    });
    const [editingJournalId, setEditingJournalId] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [entryCounter, setEntryCounter] = useState(2);
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Sample accounts data - replace with API call
    useEffect(() => {
        fetchAccounts();
        fetchTransactions();
    }, []);

    const fetchAccounts = async () => {
        try {
            // TODO: Replace with actual API call
            // const response = await api.get("/accounts");
            // setAccounts(response.data);
            
            // Sample accounts
            setAccounts([
                { id: 1, code: '1000', name: 'Cash Account', type: 'asset' },
                { id: 2, code: '2000', name: 'Bank Account', type: 'asset' },
                { id: 3, code: '3000', name: 'Accounts Receivable', type: 'asset' },
                { id: 4, code: '4000', name: 'Revenue', type: 'income' },
                { id: 5, code: '5000', name: 'Expense', type: 'expense' },
                { id: 6, code: '6000', name: 'Owner\'s Equity', type: 'equity' },
                { id: 7, code: '7000', name: 'Accounts Payable', type: 'liability' },
            ]);
        } catch (error) {
            setToast({
                message: "Failed to load accounts",
                type: "error"
            });
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await api.get(`/transactions/journal`);
            // setTransactions(response.data);
            
            // Sample journal entries
            const sampleData = [
                {
                    id: 1,
                    date: '2026-08-20 10:30:00',
                    description: 'Cash deposit to bank',
                    entries: [
                        { account: 'Bank Account', debit: 10000, credit: 0 },
                        { account: 'Cash Account', debit: 0, credit: 10000 }
                    ],
                    total_debit: 10000,
                    total_credit: 10000,
                    status: 'completed',
                    createdBy: 'Aziz Ziar',
                    createdAt: '2026-08-20 10:30:00'
                },
                {
                    id: 2,
                    date: '2026-08-20 11:15:00',
                    description: 'Revenue from customer',
                    entries: [
                        { account: 'Accounts Receivable', debit: 5000, credit: 0 },
                        { account: 'Revenue', debit: 0, credit: 5000 }
                    ],
                    total_debit: 5000,
                    total_credit: 5000,
                    status: 'pending',
                    createdBy: 'Noor',
                    createdAt: '2026-08-20 11:15:00'
                },
                {
                    id: 3,
                    date: '2026-08-20 12:00:00',
                    description: 'Office rent payment',
                    entries: [
                        { account: 'Expense', debit: 2000, credit: 0 },
                        { account: 'Bank Account', debit: 0, credit: 2000 }
                    ],
                    total_debit: 2000,
                    total_credit: 2000,
                    status: 'completed',
                    createdBy: 'Aziz Ziar',
                    createdAt: '2026-08-20 12:00:00'
                }
            ];
            setTransactions(sampleData);
        } catch (error) {
            setToast({
                message: "Failed to load transactions",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'failed':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'completed':
                return <FaCheckCircle className="w-4 h-4" />;
            case 'pending':
                return <FaClock className="w-4 h-4" />;
            case 'failed':
                return <FaTimesCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'completed': 'Completed',
            'pending': 'Pending',
            'failed': 'Failed'
        };
        return statusMap[status] || status;
    };

    // Journal Entry Form Handlers
    const handleOpenJournalForm = (transaction = null) => {
        if (transaction) {
            // Edit mode
            setEditingJournalId(transaction.id);
            setJournalForm({
                date: transaction.date.split(' ')[0],
                description: transaction.description,
                entries: transaction.entries.map((entry, index) => ({
                    id: index + 1,
                    account: entry.account,
                    description: '',
                    debit: entry.debit || '',
                    credit: entry.credit || ''
                }))
            });
            setEntryCounter(transaction.entries.length + 1);
        } else {
            // Create mode
            setEditingJournalId(null);
            setJournalForm({
                date: new Date().toISOString().split('T')[0],
                description: '',
                entries: [
                    { id: 1, account: '', description: '', debit: '', credit: '' }
                ]
            });
            setEntryCounter(2);
        }
        setFormErrors({});
        setShowJournalForm(true);
    };

    const handleCloseJournalForm = () => {
        setShowJournalForm(false);
        setEditingJournalId(null);
        setJournalForm({
            date: new Date().toISOString().split('T')[0],
            description: '',
            entries: [{ id: 1, account: '', description: '', debit: '', credit: '' }]
        });
        setFormErrors({});
    };

    const handleAddEntry = () => {
        setJournalForm(prev => ({
            ...prev,
            entries: [...prev.entries, { id: entryCounter, account: '', description: '', debit: '', credit: '' }]
        }));
        setEntryCounter(prev => prev + 1);
    };

    const handleRemoveEntry = (id) => {
        if (journalForm.entries.length <= 1) {
            setToast({
                message: "You must have at least one entry",
                type: "error"
            });
            return;
        }
        setJournalForm(prev => ({
            ...prev,
            entries: prev.entries.filter(entry => entry.id !== id)
        }));
    };

    const handleEntryChange = (id, field, value) => {
        setJournalForm(prev => ({
            ...prev,
            entries: prev.entries.map(entry => {
                if (entry.id === id) {
                    // If changing debit, clear credit and vice versa
                    const updated = { ...entry, [field]: value };
                    if (field === 'debit' && value) {
                        updated.credit = '';
                    } else if (field === 'credit' && value) {
                        updated.debit = '';
                    }
                    return updated;
                }
                return entry;
            })
        }));
    };

    const handleJournalSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        try {
            // Validate entries
            const errors = {};
            let hasDebit = false;
            let hasCredit = false;

            journalForm.entries.forEach((entry, index) => {
                if (!entry.account) {
                    errors[`entries.${index}.account`] = 'Account is required';
                }
                if (!entry.debit && !entry.credit) {
                    errors[`entries.${index}.amount`] = 'Either debit or credit is required';
                }
                if (entry.debit) hasDebit = true;
                if (entry.credit) hasCredit = true;
            });

            if (!hasDebit || !hasCredit) {
                errors.general = 'Journal entry must have both debit and credit amounts';
            }

            // Check if totals balance
            const totalDebit = journalForm.entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
            const totalCredit = journalForm.entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);

            if (totalDebit !== totalCredit) {
                errors.general = `Total debit (${totalDebit}) must equal total credit (${totalCredit})`;
            }

            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                setSubmitting(false);
                return;
            }

            // Prepare data for API
            const journalData = {
                date: journalForm.date,
                description: journalForm.description,
                entries: journalForm.entries.map(entry => ({
                    account: entry.account,
                    description: entry.description || '',
                    debit: parseFloat(entry.debit) || 0,
                    credit: parseFloat(entry.credit) || 0
                }))
            };

            // TODO: Replace with actual API call
            // if (editingJournalId) {
            //     await api.put(`/transactions/journal/${editingJournalId}`, journalData);
            // } else {
            //     await api.post("/transactions/journal", journalData);
            // }

            setToast({
                message: editingJournalId ? "Journal entry updated successfully!" : "Journal entry created successfully!",
                type: "success"
            });

            handleCloseJournalForm();
            fetchTransactions();

        } catch (error) {
            if (error.response?.status === 422) {
                setFormErrors(error.response.data.errors || {});
            } else {
                setToast({
                    message: error.response?.data?.message || "Failed to save journal entry",
                    type: "error"
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const openDetailModal = (item) => {
        setSelectedTransaction(item);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedTransaction(null);
    };

    // Delete handlers using DeleteConfirmationModal
    const openDeleteModal = (id, description) => {
        setDeleteModal({
            isOpen: true,
            transactionId: id,
            transactionName: description
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            transactionId: null,
            transactionName: ""
        });
    };

    const handleConfirmDelete = async () => {
        const { transactionId, transactionName } = deleteModal;
        
        try {
            // TODO: Replace with actual API call
            // await api.delete(`/transactions/journal/${transactionId}`);
            
            setToast({
                message: `Journal entry "${transactionName}" deleted successfully!`,
                type: "success"
            });
            closeDeleteModal();
            fetchTransactions();
        } catch (error) {
            setToast({
                message: "Failed to delete journal entry",
                type: "error"
            });
            closeDeleteModal();
        }
    };

    // Render Journal Table using reusable components
    const renderJournalTable = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Loading...</span>
                        </div>
                    </TableCell>
                </TableRow>
            );
        }

        if (transactions.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        <FaBook className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>No journal entries found</p>
                    </TableCell>
                </TableRow>
            );
        }

        return transactions.map(item => (
            <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                <TableCell>{item.date}</TableCell>
                <TableCell className="font-medium text-gray-800">{item.description}</TableCell>
                <TableCell>
                    <div className="space-y-1">
                        {item.entries.map((entry, idx) => (
                            <div key={idx} className="text-xs">
                                {entry.account}
                                {entry.debit > 0 && <span className="text-green-600 ml-1">+{entry.debit}</span>}
                                {entry.credit > 0 && <span className="text-red-600 ml-1">-{entry.credit}</span>}
                            </div>
                        ))}
                    </div>
                </TableCell>
                <TableCell className="text-green-600 font-medium">
                    {item.total_debit?.toLocaleString() || '-'}
                </TableCell>
                <TableCell className="text-red-600 font-medium">
                    {item.total_credit?.toLocaleString() || '-'}
                </TableCell>
                <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {getStatusText(item.status)}
                    </span>
                </TableCell>
                <TableCell>
                    <TableActions
                        showView={true}
                        showEdit={true}
                        showDelete={true}
                        onView={() => openDetailModal(item)}
                        onEdit={() => handleOpenJournalForm(item)}
                        onDelete={() => openDeleteModal(item.id, item.description)}
                    />
                </TableCell>
            </TableRow>
        ));
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
                userName={deleteModal.transactionName}
            />

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FaBook className="w-6 h-6 text-blue-600" />
                        Journal Entries
                    </h1>
                    <p className="text-gray-500 mt-1">Manage all financial journal entries</p>
                </div>
                <Button
                    onClick={() => handleOpenJournalForm()}
                    className="flex items-center gap-2"
                >
                    <FaPlus className="w-4 h-4" />
                    New Journal Entry
                </Button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <FaSearch className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                            <input
                                type="text"
                                placeholder="Search journal entries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    isRtl ? 'pr-10' : 'pl-10'
                                }`}
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilter(!showFilter)}
                            className="flex items-center gap-2"
                        >
                            <FaFilter className="w-4 h-4" />
                            Filter
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <FaPrint className="w-4 h-4" />
                            Print
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <FaDownload className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilter && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="fromDate">
                                <FaCalendarAlt className="inline w-4 h-4 mr-1" />
                                From Date
                            </Label>
                            <Input
                                id="fromDate"
                                type="date"
                                value={dateRange.from}
                                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="toDate">
                                <FaCalendarAlt className="inline w-4 h-4 mr-1" />
                                To Date
                            </Label>
                            <Input
                                id="toDate"
                                type="date"
                                value={dateRange.to}
                                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="statusFilter">Status</Label>
                            <Select id="statusFilter">
                                <option value="">All</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </Select>
                        </div>
                    </div>
                )}
            </div>

            {/* Journal Entries Table using reusable components */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Date</TableHeader>
                                <TableHeader>Description</TableHeader>
                                <TableHeader>Accounts</TableHeader>
                                <TableHeader>Total Debit</TableHeader>
                                <TableHeader>Total Credit</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader>Actions</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {renderJournalTable()}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Journal Entry Form Modal */}
            {showJournalForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FaBook className="w-5 h-5 text-blue-600" />
                                {editingJournalId ? 'Edit Journal Entry' : 'New Journal Entry'}
                            </h3>
                            <button
                                onClick={handleCloseJournalForm}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FaTimes className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <Form onSubmit={handleJournalSubmit} className="p-6 space-y-6">
                            {/* Form Header - removed Reference field */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="journalDate" required>Date</Label>
                                    <Input
                                        id="journalDate"
                                        type="date"
                                        value={journalForm.date}
                                        onChange={(e) => setJournalForm({...journalForm, date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="journalDescription" required>Description</Label>
                                    <Input
                                        id="journalDescription"
                                        type="text"
                                        value={journalForm.description}
                                        onChange={(e) => setJournalForm({...journalForm, description: e.target.value})}
                                        placeholder="Enter description"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Entries Table */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium text-gray-700">Journal Entries</h4>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddEntry}
                                        className="flex items-center gap-1"
                                    >
                                        <FaPlus className="w-3 h-3" />
                                        Add Entry
                                    </Button>
                                </div>

                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Account *</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Debit</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Credit</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {journalForm.entries.map((entry, index) => (
                                                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                                                    <td className="px-3 py-2">
                                                        <Select
                                                            value={entry.account}
                                                            onChange={(e) => handleEntryChange(entry.id, 'account', e.target.value)}
                                                            className={`w-full ${formErrors[`entries.${index}.account`] ? 'border-red-500' : ''}`}
                                                        >
                                                            <option value="">Select Account</option>
                                                            {accounts.map(acc => (
                                                                <option key={acc.id} value={acc.name}>
                                                                    {acc.code} - {acc.name}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                        {formErrors[`entries.${index}.account`] && (
                                                            <p className="mt-1 text-xs text-red-500">{formErrors[`entries.${index}.account`]}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="text"
                                                            value={entry.description}
                                                            onChange={(e) => handleEntryChange(entry.id, 'description', e.target.value)}
                                                            className="w-full"
                                                            placeholder="Optional"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={entry.debit}
                                                            onChange={(e) => handleEntryChange(entry.id, 'debit', e.target.value)}
                                                            className={`w-28 ${formErrors[`entries.${index}.amount`] ? 'border-red-500' : ''}`}
                                                            placeholder="0.00"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={entry.credit}
                                                            onChange={(e) => handleEntryChange(entry.id, 'credit', e.target.value)}
                                                            className={`w-28 ${formErrors[`entries.${index}.amount`] ? 'border-red-500' : ''}`}
                                                            placeholder="0.00"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Button
                                                            type="button"
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleRemoveEntry(entry.id)}
                                                            disabled={journalForm.entries.length <= 1}
                                                            className="p-1"
                                                        >
                                                            <FaTrash className="w-3 h-3" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 border-t border-gray-200">
                                            <tr>
                                                <td colSpan="3" className="px-3 py-2 text-sm font-medium text-gray-700 text-right">
                                                    Totals:
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-green-600">
                                                    {journalForm.entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0).toFixed(2)}
                                                </td>
                                                <td className="px-3 py-2 text-sm font-medium text-red-600">
                                                    {journalForm.entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0).toFixed(2)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {formErrors.general && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                        {formErrors.general}
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCloseJournalForm}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="w-4 h-4" />
                                            {editingJournalId ? 'Update' : 'Save'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FaFileInvoice className="w-5 h-5 text-blue-600" />
                                Journal Entry Details
                            </h3>
                            <button
                                onClick={closeDetailModal}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FaTimes className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium">{selectedTransaction.date}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium">{selectedTransaction.description}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                                        {getStatusIcon(selectedTransaction.status)}
                                        {getStatusText(selectedTransaction.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm text-gray-500 mb-2">Entries</p>
                                <table className="w-full border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Account</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Debit</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Credit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTransaction.entries.map((entry, idx) => (
                                            <tr key={idx} className="border-t border-gray-100">
                                                <td className="px-3 py-2 text-sm">{entry.account}</td>
                                                <td className="px-3 py-2 text-sm">{entry.description || '-'}</td>
                                                <td className="px-3 py-2 text-sm text-right text-green-600">
                                                    {entry.debit > 0 ? entry.debit.toFixed(2) : '-'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-right text-red-600">
                                                    {entry.credit > 0 ? entry.credit.toFixed(2) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t border-gray-200">
                                        <tr>
                                            <td colSpan="2" className="px-3 py-2 text-sm font-medium text-gray-700 text-right">
                                                Totals:
                                            </td>
                                            <td className="px-3 py-2 text-sm font-medium text-green-600 text-right">
                                                {selectedTransaction.total_debit?.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-sm font-medium text-red-600 text-right">
                                                {selectedTransaction.total_credit?.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm text-gray-500">Created By</p>
                                <p className="font-medium flex items-center gap-2">
                                    <FaUser className="w-4 h-4 text-gray-400" />
                                    {selectedTransaction.createdBy}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Created at: {selectedTransaction.createdAt}
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <Button variant="secondary" onClick={closeDetailModal}>
                                Close
                            </Button>
                            <Button>
                                <FaPrint className="inline w-4 h-4 mr-1" />
                                Print
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}