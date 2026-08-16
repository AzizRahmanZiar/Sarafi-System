// components/table/TableBody.jsx
import { forwardRef } from 'react';

const TableBody = forwardRef(function TableBody({
    children,
    className = "",
    ...props
}, ref) {
    return (
        <tbody
            ref={ref}
            className={`bg-white divide-y divide-gray-200 ${className}`}
            {...props}
        >
            {children}
        </tbody>
    );
});

export default TableBody;