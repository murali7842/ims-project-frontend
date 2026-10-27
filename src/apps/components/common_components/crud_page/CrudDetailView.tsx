import './CrudDetailView.css';
import type { ReactNode } from "react";
import { FiArrowLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
import StatCard from "../../dashboard_components/stat_card_component/StatCard";
import type { DetailStat } from "./crudTypes";

export interface DetailViewSection {
  title: string;
  fields: { label: string; value: ReactNode; fullWidth?: boolean }[];
}

interface CrudDetailViewProps {
  entityName: string;
  title?: string;
  subtitle?: string;
  stats?: DetailStat[];
  sections: DetailViewSection[];
  extra?: ReactNode;
  loading: boolean;
  error: string;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Read-only view of one record: header with actions, then labelled sections
const CrudDetailView = ({
  entityName,
  title,
  subtitle,
  stats,
  sections,
  extra,
  loading,
  error,
  onBack,
  onEdit,
  onDelete,
}: CrudDetailViewProps) => {
  return (
    <div className="detail-view">
      <div className="detail-header">
        <button className="detail-back" onClick={onBack} aria-label="Back to list" title="Back to list">
          <FiArrowLeft />
        </button>

        <div className="detail-heading">
          {title && <div className="detail-avatar">{title.charAt(0).toUpperCase()}</div>}
          <div>
            <h2>{title ?? (loading ? "Loading..." : entityName)}</h2>
            {subtitle && <span className="detail-subtitle">{subtitle}</span>}
          </div>
        </div>

        {!loading && !error && (onEdit || onDelete) && (
          <div className="detail-actions">
            {onEdit && (
              <button className="btn-outline-grey" onClick={onEdit}>
                <FiEdit2 /> Edit
              </button>
            )}
            {onDelete && (
              <button className="btn-danger-red" onClick={onDelete}>
                <FiTrash2 /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="form-error-banner">{error}</p>}

      {loading && !error && <p className="detail-loading">Loading {entityName.toLowerCase()} details...</p>}

      {!loading && !error && stats && stats.length > 0 && (
        <div className="detail-stats">
          {stats.map((stat) => (
            <StatCard key={stat.label} title={stat.label} value={stat.value as string | number} icon={stat.icon} />
          ))}
        </div>
      )}

      {!loading &&
        !error &&
        sections.map((section) => (
          <section key={section.title} className="detail-card">
            <h3>{section.title}</h3>
            <dl className="detail-grid">
              {section.fields.map((field) => (
                <div key={field.label} className={`detail-field ${field.fullWidth ? "full-width" : ""}`}>
                  <dt>{field.label}</dt>
                  <dd>{field.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

      {!loading && !error && extra}
    </div>
  );
};

export default CrudDetailView;
