import './SelectFilter.css';
import type { SelectOption } from "../form_field/FormField";

interface SelectFilterProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  // Text of the empty option, e.g. "All institutions". Omit to force a selection.
  allLabel?: string;
  disabled?: boolean;
}

// Compact pill dropdown for toolbars and card headers
const SelectFilter = ({ label, value, options, onChange, allLabel, disabled = false }: SelectFilterProps) => (
  <select
    className="select-filter"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label={label}
    disabled={disabled}
  >
    {allLabel !== undefined && <option value="">{allLabel}</option>}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export default SelectFilter;
