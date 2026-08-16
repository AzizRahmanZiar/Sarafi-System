import { forwardRef } from 'react';

const Button = forwardRef(function Button({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
    ...props
}, ref) {
    const baseStyles = "rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
    
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
        danger: "bg-red-600 text-white hover:bg-red-700"
    };
    
    const sizes = {
        sm: "px-3 py-1 text-sm",
        md: "px-5 py-2",
        lg: "px-7 py-3 text-lg"
    };
    
    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
});

export default Button;