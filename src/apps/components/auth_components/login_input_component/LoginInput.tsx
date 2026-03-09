// import './LoginInput.css';

// interface LoginInputProps {
//   label: string;
//   type: string;
//   placeholder: string;
//   value: string;
//   onChange: (value: string) => void;
// }

// const LoginInput =({label,type,placeholder,value,onChange}: LoginInputProps)=>{


//     return(
//         <div className="login-group">
//           <label >{label}</label>
//           <input type={type} placeholder={placeholder} value={value} onChange={(e)=> onChange(e.target.value)}  />           
//         </div>
//     )

// }
// export default LoginInput;


import React from 'react';
import './LoginInput.css';

interface LoginInputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: string;
}

const LoginInput = ({ 
  label, 
  type, 
  placeholder, 
  value, 
  onChange,
  icon 
}: LoginInputProps) => {
  return (
    <div className="login-group">
      <label>{label}</label>
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default LoginInput;