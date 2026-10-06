import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { deleteUser, getAllUsers, updateUser } from "../../api/user/UserApi";
import type { BackendUserRole, User, UserUpdatePayload } from "../../api/user/UserApi";

const ROLE_BADGE: Record<BackendUserRole, string> = {
  ADMIN: "red",
  OPERATOR: "blue",
  TEACHER: "amber",
  STUDENT: "green",
};

// Users are created through registration or the operator / teacher / student
// screens, so this page only lists, edits and deletes.
const config: CrudPageConfig<User, UserUpdatePayload> = {
  title: "Users",
  entityName: "User",
  searchPlaceholder: "Search by name or email...",
  defaultSortBy: "id",
  list: getAllUsers,
  update: updateUser,
  remove: deleteUser,
  filters: [
    {
      name: "role",
      label: "Roles",
      options: [
        { value: "ADMIN", label: "Admin" },
        { value: "OPERATOR", label: "Operator" },
        { value: "TEACHER", label: "Teacher" },
        { value: "STUDENT", label: "Student" },
      ],
    },
  ],
  columns: [
    { key: "id", label: "ID", sortKey: "id" },
    { key: "name", label: "Name", sortKey: "name" },
    { key: "email", label: "Email", sortKey: "email" },
    { key: "phone_number", label: "Phone" },
    {
      key: "role",
      label: "Role",
      sortKey: "role",
      render: (row) => <span className={`status-badge ${ROLE_BADGE[row.role] ?? ""}`}>{row.role.toLowerCase()}</span>,
    },
    { key: "institution", label: "Institution", render: (row) => row.institution?.name ?? "-" },
  ],
  fields: [
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone_number", label: "Phone Number", required: true },
    { name: "address", label: "Address", type: "textarea", required: true },
  ],
};

const Users = () => <CrudPage config={config} />;

export default Users;
