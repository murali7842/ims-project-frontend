import "./login.css";
import { useState } from "react";
import { login } from "../../../pages/api/auth/AuthApi";
import { useNavigate } from "react-router-dom";


import authImage from "../../../../assets/auth_images/auth_image.png";
import emailIcon from "../../../../assets/auth_images/email_logo.png";
import passwordIcon from "../../../../assets/auth_images/password_logo.png";
import eyeIcon from "../../../../assets/auth_images/invisible.png";
import logo from "../../../../assets/auth_images/ims_logo.png";
import LoginInput from "../../../components/auth_components/login_input_component/LoginInput";
import AuthButton from "../../../components/auth_components/button_component/AuthButton";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

   const handleRegister =()=>{
    navigate("/register");
   }

   const handleLogin = async () => {
      try {
        setLoading(true);
  
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);
  
        const response = await login(formData as any);
  
        console.log("Login Success:", response);
        console.log("Login email:", email);
        console.log("Login passwored:", password);
  
        localStorage.setItem("token", response.access_token);
        navigate("/dashboard")
  
      } catch (error: any) {
        alert(error?.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="login-container">
      
      {/* LEFT */}
      <div className="login-left">
        <img src={authImage} alt="Auth Visual" />
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="login-box">

          {/* CENTER HEADER */}
          <div className="login-header">
            <img src={logo} alt="Logo" className="logo" />
            <div className="welcome">Welcome back!</div>
          </div>

          {/* CONTENT */}
          <div className="login-content">

            <div className="sign_in">Sign in</div>

            <p className="sub-text">
              If you don’t have an account register <br /> <br />
              You can <span onClick={handleRegister}>Register here !</span>
            </p>

            {/* EMAIL INPUT */}
            <LoginInput
              label="Email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={setEmail}
              icon={emailIcon}
              isActive={true}
            />

            {/* PASSWORD INPUT */}
            <LoginInput
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your Password"
              value={password}
              onChange={setPassword}
              icon={passwordIcon}
              eyeIcon={eyeIcon}
              showEye={true}
              onEyeClick={() => setShowPassword(!showPassword)}
            />

            {/* CHECKBOX ROW */}
            <div className="extra-options">
              <div>
                <input 
                  type="checkbox" 
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </div>

              <p className="forgot" onClick={() => navigate("/forgot")}>Forgot Password ?</p>
            </div>

            {/* LOGIN BUTTON */}
            <AuthButton 
              text="Login" 
              onClick={handleLogin}
              type="submit"
            />

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;