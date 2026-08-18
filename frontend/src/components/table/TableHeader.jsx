// components/table/TableHeader.jsx
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

const TableHeader = forwardRef(function TableHeader({
    children,
    className = "",
    ...props
}, ref) {
    const { i18n } = useTranslation();
    const isRTL = ['ps', 'dr', 'ar', 'fa', 'ur'].includes(i18n.language);
    
    return (
        <th
            ref={ref}
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                isRTL ? 'text-right' : 'text-left'
            } ${className}`}
            {...props}
        >
            {children}
        </th>
    );
});

export default TableHeader;