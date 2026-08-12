// src/components/common/Select.jsx

/**
 * Select component - Reusable dropdown select with label
 * 
 * @param {string} label - Select label
 * @param {string} name - Select name attribute
 * @param {any} value - Selected value
 * @param {function} onChange - Change handler
 * @param {array} options - Array of {value, label} objects
 * @param {string} error - Error message
 * @param {boolean} required - Show required asterisk
 * @param {string} placeholder - Default option text
 * @param {component} icon - Icon component
 */
export const Select = ({
    label,
    name,
    value,
    onChange,
    options,
    error,
    required = false,
    placeholder = 'Select an option',
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
                    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                
                {/* Select */}
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`
                        w-full px-4 py-2.5 rounded-xl 
                        border border-gray-300 dark:border-gray-600
                        focus:ring-2 focus:ring-primary-500 focus:border-transparent 
                        outline-none bg-white dark:bg-gray-700
                        text-gray-900 dark:text-white appearance-none
                        ${Icon ? 'pl-10' : 'pl-4'} pr-10
                        ${error ? 'border-red-500 ring-1 ring-red-500' : ''}
                        ${className}
                    `}
                >
                    {/* Placeholder option */}
                    <option value="">{placeholder}</option>
                    
                    {/* Options */}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                
                {/* Dropdown arrow */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                
                {/* Error message */}
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        </div>
    );
};