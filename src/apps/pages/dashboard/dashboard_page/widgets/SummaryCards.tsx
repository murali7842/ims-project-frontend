import { useCallback } from "react";
import type { IconType } from "react-icons";
import { FiHome, FiUser, FiUserCheck, FiUsers } from "react-icons/fi";

import StatCard from "../../../../components/dashboard_components/stat_card_component/StatCard";
import { useAsyncData } from "../../../../hooks/useAsyncData";
import { getDashboardSummary } from "../../../api/dashboard/DashboardApi";
import type { DashboardSummary } from "../../../api/dashboard/DashboardApi";

export type SummaryKey = keyof DashboardSummary;

const CARDS: Record<SummaryKey, { title: string; icon: IconType }> = {
  total_institutions: { title: "Institutions", icon: FiHome },
  total_operators: { title: "Operators", icon: FiUserCheck },
  total_teachers: { title: "Teachers", icon: FiUser },
  total_students: { title: "Students", icon: FiUsers },
};

interface SummaryCardsProps {
  institutionId?: number;
  // Which counts to show, in order
  cards: SummaryKey[];
}

const SummaryCards = ({ institutionId, cards }: SummaryCardsProps) => {
  const load = useCallback(() => getDashboardSummary({ institution_id: institutionId }), [institutionId]);
  const { data, error } = useAsyncData(load);

  if (error) return <p className="form-error-banner">{error}</p>;

  return (
    <div className="dashboard-stats">
      {cards.map((key) => (
        <StatCard key={key} title={CARDS[key].title} value={data?.[key] ?? "..."} icon={CARDS[key].icon} />
      ))}
    </div>
  );
};

export default SummaryCards;
