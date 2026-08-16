// src/components/table/Table.jsx
import { forwardRef } from 'react';

const Table = forwardRef(function Table({
    children,
    className = "",
    ...props
}, ref) {
    return (
        <div className="overflow-x-auto">
            <table
                ref={ref}
                className={`min-w-full divide-y divide-gray-200 ${className}`}
                {...props}
            >
                {children}
            </table>
        </div>
    );
});

export default Table;