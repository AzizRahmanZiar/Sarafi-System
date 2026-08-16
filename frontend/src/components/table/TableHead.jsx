// src/components/table/TableHead.jsx
import { forwardRef } from 'react';

const TableHead = forwardRef(function TableHead({
    children,
    className = "",
    ...props
}, ref) {
    return (
        <thead
            ref={ref}
            className={`bg-gray-50 ${className}`}
            {...props}
        >
            {children}
        </thead>
    );
});

export default TableHead;