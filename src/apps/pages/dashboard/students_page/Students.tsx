import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import { findOption } from "../../../components/common_components/crud_page/crudTypes";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { createStudent, deleteStudent, getAllStudents, updateStudent } from "../../api/student/StudentApi";
import type { PaymentStatus, Student, StudentPayload, StudentStatus } from "../../api/student/StudentApi";
import { getCourseOptions } from "../../api/course/CourseApi";
import { getBatchOptions } from "../../api/batch/BatchApi";
import { formatCurrency, formatEnum } from "../../../utils/format";

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  PAID: "green",
  PARTIALLY_PAID: "amber",
  UNPAID: "red",
};

// Fee, paid and balance amounts are calculated by the backend from the course fee and payments
const config: CrudPageConfig<Student, StudentPayload> = {
  title: "Students",
  entityName: "Student",
  searchPlaceholder: "Search by name, email or phone...",
  defaultSortBy: "id",
  list: getAllStudents,
  create: createStudent,
  update: updateStudent,
  remove: deleteStudent,
  lookups: {
    courses: getCourseOptions,
    batches: getBatchOptions,
  },
  filters: [
    { name: "course_id", label: "Courses", loadOptions: getCourseOptions },
    { name: "batch_id", label: "Batches", loadOptions: getBatchOptions },
  ],
  columns: [
    { key: "id", label: "ID", sortKey: "id" },
    { key: "name", label: "Name", sortKey: "name" },
    { key: "email", label: "Email", sortKey: "email" },
    { key: "phone_number", label: "Phone" },
    { key: "course_id", label: "Course", lookup: "courses" },
    { key: "batch_id", label: "Batch", lookup: "batches" },
    { key: "fee_amount", label: "Fee", render: (row) => formatCurrency(row.fee_amount) },
    { key: "paid_amount", label: "Paid", render: (row) => formatCurrency(row.paid_amount) },
    { key: "balance_amount", label: "Balance", sortKey: "balance_amount", render: (row) => formatCurrency(row.balance_amount) },
    {
      key: "payment_status",
      label: "Payment",
      render: (row) => (
        <span className={`status-badge ${PAYMENT_BADGE[row.payment_status] ?? ""}`}>{formatEnum(row.payment_status)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`status-badge ${row.status === "ACTIVE" ? "green" : ""}`}>{formatEnum(row.status)}</span>
      ),
    },
  ],
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
