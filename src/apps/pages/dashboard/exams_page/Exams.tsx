import React from 'react';
import { Route, Routes, useNavigate } from "react-router-dom";

import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { deleteAssessment, getAllAssessments } from "../../api/assessment/AssessmentApi";
import type { Assessment } from "../../api/assessment/AssessmentApi";
import { getCourseOptions } from "../../api/course/CourseApi";
import { formatEnum } from "../../../utils/format";

const AssessmentEditor = React.lazy(() => import('./AssessmentEditor.tsx'));

// Create / edit happen in AssessmentEditor (sections and questions don't fit a modal)
const config: CrudPageConfig<Assessment> = {
  title: "Exams",
  entityName: "Exam",
  searchPlaceholder: "Search exams...",
  defaultSortBy: "id",
  list: getAllAssessments,
  remove: deleteAssessment,
  fields: [],
  filters: [
    {
      name: "status",
      label: "Statuses",
      options: [
        { value: "PUBLISHED", label: "Published" },
        { value: "DRAFT", label: "Draft" },
      ],
    },
    { name: "course_id", label: "Courses", loadOptions: getCourseOptions },
  ],
  columns: [
    { key: "id", label: "ID", sortKey: "id" },
    { key: "title", label: "Title", sortKey: "title" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`status-badge ${row.status === "PUBLISHED" ? "green" : "amber"}`}>{formatEnum(row.status)}</span>
      ),
    },
    { key: "start_date", label: "Start Date", sortKey: "start_date", render: (row) => row.start_date ?? "-" },
    { key: "end_date", label: "End Date", sortKey: "end_date", render: (row) => row.end_date ?? "-" },
    { key: "passing_marks", label: "Passing Marks", render: (row) => row.passing_marks ?? "-" },
  ],
};

const ExamList = () => {
  const navigate = useNavigate();

  return (
    <CrudPage
      config={config}
      onAdd={() => navigate("/dashboard/exams/new")}
      onEdit={(row) => navigate(`/dashboard/exams/${row.id}`)}
    />
  );
};

const Exams = () => (
  <Routes>
    <Route index element={<ExamList />} />
    <Route path="new" element={<AssessmentEditor />} />
    <Route path=":assessmentId" element={<AssessmentEditor />} />
  </Routes>
);

export default Exams;
