import React from 'react';
import './SubmitButton.css';

interface FormButtonProps {
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
}

const FormButton: React.FC<FormButtonProps> = ({ type = 'button', onClick, children, className = '' }) => {
    return (
        <div className='btn-container'>
            <button className={`btn-style ${className}`.trim()} type={type} onClick={onClick}>
                {children}
            </button>
        </div>
    );
};

export default FormButton;
