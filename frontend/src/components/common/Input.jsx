// src/components/common/Input.jsx
import { useState } from 'react';

/**
 * Input component - Reusable text input with label and error handling
 * 
 * @param {string} label - Input label
 * @param {string} name - Input name attribute
 * @param {string} type - Input type (text, email, password, number, etc.)
 * @param {any} value - Input value
 * @param {function} onChange - Change handler
 * @param {function} onBlur - Blur handler
 * @param {string} error - Error message
 * @param {string} placeholder - Input placeholder
 * @param {component} icon - Icon component
 * @param {boolean} required - Show required asterisk
 * @param {string} className - Additional CSS classes
 */
export const Input = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    icon: Icon,
    required = false,
    className = '',
    ...props
}) => {
    const [touched, setTouched] = useState(false);

    const handleBlur = (e) => {
        setTouched(true);
        onBlur?.(e);
    };

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
                
                {/* Input */}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={`
                        w-full px-4 py-2.5 rounded-xl 
                        border transition-all duration-200
                        focus:ring-2 focus:ring-primary-500 focus:border-transparent 
                        outline-none bg-white dark:bg-gray-700
                        text-gray-900 dark:text-white
                        ${Icon ? 'pl-10' : 'pl-4'} pr-4
                        ${error && touched 
                            ? 'border-red-500 ring-1 ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }
                        ${className}
                    `}
                    {...props}
                />
                
                {/* Error message */}
                {error && touched && (
                    <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
            </div>
        </div>
    );
};