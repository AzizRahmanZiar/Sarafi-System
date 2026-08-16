import { forwardRef } from 'react';

const Select = forwardRef(function Select({
    children,
    id,
    className = "",
    error,
    ...props
}, ref) {
    return (
        <div>
            <select
                ref={ref}
                id={id}
                className={`w-full rounded-lg border px-4 py-2 outline-none transition focus:ring-2 ${
                    error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                } ${className}`}
                {...props}
            >
                {children}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
});

export default Select;