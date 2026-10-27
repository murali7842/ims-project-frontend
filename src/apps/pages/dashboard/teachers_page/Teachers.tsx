import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { createTeacher, deleteTeacher, getAllTeachers, getTeacherById, updateTeacher } from "../../api/teacher/TeacherApi";
import type { Teacher, TeacherDetail, TeacherPayload } from "../../api/teacher/TeacherApi";
import { FiBookOpen, FiLayers } from "react-icons/fi";
import EntityLink from "../../../components/common_components/entity_link/EntityLink";
import RelatedTable from "../../../components/common_components/related_table/RelatedTable";
import { getInstitutionDropdownOptions } from "../../api/dashboard/DashboardApi";

const config: CrudPageConfig<Teacher, TeacherPayload, TeacherDetail> = {
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
    { key: "name", label: "Name", link: true },
    { key: "email", label: "Email" },
    { key: "phone_number", label: "Phone" },
    { key: "institution", label: "Institution", render: (row) => row.institution?.name ?? "-" },
  ],
  getById: getTeacherById,
  titleKey: "name",
  detailStats: (teacher) => [
    { label: "Courses", value: teacher.total_courses, icon: FiBookOpen },
    { label: "Batches", value: teacher.total_batches, icon: FiLayers },
  ],
  detailSections: [
    {
      title: "Teacher Details",
      fields: [
        { key: "email", label: "Email" },
        { key: "phone_number", label: "Phone Number" },
        { key: "institution", label: "Institution", render: (teacher) => <EntityLink module="institutions" item={teacher.institution} /> },
        { key: "address", label: "Address", fullWidth: true },
      ],
    },
  ],
  detailExtra: (teacher) => (
    <RelatedTable
      title="Courses & Batches"
      rows={teacher.courses}
      rowKey={(course) => course.id}
      emptyText="Not assigned to any course yet"
      columns={[
        { label: "Course", render: (course) => <EntityLink module="courses" item={course} /> },
        { label: "Batches", render: (course) => String(course.total_batches) },
        {
          label: "Batch Names",
          render: (course) =>
            course.batches.length ? (
              <span className="chip-list">
                {course.batches.map((batch) => <EntityLink key={batch.id} module="batches" item={batch} />)}
              </span>
            ) : "-",
        },
      ]}
    />
  ),
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
