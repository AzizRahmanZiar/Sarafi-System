// src/components/common/Table.jsx

/**
 * Table component - Reusable table with loading and empty states
 * 
 * @param {array} columns - Array of {key, header, render?, width?}
 * @param {array} data - Array of data objects
 * @param {boolean} loading - Shows loading spinner
 * @param {string} emptyMessage - Message when no data
 * @param {function} onRowClick - Click handler for rows
 * @param {string} className - Additional CSS classes
 * @param {node} children - Custom table body
 */
export const Table = ({
    columns,
    data,
    loading = false,
    emptyMessage = 'No data found',
    onRowClick,
    className = '',
    children,
}) => {
    // Loading state
    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        );
    }

    // Empty state
    if (!data || data.length === 0) {
        return (
            <div className="p-12 text-center">
                <div className="text-gray-500 dark:text-gray-400">{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                {/* Header */}
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                style={{ width: column.width }}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                
                {/* Body */}
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {children || data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                onRowClick ? 'cursor-pointer' : ''
                            }`}
                            onClick={() => onRowClick?.(row)}
                        >
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white"
                                >
                                    {column.render ? column.render(row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};