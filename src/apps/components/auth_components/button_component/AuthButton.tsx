import './AuthButton.css';


interface AuthButtonProps  {
    text: string;
    onClick: () => void;
    disabled?: boolean;
}

const AuthButton = ({text, onClick }: AuthButtonProps )=>{
      

    return(
        <div>
            <button className="login-btn" onClick={onClick}>{text}</button>
        </div>
    )
}
export default AuthButton;