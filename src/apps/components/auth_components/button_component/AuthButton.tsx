import './AuthButton.css';

interface AuthButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const AuthButton = ({ 
  text, 
  onClick, 
  type = 'button',
  disabled = false 
}: AuthButtonProps) => {
  return (
    <button 
      className="login-btn" 
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default AuthButton;