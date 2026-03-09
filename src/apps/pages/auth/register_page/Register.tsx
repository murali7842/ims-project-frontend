import authImage from "../../../../assets/auth_images/auth_image.svg";


const RegisterLayout = ()=>{
  return(
    <div className="login-container">

      <div className="login-left">
        <img src={authImage} alt="Login Illustration" />
      </div>
      <div className="login-right">
        Murali
      </div>
    </div>
  )
}
export default RegisterLayout;