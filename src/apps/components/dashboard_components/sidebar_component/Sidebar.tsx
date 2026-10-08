import './Sidebar.css';
import { NavLink } from "react-router-dom";
import type { MenuItem } from "../../../../config/sidebarConfig";
import logo from "../../../../assets/auth_images/ims_logo.png";

interface SidebarProps {
  menuItems: MenuItem[];
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ menuItems, collapsed, onToggle }: SidebarProps) => {
  return (
    <aside className={`dashboard-sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* LOGO (click to collapse / expand) */}
      <button
        className="sidebar-brand"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <img src={logo} alt="IMS Logo" />
      </button>

      <nav>
        {menuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={label}
            to={path ? `/dashboard/${path}` : "/dashboard"}
            end={!path}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            title={collapsed ? label : undefined}
          >
            <Icon className="sidebar-icon" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
