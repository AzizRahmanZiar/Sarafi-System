import { forwardRef } from 'react';

const Radio = forwardRef(function Radio({
    label,
    id,
    className = "",
    error,
    ...props
}, ref) {
    return (
        <div className={className}>
            <label className="flex items-center gap-2">
                <input
                    ref={ref}
                    id={id}
                    type="radio"
                    className={`h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 ${
                        error ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    {...props}
                />
                <span>{label}</span>
            </label>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
});

export default Radio;