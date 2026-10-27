import { useCallback } from "react";

import DashboardCard from "../../../../components/dashboard_components/card_component/DashboardCard";
import RecentList from "../../../../components/dashboard_components/recent_list_component/RecentList";
import { useAsyncData } from "../../../../hooks/useAsyncData";
import { getRecentInstitutions } from "../../../api/dashboard/DashboardApi";
import { formatDate } from "../../../../utils/format";

interface RecentInstitutionsCardProps {
  institutionId?: number;
  limit?: number;
}

const RecentInstitutionsCard = ({ institutionId, limit = 5 }: RecentInstitutionsCardProps) => {
  const load = useCallback(() => getRecentInstitutions({ institution_id: institutionId }, limit), [institutionId, limit]);
  const { data, error, loading } = useAsyncData(load);

  return (
    <DashboardCard title="Recent Institutions" error={error}>
      <RecentList
        loading={loading}
        emptyText="No institutions yet"
        items={data?.map((institution) => ({
          id: institution.id,
          title: institution.name,
          subtitle: institution.email,
          time: formatDate(institution.created_at),
        }))}
      />
    </DashboardCard>
  );
};

export default RecentInstitutionsCard;
