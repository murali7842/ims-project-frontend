import './DashboardLayout.css';
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../header_component/Header";
import ErrorBoundary from "../../common_components/error_boundary/ErrorBoundary";
import Sidebar from "../sidebar_component/Sidebar";
import { SIDEBAR_MENU } from "../../../../config/sidebarConfig";
import { getUserName, getUserRole } from "../../../utils/authStorage";

// Common shell for every dashboard: header on top, role-based sidebar on the
// left, and the active page rendered in the content area via <Outlet />.
const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const role = getUserRole();
  const userName = getUserName();

  return (
    <div className="dashboard-layout">
      <Header
        userName={userName}
        role={role}
        onToggleSidebar={() => setCollapsed(!collapsed)}
      />

      <div className="dashboard-body">
        <Sidebar menuItems={SIDEBAR_MENU[role]} collapsed={collapsed} />

        <main className="dashboard-content">
          <ErrorBoundary resetKey={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
