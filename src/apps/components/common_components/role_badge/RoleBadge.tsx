import type { BackendUserRole } from "../../../pages/api/user/UserApi";

// Colour classes from .status-badge in index.css
const ROLE_COLOR: Record<BackendUserRole, string> = {
  ADMIN: "red",
  OPERATOR: "blue",
  TEACHER: "amber",
  STUDENT: "green",
};

const RoleBadge = ({ role }: { role: BackendUserRole }) => (
  <span className={`status-badge ${ROLE_COLOR[role] ?? ""}`}>{role.toLowerCase()}</span>
);

export default RoleBadge;
