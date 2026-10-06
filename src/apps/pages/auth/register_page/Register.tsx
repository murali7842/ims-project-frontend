import './Register.css'

import authImage from "../../../../assets/auth_images/auth_image.png";
import logo from "../../../../assets/auth_images/ims_logo.png";
import emailIcon from "../../../../assets/auth_images/email_logo.png";
import userIcon from "../../../../assets/auth_images/user_icon.png";

import passwordIcon from "../../../../assets/auth_images/password_logo.png";
import eyeIcon from "../../../../assets/auth_images/invisible.png";
import LoginInput from "../../../components/auth_components/login_input_component/LoginInput";
import AuthButton from "../../../components/auth_components/button_component/AuthButton";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth/AuthApi';


const RegisterLayout = () => {

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = ()=>{
    navigate("/");
  }

  const handleRegister = async () => {
  try {
    setLoading(true);

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      name: userName,
      email: email,
      password: password,
      phone_number: phoneNumber,
      address: address,
    };

    const response = await register(payload);

    console.log("Register Success:", response);

    navigate("/");

  } catch (error: any) {
    alert(error?.response?.data?.message || "Register failed");
  } finally {
    setLoading(false);
  }
};

  return (

    <div className="register-container">
      <div className="register-left">
        <img src={authImage} alt="Auth Visual" />
      </div>

      <div className="register-right">
        <div className="register-box">

          <div className="register-header">
            <img src={logo} alt="Logo" className="logo" />
            <div className="welcome" >Welcome back!</div>
          </div>
          <div className="register-content">
            <div className="sign_in">Sign up</div>

            <p className="sub-text">
              If you already have an account register <br />
              You can <span onClick={handleLogin}>Login here !</span>
            </p>
          </div>
          <LoginInput
            label="Username"
            type="username"
            placeholder="Enter your Name"
            value={userName}
            onChange={setUserName}
            icon={userIcon}
            isActive={true}
          />
          <LoginInput
            label="Email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={setEmail}
            icon={emailIcon}
            isActive={true}
          />
          <LoginInput
            label="Phone Number"
            type="text"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={setPhoneNumber}
            icon={userIcon}
            isActive={true}
          />

          <LoginInput
            label="Address"
            type="text"
            placeholder="Enter your address"
            value={address}
            onChange={setAddress}
            icon={userIcon}
            isActive={true}
          />
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
          <LoginInput
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            icon={passwordIcon}
            eyeIcon={eyeIcon}
            showEye={true}
            onEyeClick={() => setShowPassword(!showPassword)}
          />

          <AuthButton
            text="Register"
            onClick={handleRegister}
            type="submit"
          />

        </div>
      </div>

    </div>

  );
};
export default RegisterLayout;