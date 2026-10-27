import type { PaymentStatus, StudentStatus } from "../../api/student/StudentApi";
import { formatEnum } from "../../../utils/format";

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  PAID: "green",
  PARTIALLY_PAID: "amber",
  UNPAID: "red",
};

// Used by the student list, the student view page and the batch's student list
export const paymentBadge = (student: { payment_status: PaymentStatus }) => (
  <span className={`status-badge ${PAYMENT_BADGE[student.payment_status] ?? ""}`}>{formatEnum(student.payment_status)}</span>
);

export const statusBadge = (student: { status: StudentStatus }) => (
  <span className={`status-badge ${student.status === "ACTIVE" ? "green" : ""}`}>{formatEnum(student.status)}</span>
);
