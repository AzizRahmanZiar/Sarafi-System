import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export default function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    userName 
}) {
    const { t, ready } = useTranslation();
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getText = (key, fallback) => {
        return ready ? t(key) : fallback;
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fadeIn"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <FaExclamationTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 id="delete-modal-title" className="text-lg font-semibold text-gray-800">
                            {getText('deleteModal.title', 'Delete User')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600">
                        {getText('deleteModal.message', 'Are you sure you want to delete "{name}"?').replace('{name}', userName)}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        {getText('deleteModal.warning', 'This action cannot be undone. All data associated with this user will be permanently removed.')}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
                    >
                        {getText('deleteModal.cancel', 'Cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                    >
                        {getText('deleteModal.confirm', 'Delete User')}
                    </button>
                </div>
            </div>
        </div>
    );
}