import React, { Suspense } from 'react';
import { Route, Routes } from "react-router-dom";

const Login = React.lazy(() => import('../pages/auth/login_page/Login.tsx'));
const Register = React.lazy(() => import('../pages/auth/register_page/Register.tsx'));




const AuthRouter = ()=> {

    return(
        <Suspense>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
            </Routes>
        </Suspense>
     
    )
}

export default AuthRouter;
