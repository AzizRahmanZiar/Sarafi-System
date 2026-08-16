// components/table/TableCell.jsx
import { forwardRef } from 'react';

const TableCell = forwardRef(function TableCell({
    children,
    className = "",
    ...props
}, ref) {
    return (
        <td
            ref={ref}
            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}
            {...props}
        >
            {children}
        </td>
    );
});

export default TableCell;