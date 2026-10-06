import './Dashboard.css';
import { useEffect, useState } from "react";
import { FiHome, FiUserCheck, FiUsers } from "react-icons/fi";

import StatCard from "../../../components/dashboard_components/stat_card_component/StatCard";
import DashboardCard from "../../../components/dashboard_components/card_component/DashboardCard";
import { getUserName, getUserRole } from "../../../utils/authStorage";
import { getErrorMessage } from "../../../utils/apiError";
import { getAllInstitutions } from "../../api/institution/InstitutionApi";
import type { Institution } from "../../api/institution/InstitutionApi";
import { getAllOperators } from "../../api/operator/OperatorApi";
import { getAllUsers } from "../../api/user/UserApi";
import type { User } from "../../api/user/UserApi";

const USER_ROLES = ["ADMIN", "OPERATOR", "TEACHER", "STUDENT"] as const;
const RECENT_LIMIT = 5;

interface AdminSummary {
  institutionCount: number;
  operatorCount: number;
  userCount: number;
  usersByRole: { role: string; count: number }[];
  recentInstitutions: Institution[];
  recentUsers: User[];
}

// Counts come from total_elements, so only one row is requested
const countOf = async (request: Promise<{ total_elements: number }>) => (await request).total_elements;

const loadAdminSummary = async (): Promise<AdminSummary> => {
  const [institutions, operatorCount, users, ...roleCounts] = await Promise.all([
    getAllInstitutions({ size: RECENT_LIMIT, sort_by: "id", sort_order: "desc" }),
    countOf(getAllOperators({ size: 1 })),
    getAllUsers({ size: RECENT_LIMIT, sort_by: "id", sort_order: "desc" }),
    ...USER_ROLES.map((role) => countOf(getAllUsers({ size: 1, role }))),
  ]);

  return {
    institutionCount: institutions.total_elements,
    operatorCount,
    userCount: users.total_elements,
    usersByRole: USER_ROLES.map((role, index) => ({ role, count: roleCounts[index] })),
    recentInstitutions: institutions.body,
    recentUsers: users.body,
  };
};

const AdminOverview = () => {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    loadAdminSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load dashboard"));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="form-error-banner">{error}</p>;

  const loadingText = "...";
  const maxRoleCount = Math.max(1, ...(summary?.usersByRole.map((item) => item.count) ?? []));

  return (
    <>
      {/* STATS */}
      <div className="dashboard-stats">
        <StatCard title="Institutions" value={summary?.institutionCount ?? loadingText} icon={FiHome} />
        <StatCard title="Operators" value={summary?.operatorCount ?? loadingText} icon={FiUserCheck} />
        <StatCard title="Users" value={summary?.userCount ?? loadingText} icon={FiUsers} />
      </div>

      {/* USERS BY ROLE */}
      <DashboardCard title="Users by Role">
        <div className="growth-chart">
          {summary?.usersByRole.map(({ role, count }) => (
            <div key={role} className="growth-bar-wrapper">
              <span className="growth-value">{count.toLocaleString()}</span>
              <div className="growth-bar" style={{ height: `${(count / maxRoleCount) * 100}%` }} />
              <span className="growth-label">{role.charAt(0) + role.slice(1).toLowerCase()}</span>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* RECENT LISTS */}
      <div className="dashboard-recent">
        <DashboardCard title="Recent Institutions">
          <ul className="dashboard-list">
            {summary?.recentInstitutions.map((institution) => (
              <li key={institution.id}>
                <span>{institution.name}</span>
                <span className="dashboard-list-meta">{institution.email}</span>
              </li>
            ))}
            {summary?.recentInstitutions.length === 0 && <li className="dashboard-list-meta">No institutions yet</li>}
          </ul>
        </DashboardCard>

        <DashboardCard title="Recent Users">
          <ul className="dashboard-list">
            {summary?.recentUsers.map((user) => (
              <li key={user.id}>
                <span>{user.name}</span>
                <span className="dashboard-list-meta">{user.role.toLowerCase()}</span>
              </li>
            ))}
            {summary?.recentUsers.length === 0 && <li className="dashboard-list-meta">No users yet</li>}
          </ul>
        </DashboardCard>
      </div>
    </>
  );
};

const Dashboard = () => {
  const userName = getUserName();
  const role = getUserRole();

  return (
    <div className="dashboard-page">
      <h2 className="dashboard-welcome">Welcome, {userName}</h2>

      {/* TODO: operator / teacher / student overviews as their modules are built */}
      {role === "admin" ? (
        <AdminOverview />
      ) : (
        <DashboardCard title="Overview">
          <p>Use the menu on the left to get started.</p>
        </DashboardCard>
      )}
    </div>
  );
};

export default Dashboard;
