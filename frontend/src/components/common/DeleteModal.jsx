// src/components/common/DeleteModal.jsx
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

/**
 * DeleteModal component - Specialized confirmation for delete actions
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Close handler
 * @param {function} onDelete - Delete handler
 * @param {string} title - Modal title
 * @param {string} message - Delete confirmation message
 * @param {string} itemName - Name of item being deleted
 * @param {string} itemType - Type of item being deleted
 * @param {boolean} loading - Shows loading state
 * @param {string} variant - 'danger' | 'warning' | 'info'
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {component} icon - Icon component
 */
export const DeleteModal = ({
    isOpen,
    onClose,
    onDelete,
    title = 'Delete',
    message = 'Are you sure you want to delete this item? This action cannot be undone.',
    itemName = '',
    itemType = 'item',
    loading = false,
    variant = 'danger',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    icon: Icon = Trash2,
}) => {
    // Style variations
    const variantStyles = {
        danger: {
            button: 'danger',
            icon: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-100 dark:bg-red-900/30',
        },
        warning: {
            button: 'secondary',
            icon: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-100 dark:bg-amber-900/30',
        },
        info: {
            button: 'primary',
            icon: 'text-primary-600 dark:text-primary-400',
            bg: 'bg-primary-100 dark:bg-primary-900/30',
        },
    };

    const styles = variantStyles[variant] || variantStyles.danger;

    const handleDelete = async () => {
        try {
            await onDelete();
            onClose();
        } catch (error) {
            // Error is handled by parent
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} showCloseButton={false}>
            <div className="text-center">
                {/* Icon */}
                <div className={`mx-auto w-16 h-16 rounded-full ${styles.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${styles.icon}`} />
                </div>
                
                {/* Title */}
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {itemName ? `Delete ${itemName}?` : title}
                </h4>
                
                {/* Message */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {message}
                </p>
                
                {/* Buttons */}
                <div className="flex gap-3 justify-center">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={styles.button}
                        onClick={handleDelete}
                        loading={loading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};