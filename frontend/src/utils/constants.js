// src/utils/constants.js

// User roles
export const ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    CUSTOMER: 'customer',
    SARAF: 'saraf',
};

// Role color mapping
export const ROLE_COLORS = {
    [ROLES.ADMIN]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    [ROLES.STAFF]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    [ROLES.CUSTOMER]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    [ROLES.SARAF]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

// Role label mapping
export const ROLE_LABELS = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.STAFF]: 'Staff',
    [ROLES.CUSTOMER]: 'Customer',
    [ROLES.SARAF]: 'Saraf',
};

// Notification types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

// Default currency
export const DEFAULT_CURRENCY = 'USD';