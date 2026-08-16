import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea({
    id,
    className = "",
    error,
    rows = 4,
    ...props
}, ref) {
    return (
        <div>
            <textarea
                ref={ref}
                id={id}
                rows={rows}
                className={`w-full rounded-lg border px-4 py-2 outline-none transition focus:ring-2 ${
                    error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                } ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
});

export default Textarea;