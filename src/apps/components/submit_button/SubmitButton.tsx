import React from 'react';
import './SubmitButton.css';

const FormButton = ({ type, onClick, children,className }) => {
    return (
        <div className='btn-container'>
            <button className='btn-style' type={type} onClick={onClick} >
                {children}
            </button>
        </div>
    )
}

export default FormButton
