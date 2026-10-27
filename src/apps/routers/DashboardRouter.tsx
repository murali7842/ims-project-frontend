import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from './ProtectedRoute.tsx';
import DashboardLayout from '../components/dashboard_components/layout_component/DashboardLayout.tsx';
import { SIDEBAR_MENU } from '../../config/sidebarConfig.ts';
import { getUserRole } from '../utils/authStorage.ts';

const Dashboard = React.lazy(() => import('../pages/dashboard/dashboard_page/Dashboard.tsx'));
const ModulePage = React.lazy(() => import('../pages/dashboard/module_page/ModulePage.tsx'));
const Profile = React.lazy(() => import('../pages/dashboard/profile_page/Profile.tsx'));

// Register real module pages here as they are built, keyed by sidebar path.
// Any sidebar item without an entry falls back to ModulePage.
const MODULE_PAGES: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
    institutions: React.lazy(() => import('../pages/dashboard/institutions_page/Institutions.tsx')),
    operators: React.lazy(() => import('../pages/dashboard/operators_page/Operators.tsx')),
    users: React.lazy(() => import('../pages/dashboard/users_page/Users.tsx')),
    teachers: React.lazy(() => import('../pages/dashboard/teachers_page/Teachers.tsx')),
    courses: React.lazy(() => import('../pages/dashboard/courses_page/Courses.tsx')),
    batches: React.lazy(() => import('../pages/dashboard/batches_page/Batches.tsx')),
    students: React.lazy(() => import('../pages/dashboard/students_page/Students.tsx')),
    payments: React.lazy(() => import('../pages/dashboard/payments_page/Payments.tsx')),
    exams: React.lazy(() => import('../pages/dashboard/exams_page/Exams.tsx')),
};


const DashboardRouter = ()=> {

    // Only routes in the current role's sidebar are registered, so other
    // roles' pages redirect back to the dashboard home.
    const modules = SIDEBAR_MENU[getUserRole()].filter((item) => item.path);

    return(
        <Suspense>
            <Routes>
                <Route element={<ProtectedRoute/>}>
                    <Route element={<DashboardLayout/>}>
                        <Route index element={<Dashboard/>}/>
                        {/* Every role, opened from the header profile menu */}
                        <Route path="profile" element={<Profile/>}/>
                        {modules.map(({ path, label }) => {
                            const Page = MODULE_PAGES[path];
                            return (
                                <Route
                                    key={path}
                                    // "/*" lets a module have its own sub pages (e.g. exams/new)
                                    path={`${path}/*`}
                                    element={Page ? <Page/> : <ModulePage title={label}/>}
                                />
                            );
                        })}
                        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
                    </Route>
                </Route>
            </Routes>
        </Suspense>

    )
}

export default DashboardRouter;
