import { useCallback } from "react";

import RelatedTable from "../../../components/common_components/related_table/RelatedTable";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { getAllPayments } from "../../api/payment/PaymentApi";
import { formatCurrency, formatEnum, toDateInput } from "../../../utils/format";

// Payment history shown on a student's view page
const StudentPayments = ({ studentId }: { studentId: number }) => {
  const load = useCallback(
    () => getAllPayments({ student_id: studentId, size: 50, sort_by: "payment_date", sort_order: "desc" }),
    [studentId]
  );
  const { data, error, loading } = useAsyncData(load);

  return (
    <RelatedTable
      title="Payment History"
      rows={data?.body}
      rowKey={(payment) => payment.id}
      loading={loading}
      error={error}
      emptyText="No payments yet"
      columns={[
        { label: "Date", render: (payment) => toDateInput(payment.payment_date) || "-" },
        { label: "Amount", render: (payment) => formatCurrency(payment.amount_paid) },
        { label: "Mode", render: (payment) => formatEnum(payment.payment_mode) },
        { label: "Remarks", render: (payment) => payment.remarks || "-" },
      ]}
    />
  );
};

export default StudentPayments;
