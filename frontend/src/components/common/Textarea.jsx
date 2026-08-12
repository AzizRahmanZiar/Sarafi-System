// src/components/common/Textarea.jsx

/**
 * Textarea component - Reusable multi-line text input
 * 
 * @param {string} label - Textarea label
 * @param {string} name - Textarea name attribute
 * @param {any} value - Textarea value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message
 * @param {string} placeholder - Textarea placeholder
 * @param {number} rows - Number of rows
 * @param {boolean} required - Show required asterisk
 * @param {component} icon - Icon component
 */
export const Textarea = ({
    label,
    name,
    value,
    onChange,
    error,
    placeholder,
    rows = 3,
    required = false,
    icon: Icon,
    className = '',
}) => {
    return (
        <div className="space-y-1.5">
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative">
                {/* Icon */}
                {Icon && (
                    <Icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                )}
                
                {/* Textarea */}
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={rows}
                    className={`
                        w-full px-4 py-2.5 rounded-xl 
                        border border-gray-300 dark:border-gray-600
                        focus:ring-2 focus:ring-primary-500 focus:border-transparent 
                        outline-none bg-white dark:bg-gray-700
                        text-gray-900 dark:text-white resize-none
                        ${Icon ? 'pl-10' : 'pl-4'} pr-4
                        ${error ? 'border-red-500 ring-1 ring-red-500' : ''}
                        ${className}
                    `}
                />
                
                {/* Error message */}
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        </div>
    );
};