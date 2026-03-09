import { useState } from "react";
import LoginInput from "../login_input_component/LoginInput";
import AuthButton from "../button_component/AuthButton";
import { login } from "../../../pages/api/auth/AuthApi";
import { useNavigate } from "react-router-dom";



const LoginForm =()=>{

      const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

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

      // Example: save token
      localStorage.setItem("token", response.access_token);
      navigate("/register")

    } catch (error: any) {
      alert(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };


    return(
        <div className="login-form">
            <div className="welcome-back">Welcome back!</div>
            <div className="sign-in">Sign in</div>
            <div className="register-here">If you don’t have an account register</div>
            <div>You can Register here!</div>

            <LoginInput
             label="Email"
             type="email"
             placeholder="Enter your email address"
             value={email}
             onChange={setEmail}
            />
            <LoginInput
             label="Password"
             type="password"
             placeholder="Enter your password"
             value={password}
             onChange={setPassword}
            />

            <div className="login-options">
        <label>
          <input type="checkbox" /> Remember me
        </label>
        <span className="forgot">Forgot Password?</span>
      </div>
      <AuthButton text="Login"
        onClick={handleLogin}/>
        </div>

      // <div className="login-form-container">
      // <div className="login-header">
      //   <div className="logo">
      //     <span className="logo-text">LMS</span>
      //   </div>
      //   <h1 className="welcome-title">Welcome back!</h1>
      //   <div className="signin-header">
      //     <h2>Sign in</h2>
      //   </div>
      //   <p className="register-text">
      //     If you don't have an account register{' '}
      //     <br />
      //     You can{' '}
      //     <a href="/register" className="register-link">
      //       Register here !
      //     </a>
      //   </p>
      // </div>

      // <div className="login-form">
      //   <LoginInput
      //     label="Email"
      //     type="email"
      //     placeholder="Enter your email address"
      //     value={email}
      //     onChange={setEmail}
      //     icon="✉"
      //   />

      //   <LoginInput
      //     label="Password"
      //     type="password"
      //     placeholder="Enter your Password"
      //     value={password}
      //     onChange={setPassword}
      //     icon="🔒"
      //   />

      //   <div className="form-options">
      //     <label className="remember-me">
      //       <input
      //         type="checkbox"
      //         checked={rememberMe}
      //         onChange={(e) => setRememberMe(e.target.checked)}
      //       />
      //       <span>Remember me</span>
      //     </label>
      //     <a href="/forgot-password" className="forgot-password">
      //       Forgot Password ?
      //     </a>
      //   </div>

      //   <AuthButton text="Login" onClick={handleLogin} />
      // </div>
      // </div>
    )

}
export default LoginForm;