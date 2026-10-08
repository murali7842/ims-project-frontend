import './DashboardLayout.css';
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../header_component/Header";
import ErrorBoundary from "../../common_components/error_boundary/ErrorBoundary";
import Sidebar from "../sidebar_component/Sidebar";
import { SIDEBAR_MENU } from "../../../../config/sidebarConfig";
import { getUserRole } from "../../../utils/authStorage";
import { useSessionUser } from "../../../hooks/useSessionUser";

// Common shell for every dashboard: full height role-based sidebar on the left
// (logo on top toggles it), header and the active page (<Outlet />) on the right.
const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const role = getUserRole();
  // Re-renders the header when the profile is edited
  const userName = useSessionUser()?.name ?? "User";

  return (
    <div className="dashboard-layout">
      <Sidebar
        menuItems={SIDEBAR_MENU[role]}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div className="dashboard-main">
        <Header userName={userName} role={role} />

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
