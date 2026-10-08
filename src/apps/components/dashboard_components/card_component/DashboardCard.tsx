import './DashboardCard.css';
import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  // Controls on the right of the title, e.g. filters
  actions?: ReactNode;
  error?: string;
}

const DashboardCard = ({ title, children, className = "", actions, error }: DashboardCardProps) => {
  return (
    <section className={`dashboard-card ${className}`}>
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">{title}</h3>
        {actions && <div className="dashboard-card-actions">{actions}</div>}
      </div>
      {error ? <p className="form-error-banner">{error}</p> : <div>{children}</div>}
    </section>
  );
};

export default DashboardCard;
