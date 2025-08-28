import React from 'react';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date' | 'time' | 'file' | 'checkbox' | 'radio' | 'tags';
  value?: any;
  onChange?: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  rows?: number;
  accept?: string;
  multiple?: boolean;
  options?: Array<{ value: string; label: string; description?: string }>;
  className?: string;
  icon?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  error,
  disabled,
  min,
  max,
  step,
  rows = 3,
  accept,
  multiple,
  options = [],
  className = '',
  icon
}) => {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!onChange) return;

    switch (type) {
      case 'checkbox':
        onChange((e.target as HTMLInputElement).checked);
        break;
      case 'file':
        const files = (e.target as HTMLInputElement).files;
        onChange(multiple ? Array.from(files || []) : files?.[0] || null);
        break;
      case 'number':
        onChange(e.target.value ? parseFloat(e.target.value) : '');
        break;
      case 'tags':
        // Handle comma-separated tags
        const tagString = e.target.value;
        const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag);
        onChange(tags);
        break;
      default:
        onChange(e.target.value);
    }
  };

  const renderInput = () => {
    const baseClasses = `w-full px-4 py-3 rounded-xl border transition-all ${
      error 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
    } focus:ring-2 focus:outline-none ${className}`;

    const inputProps = {
      id: fieldId,
      value: type === 'tags' ? (Array.isArray(value) ? value.join(', ') : value || '') : value || '',
      onChange: handleChange,
      placeholder,
      required,
      disabled,
      className: baseClasses
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            rows={rows}
          />
        );

      case 'select':
        return (
          <select {...inputProps}>
            <option value="">Bitte wählen...</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map(option => (
              <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={fieldId}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-500">{option.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              id={fieldId}
              checked={value || false}
              onChange={handleChange}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        );

      case 'file':
        return (
          <input
            type="file"
            {...inputProps}
            value={undefined} // File inputs can't have controlled values
            accept={accept}
            multiple={multiple}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        );

      default:
        return (
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {icon}
              </div>
            )}
            <input
              type={type}
              {...inputProps}
              className={icon ? `${baseClasses} pl-10` : baseClasses}
              min={min}
              max={max}
              step={step}
            />
          </div>
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={`form-field ${error ? 'error' : ''}`}>
        {renderInput()}
        {error && (
          <div className="mt-1 text-sm text-red-600">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div className={`form-field ${error ? 'error' : ''}`}>
      <label 
        htmlFor={fieldId} 
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && (
        <div className="mt-1 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
};

export default FormField;