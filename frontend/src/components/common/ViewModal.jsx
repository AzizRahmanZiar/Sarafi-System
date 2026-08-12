// src/components/common/ViewModal.jsx
import { Modal } from './Modal';
import { formatDate } from '../../utils/format';

/**
 * ViewModal component - Displays read-only data in a structured format
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {object} data - Data object to display
 * @param {array} fields - Array of {key, label, type?, render?}
 * @param {array} sections - Array of {title, fields}
 * @param {function} customRender - Custom render function
 * @param {string} size - Modal size
 * @param {string} className - Additional CSS classes
 */
export const ViewModal = ({
    isOpen,
    onClose,
    title = 'View Details',
    data,
    fields = [],
    sections = [],
    customRender = null,
    size = 'lg',
    className = '',
}) => {
    if (!data) return null;

    // Default field renderer
    const renderField = (field) => {
        const value = data[field.key];
        
        if (value === undefined || value === null) return '-';
        
        // Handle different field types
        if (field.type === 'date') {
            return formatDate(value);
        }
        if (field.type === 'currency') {
            return value ? `${field.symbol || '$'} ${Number(value).toFixed(2)}` : '-';
        }
        if (field.type === 'badge') {
            const badgeClass = field.badgeClass?.(value) || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
            return (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
                    {value || '-'}
                </span>
            );
        }
        if (field.type === 'boolean') {
            return value ? (
                <span className="text-emerald-600 dark:text-emerald-400">Yes</span>
            ) : (
                <span className="text-gray-500 dark:text-gray-400">No</span>
            );
        }
        if (field.render) {
            return field.render(value, data);
        }
        return value;
    };

    // Info item component
    const InfoItem = ({ icon: Icon, label, value, field }) => (
        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            {Icon && <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <div className="text-sm font-medium text-gray-900 dark:text-white break-words">
                    {field ? renderField(field) : value}
                </div>
            </div>
        </div>
    );

    // Build default fields if none provided
    const defaultFields = fields.length > 0 ? fields : Object.keys(data).map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size={size} className={className}>
            {customRender ? (
                customRender(data)
            ) : (
                <div className="space-y-6">
                    {/* Header with Avatar */}
                    {data.name && (
                        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl font-bold flex-shrink-0">
                                {data.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{data.name}</h3>
                                {data.email && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{data.email}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sections */}
                    {sections.length > 0 ? (
                        sections.map((section, index) => (
                            <div key={index}>
                                {section.title && (
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        {section.title}
                                    </h4>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {section.fields.map((field, idx) => (
                                        <InfoItem
                                            key={idx}
                                            icon={field.icon}
                                            label={field.label}
                                            value={data[field.key]}
                                            field={field}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {defaultFields.map((field, index) => (
                                <InfoItem
                                    key={index}
                                    icon={field.icon}
                                    label={field.label}
                                    value={data[field.key]}
                                    field={field}
                                />
                            ))}
                        </div>
                    )}

                    {/* Status Section */}
                    {data.is_active !== undefined && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    data.is_active
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                }`}>
                                    {data.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};