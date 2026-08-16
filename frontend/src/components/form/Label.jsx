import { useId } from 'react';

export default function Label({
    children,
    htmlFor,
    className = "",
    required = false,
}) {
    const id = useId();
    
    return (
        <label
            htmlFor={htmlFor || id}
            className={`mb-2 block text-sm font-medium text-gray-700 ${className}`}
        >
            {children}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>
    );
}