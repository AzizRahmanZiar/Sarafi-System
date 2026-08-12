import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Form } from './Form';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';
import { Button } from './Button';

export const EditModal = ({
    isOpen,
    onClose,
    onSave,
    title = 'Edit',
    data,
    fields = [],
    loading = false,
    size = 'lg',
    className = '',
    onSuccess,
}) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (data) {
            const initialData = {};
            fields.forEach(field => {
                initialData[field.key] = data[field.key] !== undefined ? data[field.key] : field.default || '';
            });
            setFormData(initialData);
        }
    }, [data, fields]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            // Validate required fields
            const newErrors = {};
            fields.forEach(field => {
                if (field.required && !formData[field.key]) {
                    newErrors[field.key] = `${field.label} is required`;
                }
                if (field.validate && !field.validate(formData[field.key])) {
                    newErrors[field.key] = field.validationMessage || `Invalid ${field.label}`;
                }
            });

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                setIsSubmitting(false);
                return;
            }

            // Prepare data for save
            const saveData = {};
            fields.forEach(field => {
                const value = formData[field.key];
                if (field.transform) {
                    saveData[field.key] = field.transform(value);
                } else {
                    saveData[field.key] = value;
                }
            });

            const result = await onSave(data?.id, saveData);
            if (result?.success !== false) {
                onSuccess?.();
                onClose();
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ general: err.message || 'Failed to save changes' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field) => {
        // Extract key and other props separately
        const { key, type, options, rows, ...restProps } = field;
        
        // Common props for all field types
        const commonProps = {
            name: key,
            value: formData[key] || '',
            onChange: handleChange,
            error: errors[key],
            label: field.label,
            required: field.required,
            placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
            disabled: field.disabled || loading || isSubmitting,
            className: field.className,
        };

        switch (field.type) {
            case 'select':
                return (
                    <Select
                        key={key}
                        {...commonProps}
                        options={options || []}
                    />
                );
            case 'textarea':
                return (
                    <Textarea
                        key={key}
                        {...commonProps}
                        rows={rows || 3}
                    />
                );
            case 'password':
                return (
                    <Input
                        key={key}
                        {...commonProps}
                        type="password"
                        placeholder={field.placeholder || '••••••••'}
                    />
                );
            case 'email':
                return (
                    <Input
                        key={key}
                        {...commonProps}
                        type="email"
                    />
                );
            case 'number':
                return (
                    <Input
                        key={key}
                        {...commonProps}
                        type="number"
                        step={field.step || 'any'}
                        min={field.min}
                        max={field.max}
                    />
                );
            case 'checkbox':
                return (
                    <div key={key} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name={key}
                            checked={formData[key] || false}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary-500 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                            disabled={field.disabled || loading || isSubmitting}
                        />
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                            {field.label}
                        </label>
                    </div>
                );
            default:
                return (
                    <Input
                        key={key}
                        {...commonProps}
                        type={field.type || 'text'}
                    />
                );
        }
    };

    // Group fields by section
    const sections = fields.reduce((acc, field) => {
        const section = field.section || 'default';
        if (!acc[section]) acc[section] = [];
        acc[section].push(field);
        return acc;
    }, {});

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size={size} className={className}>
            <Form onSubmit={handleSubmit} error={errors.general}>
                {Object.entries(sections).map(([sectionName, sectionFields]) => (
                    <div key={sectionName}>
                        {sectionName !== 'default' && (
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                {sectionName}
                            </h4>
                        )}
                        <div className={sectionName === 'default' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                            {sectionFields.map(field => renderField(field))}
                        </div>
                    </div>
                ))}

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading || isSubmitting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        loading={isSubmitting || loading}
                        className="flex-1"
                        disabled={loading || isSubmitting}
                    >
                        Save Changes
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};