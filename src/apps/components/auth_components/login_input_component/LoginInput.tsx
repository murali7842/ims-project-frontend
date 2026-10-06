import './LoginInput.css';

interface LoginInputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: string;
  eyeIcon?: string;
  showEye?: boolean;
  onEyeClick?: () => void;
  isActive?: boolean;
}

const LoginInput = ({ 
  label, 
  type, 
  placeholder, 
  value, 
  onChange,
  icon,
  eyeIcon,
  showEye = false,
  onEyeClick,
  isActive = false
}: LoginInputProps) => {
  return (
    <div className="login-input-container">
      <label>{label}</label>
      <div className={`input-group ${isActive ? 'active' : ''}`}>
        {icon && <img src={icon} alt={label} />}
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
        />
        {showEye && eyeIcon && (
          <img src={eyeIcon} alt="eye" className="eye-icon" onClick={onEyeClick} />
        )}
      </div>
    </div>
  );
};

export default LoginInput;