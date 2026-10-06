import React, { Suspense } from 'react';
import { Route, Routes } from "react-router-dom";

const Dashboard = React.lazy(() => import('../pages/dashboard/dashboard_page/Dashboard.tsx'));




const DashboardRouter = ()=> {

    return(
        <Suspense>
            <Routes>
                <Route path="" element={<Dashboard/>}/>
            </Routes>
        </Suspense>
     
    )
}

export default DashboardRouter;
