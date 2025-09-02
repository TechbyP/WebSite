import { useTheme } from '../../utils/context/theme-context';

interface FormFieldProps {
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
    name: string;
    value: any;
    label: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<any>) => void;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    rows?: number;
    options?: Array<{ id: string; label: string }>;
    privacyPolicy?: string;
    checked?: boolean;
}

const FormField = ({
    type,
    name,
    value,
    label,
    placeholder,
    onChange,
    required = false,
    minLength,
    maxLength,
    pattern,
    rows,
    options,
    privacyPolicy,
    checked
}: FormFieldProps) => {
    const { theme } = useTheme();
    
    const textClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';
    const inputBgClass = theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white';

    const renderField = () => {
        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        id={name}
                        name={name}
                        value={value}
                        placeholder={placeholder}
                        onChange={onChange}
                        required={required}
                        minLength={minLength}
                        maxLength={maxLength}
                        rows={rows}
                        className={`w-full px-4 py-3 ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all ${inputBgClass}`}
                    />
                );
            
            case 'select':
                return (
                    <select
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        required={required}
                        className={`w-full px-4 py-3 ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all ${inputBgClass}`}
                    >
                        {options?.map((option) => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                    </select>
                );
            
            case 'checkbox':
                return (
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id={name}
                                name={name}
                                type="checkbox"
                                checked={checked}
                                onChange={onChange}
                                required={required}
                                className={`focus:ring-blue-600 h-4 w-4 text-blue-600 ${borderClass} rounded`}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor={name} className={`font-medium ${textClass}`}>
                                {label}{' '}
                                {privacyPolicy && (
                                    <a href="/privacy" className="text-blue-400 hover:text-green-400 underline transition-colors">
                                        {privacyPolicy}
                                    </a>
                                )}
                                {required && <span className="text-red-500"> *</span>}
                            </label>
                        </div>
                    </div>
                );
            
            default:
                return (
                    <input
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        placeholder={placeholder}
                        onChange={onChange}
                        required={required}
                        minLength={minLength}
                        maxLength={maxLength}
                        pattern={pattern}
                        className={`w-full px-4 py-3 ${borderClass} rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all ${inputBgClass}`}
                    />
                );
        }
    };

    if (type === 'checkbox') {
        return renderField();
    }

    return (
        <div>
            <label htmlFor={name} className={`block text-sm font-medium ${textClass} mb-1`}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {renderField()}
        </div>
    );
};

export default FormField;