// src/utils/format.js

/**
 * Format a date string
 * @param {string} date - Date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (date, options = {}) => {
    if (!date) return 'N/A';
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options,
    };
    try {
        return new Date(date).toLocaleDateString('en-US', defaultOptions);
    } catch (error) {
        return 'Invalid date';
    }
};

/**
 * Format time as "time ago"
 * @param {string} timestamp - Timestamp string
 * @returns {string} Time ago string
 */
export const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return formatDate(date, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (error) {
        return 'Just now';
    }
};

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (error) {
        return `$${Number(amount).toFixed(2)}`;
    }
};