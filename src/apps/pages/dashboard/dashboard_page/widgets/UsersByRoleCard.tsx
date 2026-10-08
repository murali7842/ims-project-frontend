import { useCallback, useState } from "react";

import DashboardCard from "../../../../components/dashboard_components/card_component/DashboardCard";
import BarChart from "../../../../components/dashboard_components/bar_chart_component/BarChart";
import SelectFilter from "../../../../components/common_components/select_filter/SelectFilter";
import { useAsyncData } from "../../../../hooks/useAsyncData";
import { getUsersByRole } from "../../../api/dashboard/DashboardApi";
import { formatEnum } from "../../../../utils/format";

const YEARS_BACK = 5;
const currentYear = new Date().getFullYear();

const YEAR_OPTIONS = Array.from({ length: YEARS_BACK }, (_, i) => {
  const year = String(currentYear - i);
  return { value: year, label: year };
});

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i, 1).toLocaleString("en-IN", { month: "long" }),
}));

interface UsersByRoleCardProps {
  institutionId?: number;
}

// Users created per role, optionally limited to a year or a month (backend needs year when month is set)
const UsersByRoleCard = ({ institutionId }: UsersByRoleCardProps) => {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const load = useCallback(
    () =>
      getUsersByRole({
        institution_id: institutionId,
        year: year ? Number(year) : undefined,
        month: year && month ? Number(month) : undefined,
      }),
    [institutionId, year, month]
  );
  const { data, error, loading } = useAsyncData(load);

  const handleYearChange = (value: string) => {
    setYear(value);
    if (!value) setMonth("");
  };

  return (
    <DashboardCard
      title="Users by Role"
      error={error}
      actions={
        <>
          <SelectFilter label="Year" value={year} options={YEAR_OPTIONS} onChange={handleYearChange} allLabel="All time" />
          <SelectFilter
            label="Month"
            value={month}
            options={MONTH_OPTIONS}
            onChange={setMonth}
            allLabel="All months"
            disabled={!year}
          />
        </>
      }
    >
      <div style={{ opacity: loading && data ? 0.5 : 1 }}>
        {data ? (
          <BarChart data={data.map((item) => ({ label: formatEnum(item.role), value: item.count }))} />
        ) : (
          <p className="bar-chart-empty">Loading...</p>
        )}
      </div>
    </DashboardCard>
  );
};

export default UsersByRoleCard;
