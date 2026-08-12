// src/components/common/Button.jsx

/**
 * Button component - Reusable button with variants, sizes, and loading state
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Shows spinner when true
 * @param {boolean} disabled - Disables button when true
 * @param {function} onClick - Click handler
 * @param {string} type - 'button' | 'submit' | 'reset'
 * @param {string} className - Additional CSS classes
 * @param {component} icon - Icon component to display
 * @param {string} iconPosition - 'left' | 'right'
 */
export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    onClick,
    type = 'button',
    className = '',
    icon: Icon,
    iconPosition = 'left',
    ...props
}) => {
    // Style maps for different variants
    const variants = {
        primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40',
        secondary: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300',
        danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40',
        success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40',
        outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
    };

    // Size maps
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                flex items-center justify-center gap-2 rounded-xl font-medium
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant] || variants.primary}
                ${sizes[size] || sizes.md}
                ${className}
            `}
            {...props}
        >
            {/* Loading spinner */}
            {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            
            {/* Left icon */}
            {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
            
            {/* Button text */}
            {children}
            
            {/* Right icon */}
            {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </button>
    );
};