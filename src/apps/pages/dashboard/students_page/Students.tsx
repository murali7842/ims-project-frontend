import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import { findOption } from "../../../components/common_components/crud_page/crudTypes";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { createStudent, deleteStudent, getAllStudents, getStudentById, updateStudent } from "../../api/student/StudentApi";
import type { Student, StudentDetail, StudentPayload, StudentStatus } from "../../api/student/StudentApi";
import EntityLink from "../../../components/common_components/entity_link/EntityLink";
import { paymentBadge, statusBadge } from "./studentBadges";
import { getCourseOptions } from "../../api/course/CourseApi";
import { getBatchOptions } from "../../api/batch/BatchApi";
import { getInstitutionDropdownOptions } from "../../api/dashboard/DashboardApi";
import StudentPayments from "./StudentPayments";
import { getUserRole } from "../../../utils/authStorage";
import { formatCurrency } from "../../../utils/format";

// Fee, paid and balance amounts are calculated by the backend from the course fee and payments
const config: CrudPageConfig<Student, StudentPayload, StudentDetail> = {
  title: "Students",
  entityName: "Student",
  searchPlaceholder: "Search by name, email or phone...",
  defaultSortBy: "id",
  list: getAllStudents,
  institutionScoped: true,
  create: createStudent,
  update: updateStudent,
  remove: deleteStudent,
  lookups: {
    courses: getCourseOptions,
    batches: getBatchOptions,
    institutions: getInstitutionDropdownOptions,
  },
  filters: [
    { name: "course_id", label: "Courses", loadOptions: getCourseOptions },
    { name: "batch_id", label: "Batches", loadOptions: getBatchOptions },
  ],
  columns: [
    { key: "name", label: "Name", sortKey: "name", link: true },
    { key: "course_id", label: "Course", lookup: "courses" },
    { key: "batch_id", label: "Batch", lookup: "batches" },
    { key: "balance_amount", label: "Balance", sortKey: "balance_amount", render: (row) => formatCurrency(row.balance_amount) },
    { key: "payment_status", label: "Payment", render: paymentBadge },
    { key: "status", label: "Status", render: statusBadge },
  ],
  getById: getStudentById,
  // Edit form uses ids; the detail has { id, name } objects
  detailToRow: ({ course, batch, institution, ...student }) => ({
    ...student,
    course_id: course?.id ?? 0,
    batch_id: batch?.id ?? 0,
    institution_id: institution?.id ?? 0,
  }),
  titleKey: "name",
  detailSections: [
    {
      title: "Personal Details",
      fields: [
        { key: "email", label: "Email" },
        { key: "phone_number", label: "Phone Number" },
        { key: "status", label: "Status", render: statusBadge },
        { key: "address", label: "Address", fullWidth: true },
      ],
    },
    {
      title: "Guardian",
      fields: [
        { key: "guardian_name", label: "Guardian Name" },
        { key: "guardian_phone", label: "Guardian Phone" },
      ],
    },
    {
      title: "Enrollment",
      fields: [
        { key: "course", label: "Course", render: (student) => <EntityLink module="courses" item={student.course} /> },
        { key: "batch", label: "Batch", render: (student) => <EntityLink module="batches" item={student.batch} /> },
        { key: "institution", label: "Institution", render: (student) => <EntityLink module="institutions" item={student.institution} /> },
      ],
    },
    {
      title: "Fees",
      fields: [
        { key: "fee_amount", label: "Course Fee", render: (row) => formatCurrency(row.fee_amount) },
        { key: "paid_amount", label: "Paid", render: (row) => formatCurrency(row.paid_amount) },
        { key: "balance_amount", label: "Balance", render: (row) => formatCurrency(row.balance_amount) },
        { key: "payment_status", label: "Payment Status", render: paymentBadge },
      ],
    },
  ],
  // Payments API is admin / operator only; teachers still see the fee totals above
  detailExtra: (student) => (getUserRole() === "teacher" ? null : <StudentPayments studentId={student.id} />),
  fields: [
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone_number", label: "Phone Number", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
      ],
    },
    { name: "course_id", label: "Course", type: "select", required: true, loadOptions: getCourseOptions },
    { name: "batch_id", label: "Batch", type: "select", required: true, loadOptions: getBatchOptions, dependsOn: "course_id" },
    { name: "guardian_name", label: "Guardian Name", required: true },
    { name: "guardian_phone", label: "Guardian Phone", required: true },
    { name: "address", label: "Address", type: "textarea", required: true },
  ],
  toFormValues: (row) => ({
    name: row.name,
    email: row.email,
    phone_number: row.phone_number,
    status: row.status,
    course_id: String(row.course_id),
    batch_id: String(row.batch_id),
    guardian_name: row.guardian_name ?? "",
    guardian_phone: row.guardian_phone ?? "",
    address: row.address,
  }),
  // The backend requires the batch to belong to the same course and institution,
  // so the institution is taken from the selected batch.
  toPayload: (values, options) => ({
    name: values.name.trim(),
    email: values.email.trim(),
    phone_number: values.phone_number.trim(),
    address: values.address.trim(),
    guardian_name: values.guardian_name.trim(),
    guardian_phone: values.guardian_phone.trim(),
    status: values.status as StudentStatus,
    course_id: Number(values.course_id),
    batch_id: Number(values.batch_id),
    institution_id: Number(findOption(options, "batch_id", values.batch_id)?.data?.institution_id),
  }),
};

const Students = () => <CrudPage config={config} />;

export default Students;
