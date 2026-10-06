import './Header.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown, FiLogOut, FiMenu, FiSearch } from "react-icons/fi";

import logo from "../../../../assets/auth_images/ims_logo.png";
import { clearAuth } from "../../../utils/authStorage";

interface HeaderProps {
  userName: string;
  role: string;
  onToggleSidebar: () => void;
}

const Header = ({ userName, role, onToggleSidebar }: HeaderProps) => {
  const [search, setSearch] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  return (
    <header className="dashboard-header">

      {/* LOGO */}
      <div className="header-left">
        <button className="header-icon-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <FiMenu />
        </button>
        <img src={logo} alt="IMS Logo" className="header-logo" />
      </div>

      {/* SEARCH */}
      <div className="header-search">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* NOTIFICATION + PROFILE */}
      <div className="header-right">
        <button className="header-icon-btn notification-btn" aria-label="Notifications">
          <FiBell />
          <span className="notification-dot" />
        </button>

        <div className="header-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
          <div className="profile-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <span className="profile-name">{userName}</span>
            <span className="profile-role">{role}</span>
          </div>
          <FiChevronDown />

          {showProfileMenu && (
            <div className="profile-menu">
              <button onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
