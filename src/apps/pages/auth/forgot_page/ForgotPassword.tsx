import "./ForgotPassword.css";
import { useState } from "react";
import { forgot } from "../../../pages/api/auth/AuthApi";
import { useNavigate } from "react-router-dom";


import authImage from "../../../../assets/auth_images/auth_image.png";
import emailIcon from "../../../../assets/auth_images/email_logo.png";
import logo from "../../../../assets/auth_images/ims_logo.png";
import LoginInput from "../../../components/auth_components/login_input_component/LoginInput";
import AuthButton from "../../../components/auth_components/button_component/AuthButton";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();

   const handleForgot = async () => {
      try {
        setLoading(true);
  
        const payload = {
              email: email,
            };
        
            const response = await forgot(payload);
        
            console.log("forgot Success:", response);

            localStorage.setItem("resetEmail", email);
            navigate("/reset_password");
  
      } catch (error: any) {
        alert(error?.response?.data?.message || "forgot failed");
      } finally {
        setLoading(false);
      }
    };

     const handleResendCode = async () => {
    if (!email) {
      alert("Please enter your email address first");
      return;
    }

    try {
      setResendLoading(true);
      const payload = {
        email: email,
      };

      const response = await forgot(payload);
      console.log("Resend Success:", response);
      alert("Verification code has been resent to your email");

    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="forgot-container">
      
      {/* LEFT */}
      <div className="forgot-left">
        <img src={authImage} alt="Auth Visual" />
      </div>

      {/* RIGHT */}
      <div className="forgot-right">
        <div className="forgot-box">

          {/* CENTER HEADER */}
          <div className="forgot-header">
            <img src={logo} alt="Logo" className="logo" />
          </div>

          {/* CONTENT */}
          <div className="forgot-content">

            <div className="forgot_password">Forgot Password?</div>

            <p className="sub-text">
              Don’t worry ! It happens. Please enter the email id so <br />
              <span> we can send the OTP to your gmail.</span>
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

            <div className="extra-options">
              <div>
                <span>Don’t receive code ?</span>
                <button className="resend" onClick={handleResendCode}>Re-send</button>

              </div>
            </div>

            {/* LOGIN BUTTON */}
            <AuthButton 
              text="Continue" 
              onClick={handleForgot}
              type="submit"
            />
            <button className="back-button" onClick={handleBack}>
              ← Back to Login
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;