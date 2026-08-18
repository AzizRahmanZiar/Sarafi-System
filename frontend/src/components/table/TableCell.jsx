// components/table/TableCell.jsx
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

const TableCell = forwardRef(function TableCell({
    children,
    className = "",
    ...props
}, ref) {
    const { i18n } = useTranslation();
    const isRTL = ['ps', 'dr', 'ar', 'fa', 'ur'].includes(i18n.language);
    
    return (
        <td
            ref={ref}
            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                isRTL ? 'text-right' : 'text-left'
            } ${className}`}
            {...props}
        >
            {children}
        </td>
    );
});

export default TableCell;