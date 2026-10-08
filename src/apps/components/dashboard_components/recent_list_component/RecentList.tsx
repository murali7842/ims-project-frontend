import './RecentList.css';
import type { ReactNode } from "react";

export interface RecentListItem {
  id: string | number;
  title: string;
  subtitle?: string;
  // Right side, e.g. a role badge
  meta?: ReactNode;
  // Small text under the meta, e.g. a date
  time?: string;
}

interface RecentListProps {
  items?: RecentListItem[];
  loading?: boolean;
  emptyText?: string;
}

const RecentList = ({ items, loading = false, emptyText = "Nothing here yet" }: RecentListProps) => {
  if (!items) {
    return <p className="recent-list-empty">{loading ? "Loading..." : emptyText}</p>;
  }

  if (items.length === 0) {
    return <p className="recent-list-empty">{emptyText}</p>;
  }

  return (
    <ul className={`recent-list ${loading ? "is-loading" : ""}`}>
      {items.map((item) => (
        <li key={item.id}>
          <div className="recent-list-avatar">{item.title.charAt(0).toUpperCase()}</div>
          <div className="recent-list-main">
            <span className="recent-list-title">{item.title}</span>
            {item.subtitle && <span className="recent-list-subtitle">{item.subtitle}</span>}
          </div>
          <div className="recent-list-side">
            {item.meta}
            {item.time && <span className="recent-list-time">{item.time}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RecentList;
