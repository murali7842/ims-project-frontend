import './DashboardCard.css';
import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const DashboardCard = ({ title, children, className = "" }: DashboardCardProps) => {
  return (
    <section className={`dashboard-card ${className}`}>
      <h3 className="dashboard-card-title">{title}</h3>
      <div>{children}</div>
    </section>
  );
};

export default DashboardCard;
