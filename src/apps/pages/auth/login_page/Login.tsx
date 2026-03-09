import "./login.css";
import authImage from "../../../../assets/auth_images/auth_image.svg";
import LoginForm from "../../../components/auth_components/login_form_component/LoginForm";

const LoginLayout = ()=>{
  return(
    <div className="login-container">

      <div className="login-left">
        <img src={authImage} alt="Login Illustration"/>
      </div>
      <div className="login-right">
         <LoginForm />
      </div>
    </div>

    
  )
}
export default LoginLayout;