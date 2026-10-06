import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { createPayment, deletePayment, getAllPayments, updatePayment } from "../../api/payment/PaymentApi";
import type { Payment, PaymentPayload } from "../../api/payment/PaymentApi";
import { getStudentOptions } from "../../api/student/StudentApi";
import { formatCurrency, formatEnum, toDateInput } from "../../../utils/format";

const PAYMENT_MODES = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE"];

// Payments update the student's paid / balance amounts on the backend
const config: CrudPageConfig<Payment, PaymentPayload> = {
  title: "Payments",
  entityName: "Payment",
  searchPlaceholder: "Search payments...",
  defaultSortBy: "id",
  list: getAllPayments,
  create: createPayment,
  update: updatePayment,
  remove: deletePayment,
  lookups: {
    students: getStudentOptions,
  },
  filters: [{ name: "student_id", label: "Students", loadOptions: getStudentOptions }],
  columns: [
    { key: "id", label: "ID", sortKey: "id" },
    { key: "student_id", label: "Student", lookup: "students" },
    { key: "amount_paid", label: "Amount", sortKey: "amount_paid", render: (row) => formatCurrency(row.amount_paid) },
    { key: "payment_date", label: "Date", sortKey: "payment_date", render: (row) => toDateInput(row.payment_date) || "-" },
    { key: "payment_mode", label: "Mode", render: (row) => formatEnum(row.payment_mode) },
    { key: "remarks", label: "Remarks" },
  ],
  fields: [
    { name: "student_id", label: "Student", type: "select", required: true, loadOptions: getStudentOptions, fullWidth: true },
    { name: "amount_paid", label: "Amount", type: "number", required: true },
    { name: "payment_date", label: "Payment Date", type: "date", required: true },
    {
      name: "payment_mode",
      label: "Payment Mode",
      type: "select",
      required: true,
      options: PAYMENT_MODES.map((mode) => ({ value: mode, label: formatEnum(mode) })),
    },
    { name: "remarks", label: "Remarks", type: "textarea", required: true },
  ],
  toFormValues: (row) => ({
    student_id: String(row.student_id),
    amount_paid: String(row.amount_paid),
    payment_date: toDateInput(row.payment_date),
    // Older records may use other casing, e.g. "Cash"
    payment_mode: row.payment_mode?.toUpperCase() ?? "",
    remarks: row.remarks ?? "",
  }),
  toPayload: (values) => ({
    student_id: Number(values.student_id),
    amount_paid: Number(values.amount_paid),
    payment_date: `${values.payment_date}T00:00:00`,
    payment_mode: values.payment_mode,
    remarks: values.remarks.trim(),
  }),
};

const Payments = () => <CrudPage config={config} />;

export default Payments;
