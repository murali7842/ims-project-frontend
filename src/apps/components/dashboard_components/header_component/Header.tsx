import './Header.css';
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown, FiLogOut, FiSearch, FiUser } from "react-icons/fi";

import { clearAuth } from "../../../utils/authStorage";

interface HeaderProps {
  userName: string;
  role: string;
}

// The logo lives in the sidebar (clicking it toggles the sidebar)
const Header = ({ userName, role }: HeaderProps) => {
  const [search, setSearch] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close the menu on a click outside it
  useEffect(() => {
    if (!showProfileMenu) return;
    const handleClick = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showProfileMenu]);

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  return (
    <header className="dashboard-header">

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

        <div ref={profileRef} className="header-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
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
              <button onClick={() => navigate("/dashboard/profile")}>
                <FiUser /> My Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
