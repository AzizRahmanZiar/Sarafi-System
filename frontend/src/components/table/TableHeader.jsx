// components/table/TableHeader.jsx
import { forwardRef } from 'react';

const TableHeader = forwardRef(function TableHeader({
    children,
    className = "",
    ...props
}, ref) {
    return (
        <th
            ref={ref}
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
            {...props}
        >
            {children}
        </th>
    );
});

export default TableHeader;