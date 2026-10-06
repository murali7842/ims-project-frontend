import './FormField.css';

export interface SelectOption {
  value: string;
  label: string;
  // Value of the parent option, for dropdowns that depend on another field (e.g. batch -> course)
  parent?: string;
  // Extra details of the option, e.g. a batch's institution_id
  data?: Record<string, string | number | null>;
}

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "date"
  | "datetime-local"
  | "textarea"
  | "select";

interface FormFieldProps {
  name: string;
  label: string;
  type?: FieldType;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  error?: string;
  disabled?: boolean;
}

const FormField = ({
  name,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
  options = [],
  error,
  disabled = false,
}: FormFieldProps) => {
  const id = `field-${name}`;
  const commonProps = {
    id,
    name,
    value,
    disabled,
    className: error ? "has-error" : "",
  };

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && <span className="required-mark">*</span>}
      </label>

      {type === "select" ? (
        <select {...commonProps} onChange={(e) => onChange(name, e.target.value)}>
          <option value="">{placeholder ?? `Select ${label.toLowerCase()}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          {...commonProps}
          rows={3}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <input
          {...commonProps}
          type={type}
          placeholder={placeholder}
          step={type === "number" ? "any" : undefined}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}

      {error && <span className="form-field-error">{error}</span>}
    </div>
  );
};

export default FormField;
