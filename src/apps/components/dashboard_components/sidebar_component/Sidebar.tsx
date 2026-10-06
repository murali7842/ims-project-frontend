import './Sidebar.css';
import { NavLink } from "react-router-dom";
import type { MenuItem } from "../../../../config/sidebarConfig";

interface SidebarProps {
  menuItems: MenuItem[];
  collapsed: boolean;
}

const Sidebar = ({ menuItems, collapsed }: SidebarProps) => {
  return (
    <aside className={`dashboard-sidebar ${collapsed ? "collapsed" : ""}`}>
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
