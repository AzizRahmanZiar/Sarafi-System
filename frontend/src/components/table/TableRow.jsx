// components/table/TableRow.jsx
import { forwardRef } from 'react';

const TableRow = forwardRef(function TableRow({
    children,
    className = "",
    ...props
}, ref) {
    return (
        <tr
            ref={ref}
            className={`hover:bg-gray-50 ${className}`}
            {...props}
        >
            {children}
        </tr>
    );
});

export default TableRow;