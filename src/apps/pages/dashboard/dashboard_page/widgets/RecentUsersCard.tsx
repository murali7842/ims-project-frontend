import { useCallback } from "react";

import DashboardCard from "../../../../components/dashboard_components/card_component/DashboardCard";
import RecentList from "../../../../components/dashboard_components/recent_list_component/RecentList";
import RoleBadge from "../../../../components/common_components/role_badge/RoleBadge";
import { useAsyncData } from "../../../../hooks/useAsyncData";
import { getRecentUsers } from "../../../api/dashboard/DashboardApi";
import { formatDate } from "../../../../utils/format";

interface RecentUsersCardProps {
  institutionId?: number;
  limit?: number;
}

const RecentUsersCard = ({ institutionId, limit = 5 }: RecentUsersCardProps) => {
  const load = useCallback(() => getRecentUsers({ institution_id: institutionId }, limit), [institutionId, limit]);
  const { data, error, loading } = useAsyncData(load);

  return (
    <DashboardCard title="Recent Users" error={error}>
      <RecentList
        loading={loading}
        emptyText="No users yet"
        items={data?.map((user) => ({
          id: user.id,
          title: user.name,
          subtitle: user.email,
          meta: <RoleBadge role={user.role} />,
          time: formatDate(user.created_at),
        }))}
      />
    </DashboardCard>
  );
};

export default RecentUsersCard;
