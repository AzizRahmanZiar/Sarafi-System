import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    Info,
    Check,
    Trash2,
    RefreshCw,
    ArrowLeft
} from 'lucide-react';
import api from '../api/axios';

// ✅ Helper function to format time
const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [markingSingle, setMarkingSingle] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/notifications');
            if (response.data.success) {
                const data = response.data.data || [];
                // Format the time for each notification
                const formattedData = data.map(notif => ({
                    ...notif,
                    time: formatTime(notif.created_at)
                }));
                setNotifications(formattedData);
            } else {
                setError('Failed to load notifications');
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err.response?.data?.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        if (markingSingle) return;
        
        try {
            setMarkingSingle(true);
            const response = await api.put(`/notifications/${id}/read`);
            
            if (response.data.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, read: true } : n)
                );
            } else {
                console.error('Failed to mark as read:', response.data.message);
            }
        } catch (err) {
            console.error('Error marking as read:', err.response || err);
            setError('Failed to mark notification as read');
        } finally {
            setMarkingSingle(false);
        }
    };

    const markAllAsRead = async () => {
        if (markingAll) return;
        
        try {
            setMarkingAll(true);
            const response = await api.put('/notifications/read-all');
            
            if (response.data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            } else {
                console.error('Failed to mark all as read:', response.data.message);
            }
        } catch (err) {
            console.error('Error marking all as read:', err.response || err);
            setError('Failed to mark all notifications as read');
        } finally {
            setMarkingAll(false);
        }
    };

    const deleteAllRead = async () => {
        if (deleting) return;
        
        try {
            setDeleting(true);
            const response = await api.delete('/notifications/read/all');
            
            if (response.data.success) {
                setNotifications(prev => prev.filter(n => !n.read));
            } else {
                console.error('Failed to delete read notifications:', response.data.message);
            }
        } catch (err) {
            console.error('Error deleting read notifications:', err.response || err);
            setError('Failed to delete read notifications');
        } finally {
            setDeleting(false);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const response = await api.delete(`/notifications/${id}`);
            
            if (response.data.success) {
                setNotifications(prev => prev.filter(n => n.id !== id));
            } else {
                console.error('Failed to delete notification:', response.data.message);
            }
        } catch (err) {
            console.error('Error deleting notification:', err.response || err);
            setError('Failed to delete notification');
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'success': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
            case 'warning': return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
            case 'error': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
            default: return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            disabled={markingAll}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" />
                            {markingAll ? 'Marking...' : 'Mark all read'}
                        </button>
                    )}
                    <button
                        onClick={fetchNotifications}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    {notifications.some(n => n.read) && (
                        <button
                            onClick={deleteAllRead}
                            disabled={deleting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            {deleting ? 'Deleting...' : 'Clear read'}
                        </button>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Notifications List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔔</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No notifications</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">You're all caught up!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`
                                p-4 rounded-xl border-l-4 transition-all
                                ${notif.read ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : getTypeColor(notif.type)}
                                hover:shadow-md
                            `}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">{getIcon(notif.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className={`${notif.read ? 'text-gray-600 dark:text-gray-400' : 'font-semibold text-gray-900 dark:text-white'}`}>
                                                {notif.title}
                                            </p>
                                            {notif.message && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {notif.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {!notif.read && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notif.id);
                                                    }}
                                                    className="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                    title="Mark as read"
                                                    disabled={markingSingle}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notif.id);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {notif.time}
                                        </span>
                                        {!notif.read && (
                                            <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                                                New
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;