import './Dashboard.css';
import { useState } from "react";
import { FiMapPin } from "react-icons/fi";

import DashboardCard from "../../../components/dashboard_components/card_component/DashboardCard";
import SelectFilter from "../../../components/common_components/select_filter/SelectFilter";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { getUserName, getUserRole } from "../../../utils/authStorage";
import type { UserRole } from "../../../../config/sidebarConfig";
import { getDashboardInstitutions } from "../../api/dashboard/DashboardApi";
import SummaryCards from "./widgets/SummaryCards";
import type { SummaryKey } from "./widgets/SummaryCards";
import UsersByRoleCard from "./widgets/UsersByRoleCard";
import RecentInstitutionsCard from "./widgets/RecentInstitutionsCard";
import RecentUsersCard from "./widgets/RecentUsersCard";

interface OverviewConfig {
  // Admin picks an institution (or all); operators are scoped by the backend
  institutionFilter: boolean;
  summaryCards: SummaryKey[];
  recentInstitutions: boolean;
}

const OVERVIEW_CONFIG: Partial<Record<UserRole, OverviewConfig>> = {
  admin: {
    institutionFilter: true,
    summaryCards: ["total_institutions", "total_operators", "total_teachers", "total_students"],
    recentInstitutions: true,
  },
  operator: {
    institutionFilter: false,
    summaryCards: ["total_operators", "total_teachers", "total_students"],
    recentInstitutions: false,
  },
};

const DashboardOverview = ({ config }: { config: OverviewConfig }) => {
  const [institutionId, setInstitutionId] = useState("");
  // Admin: every institution (filter options). Operator: just their own (shown as a label).
  const { data: institutions } = useAsyncData(getDashboardInstitutions);

  const selectedId = institutionId ? Number(institutionId) : undefined;

  return (
    <>
      <div className="dashboard-toolbar">
        {config.institutionFilter ? (
          <SelectFilter
            label="Institution"
            value={institutionId}
            onChange={setInstitutionId}
            options={(institutions ?? []).map((institution) => ({ value: String(institution.id), label: institution.name }))}
            allLabel="All institutions"
          />
        ) : (
          institutions?.[0] && (
            <span className="dashboard-institution">
              <FiMapPin /> {institutions[0].name}
            </span>
          )
        )}
      </div>

      <SummaryCards institutionId={selectedId} cards={config.summaryCards} />

      <UsersByRoleCard institutionId={selectedId} />

      <div className={config.recentInstitutions ? "dashboard-recent" : ""}>
        {config.recentInstitutions && <RecentInstitutionsCard institutionId={selectedId} />}
        <RecentUsersCard institutionId={selectedId} />
      </div>
    </>
  );
};

const Dashboard = () => {
  const config = OVERVIEW_CONFIG[getUserRole()];

  return (
    <div className="dashboard-page">
      <h2 className="dashboard-welcome">Welcome, {getUserName()}</h2>

      {config ? (
        <DashboardOverview config={config} />
      ) : (
        // Dashboard APIs are admin / operator only
        <DashboardCard title="Overview">
          <p>Use the menu on the left to get started.</p>
        </DashboardCard>
      )}
    </div>
  );
};

export default Dashboard;
