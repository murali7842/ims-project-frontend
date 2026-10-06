import "./ResetPassword.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import authImage from "../../../../assets/auth_images/auth_image.png";
import logo from "../../../../assets/auth_images/ims_logo.png";
import passwordIcon from "../../../../assets/auth_images/password_logo.png";
import eyeIcon from "../../../../assets/auth_images/invisible.png";

import AuthButton from "../../../components/auth_components/button_component/AuthButton";
import LoginInput from "../../../components/auth_components/login_input_component/LoginInput";

import { resetPassword } from "../../api/auth/AuthApi";

const ResetPassword = () => {
22
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        const storedEmail = localStorage.getItem("resetEmail");

        if (storedEmail) {
            setEmail(storedEmail);
        }

    }, []);

    const handleOtpChange = (index: number, value: string) => {

        if (value.length <= 1 && /^\d*$/.test(value)) {

            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // auto focus next
            if (value && index < 5) {
                const nextInput = document.getElementById(
                    `otp-input-${index + 1}`
                );

                nextInput?.focus();
            }
        }
    };

    const handleResetPassword = async () => {

        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            alert("Please enter valid OTP");
            return;
        }

        if (!newPassword || !confirmPassword) {
            alert("Password fields are mandatory");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {

            setLoading(true);

            const payload = {
                email,
                otp: otpValue,
                new_password: newPassword
            };

            const response = await resetPassword(payload);

            console.log("Password Reset Success:", response);

            alert("Password reset successful");

            navigate("/");

        } catch (error: any) {

            alert(
                error?.response?.data?.msg ||
                "Password reset failed"
            );

        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate("/");
    };

    return (

        <div className="verify-container">

            {/* LEFT */}
            <div className="verify-left">
                <img src={authImage} alt="Auth Visual" />
            </div>

            {/* RIGHT */}
            <div className="verify-right">

                <div className="login-box">

                    {/* HEADER */}
                    <div className="verify-header">
                        <img src={logo} alt="Logo" className="logo" />
                    </div>

                    {/* CONTENT */}
                    <div className="verify-content">

                        <div className="verificaion_line">
                            RESET PASSWORD
                        </div>

                        <p className="sub-text">
                            Enter OTP and new password
                        </p>

                        {/* OTP INPUTS */}
                        <div className="otp-inputs">

                            {otp.map((digit, index) => (

                                <input
                                    key={index}
                                    id={`otp-input-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) =>
                                        handleOtpChange(index, e.target.value)
                                    }
                                    className="otp-input"
                                />
                            ))}

                        </div>

                        {/* NEW PASSWORD */}
                        <LoginInput
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={setNewPassword}
                            icon={passwordIcon}
                            eyeIcon={eyeIcon}
                            showEye={true}
                            onEyeClick={() =>
                                setShowPassword(!showPassword)
                            }
                        />

                        {/* CONFIRM PASSWORD */}
                        <LoginInput
                            label="Confirm Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            icon={passwordIcon}
                            eyeIcon={eyeIcon}
                            showEye={true}
                            onEyeClick={() =>
                                setShowPassword(!showPassword)
                            }
                        />

                        {/* BUTTON */}
                        <AuthButton
                            text={loading ? "Please wait..." : "Reset Password"}
                            onClick={handleResetPassword}
                            type="submit"
                        />

                        {/* BACK */}
                        <button
                            className="back-button"
                            onClick={handleBack}
                        >
                            ← Back to Login
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;