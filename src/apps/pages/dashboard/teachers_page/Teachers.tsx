import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { createTeacher, deleteTeacher, getAllTeachers, updateTeacher } from "../../api/teacher/TeacherApi";
import type { Teacher, TeacherPayload } from "../../api/teacher/TeacherApi";
import { getInstitutionDropdownOptions } from "../../api/dashboard/DashboardApi";

const config: CrudPageConfig<Teacher, TeacherPayload> = {
  title: "Teachers",
  entityName: "Teacher",
  searchPlaceholder: "Search by name or email...",
  list: getAllTeachers,
  institutionScoped: true,
  create: createTeacher,
  update: updateTeacher,
  remove: deleteTeacher,
  // The teachers API has no sorting
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone_number", label: "Phone" },
    { key: "institution", label: "Institution", render: (row) => row.institution?.name ?? "-" },
    { key: "address", label: "Address" },
  ],
  fields: [
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true, mode: "create" },
    { name: "phone_number", label: "Phone Number", required: true },
    { name: "institution_id", label: "Institution", type: "select", required: true, loadOptions: getInstitutionDropdownOptions },
    { name: "address", label: "Address", type: "textarea", required: true },
  ],
  toFormValues: (row) => ({
    name: row.name,
    email: row.email,
    phone_number: row.phone_number,
    address: row.address,
    institution_id: row.institution ? String(row.institution.id) : "",
  }),
  toPayload: (values) => ({
    name: values.name.trim(),
    email: values.email.trim(),
    phone_number: values.phone_number.trim(),
    address: values.address.trim(),
    institution_id: Number(values.institution_id),
    ...(values.password ? { password: values.password } : {}),
  }),
};

const Teachers = () => <CrudPage config={config} />;

export default Teachers;
