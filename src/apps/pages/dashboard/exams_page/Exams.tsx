import React from 'react';
import { Route, Routes, useNavigate } from "react-router-dom";

import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { deleteAssessment, getAllAssessments, getAssessmentById } from "../../api/assessment/AssessmentApi";
import type { Assessment, AssessmentDetail } from "../../api/assessment/AssessmentApi";
import { getCourseOptions } from "../../api/course/CourseApi";
import { formatEnum } from "../../../utils/format";
import ExamQuestions from "./ExamQuestions";

const AssessmentEditor = React.lazy(() => import('./AssessmentEditor.tsx'));

const statusBadge = (exam: Assessment) => (
  <span className={`status-badge ${exam.status === "PUBLISHED" ? "green" : "amber"}`}>{formatEnum(exam.status)}</span>
);

// Create / edit happen in AssessmentEditor (sections and questions don't fit a modal)
const config: CrudPageConfig<Assessment, Record<string, unknown>, AssessmentDetail> = {
  title: "Exams",
  entityName: "Exam",
  searchPlaceholder: "Search exams...",
  defaultSortBy: "id",
  list: getAllAssessments,
  remove: deleteAssessment,
  // Teachers can add and edit exams for their own courses; only admins / operators delete
  editableBy: ["admin", "operator", "teacher"],
  fields: [],
  lookups: {
    courses: getCourseOptions,
  },
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
    { key: "title", label: "Title", sortKey: "title", link: true },
    { key: "status", label: "Status", render: statusBadge },
    { key: "start_date", label: "Start Date", sortKey: "start_date", render: (row) => row.start_date ?? "-" },
    { key: "end_date", label: "End Date", sortKey: "end_date", render: (row) => row.end_date ?? "-" },
  ],
  getById: getAssessmentById,
  titleKey: "title",
  detailSections: [
    {
      title: "Exam Details",
      fields: [
        { key: "status", label: "Status", render: statusBadge },
        { key: "course_id", label: "Course", lookup: "courses" },
        { key: "passing_marks", label: "Passing Marks" },
        { key: "start_date", label: "Start Date" },
        { key: "end_date", label: "End Date" },
        {
          key: "questions",
          label: "Questions",
          render: (exam) => String(exam.sections.reduce((total, section) => total + section.questions.length, 0)),
        },
        { key: "instruction", label: "Instructions", fullWidth: true },
      ],
    },
  ],
  detailExtra: (exam) => <ExamQuestions exam={exam} />,
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
    <Route path="new" element={<AssessmentEditor />} />
    <Route path=":assessmentId" element={<AssessmentEditor />} />
    {/* The list and its view page (view/:id) */}
    <Route path="*" element={<ExamList />} />
  </Routes>
);

export default Exams;
