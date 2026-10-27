import { FiBookOpen, FiCalendar, FiLayers, FiUsers } from "react-icons/fi";

import StatCard from "../../../../components/dashboard_components/stat_card_component/StatCard";
import RelatedTable from "../../../../components/common_components/related_table/RelatedTable";
import EntityLink from "../../../../components/common_components/entity_link/EntityLink";
import { useAsyncData } from "../../../../hooks/useAsyncData";
import { getTeacherDashboard } from "../../../api/dashboard/DashboardApi";
import { formatEnum } from "../../../../utils/format";

// Teacher home: everything comes from GET /dashboard/teacher, which is
// scoped to the logged-in teacher's courses
const TeacherOverview = () => {
  const { data, error, loading } = useAsyncData(getTeacherDashboard);
  const value = (n?: number) => (n === undefined ? "..." : n);

  if (error) return <p className="form-error-banner">{error}</p>;

  return (
    <>
      <div className="dashboard-stats">
        <StatCard title="My Courses" value={value(data?.total_courses)} icon={FiBookOpen} />
        <StatCard title="My Batches" value={value(data?.total_batches)} icon={FiLayers} />
        <StatCard title="My Students" value={value(data?.total_students)} icon={FiUsers} />
        <StatCard title="Upcoming Exams" value={value(data?.upcoming_exams)} icon={FiCalendar} />
      </div>

      <RelatedTable
        title="My Batches"
        rows={data?.batches}
        rowKey={(batch) => batch.id}
        loading={loading}
        emptyText="No batches assigned to you yet"
        columns={[
          { label: "Batch", render: (batch) => <EntityLink module="batches" item={batch} /> },
          { label: "Course", render: (batch) => <EntityLink module="courses" item={batch.course} /> },
          { label: "Timing", render: (batch) => batch.timing },
          { label: "Mode", render: (batch) => <span className="status-badge">{formatEnum(batch.mode)}</span> },
          { label: "Start", render: (batch) => batch.start_date },
          { label: "End", render: (batch) => batch.end_date },
          { label: "Students", render: (batch) => `${batch.total_students} / ${batch.student_limit}` },
        ]}
      />

      <RelatedTable
        title="Recent Exams"
        rows={data?.recent_exams}
        rowKey={(exam) => exam.id}
        loading={loading}
        emptyText="No exams yet"
        columns={[
          { label: "Exam", render: (exam) => <EntityLink module="exams" item={{ id: exam.id, name: exam.title }} /> },
          { label: "Course", render: (exam) => <EntityLink module="courses" item={exam.course} /> },
          {
            label: "Status",
            render: (exam) => (
              <span className={`status-badge ${exam.status === "PUBLISHED" ? "green" : "amber"}`}>{formatEnum(exam.status)}</span>
            ),
          },
          { label: "Start", render: (exam) => exam.start_date ?? "-" },
          { label: "End", render: (exam) => exam.end_date ?? "-" },
        ]}
      />
    </>
  );
};

export default TeacherOverview;
