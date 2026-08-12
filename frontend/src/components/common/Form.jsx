// src/components/common/Form.jsx

/**
 * Form component - Wrapper for forms with error display
 * 
 * @param {function} onSubmit - Form submit handler
 * @param {boolean} loading - Disables form when true
 * @param {string} error - General error message
 * @param {string} className - Additional CSS classes
 */
export const Form = ({ 
    children, 
    onSubmit, 
    loading = false, 
    error = null,
    className = '',
    ...props 
}) => {
    return (
        <form onSubmit={onSubmit} className={`space-y-4 ${className}`} {...props}>
            {/* General error */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    {error}
                </div>
            )}
            {children}
        </form>
    );
};