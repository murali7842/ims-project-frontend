import './StatCard.css';
import type { IconType } from "react-icons";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: IconType;
}

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => {
  return (
    <div className="stat-card">
      {Icon && (
        <div className="stat-card-icon">
          <Icon />
        </div>
      )}
      <div>
        <div className="stat-card-title">{title}</div>
        <div className="stat-card-value">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
