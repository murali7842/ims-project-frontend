import { useCallback } from "react";

import RelatedTable from "../../../components/common_components/related_table/RelatedTable";
import EntityLink from "../../../components/common_components/entity_link/EntityLink";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { getAllStudents } from "../../api/student/StudentApi";
import { formatCurrency } from "../../../utils/format";
import { paymentBadge, statusBadge } from "../students_page/studentBadges";

// Students enrolled in a batch, shown on the batch view page
const BatchStudents = ({ batchId }: { batchId: number }) => {
  const load = useCallback(
    () => getAllStudents({ batch_id: batchId, size: 100, sort_by: "name", sort_order: "asc" }),
    [batchId]
  );
  const { data, error, loading } = useAsyncData(load);

  return (
    <RelatedTable
      title="Students"
      rows={data?.body}
      rowKey={(student) => student.id}
      loading={loading}
      error={error}
      emptyText="No students in this batch yet"
      columns={[
        { label: "Name", render: (student) => <EntityLink module="students" item={student} /> },
        { label: "Phone", render: (student) => student.phone_number },
        { label: "Balance", render: (student) => formatCurrency(student.balance_amount) },
        { label: "Payment", render: paymentBadge },
        { label: "Status", render: statusBadge },
      ]}
    />
  );
};

export default BatchStudents;
