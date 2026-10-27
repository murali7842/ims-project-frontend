import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { createCourse, deleteCourse, getAllCourses, getCourseById, updateCourse } from "../../api/course/CourseApi";
import type { Course, CourseCreatePayload, CourseDetail, CourseUpdatePayload } from "../../api/course/CourseApi";
import { FiCreditCard, FiLayers, FiUsers } from "react-icons/fi";
import EntityLink from "../../../components/common_components/entity_link/EntityLink";
import RelatedTable from "../../../components/common_components/related_table/RelatedTable";
import { getInstitutionDropdownOptions } from "../../api/dashboard/DashboardApi";
import { getTeacherOptions } from "../../api/teacher/TeacherApi";
import { formatCurrency, formatEnum } from "../../../utils/format";

const config: CrudPageConfig<Course, CourseCreatePayload | CourseUpdatePayload, CourseDetail> = {
  title: "Courses",
  entityName: "Course",
  searchPlaceholder: "Search courses...",
  defaultSortBy: "id",
  list: getAllCourses,
  institutionScoped: true,
  create: (payload) => createCourse(payload as CourseCreatePayload),
  update: updateCourse,
  remove: deleteCourse,
  lookups: {
    institutions: getInstitutionDropdownOptions,
    teachers: getTeacherOptions,
  },
  columns: [
    { key: "name", label: "Name", sortKey: "name", link: true },
    { key: "duration", label: "Duration", sortKey: "duration" },
    { key: "course_fee", label: "Fee", sortKey: "course_fee", render: (row) => formatCurrency(row.course_fee) },
    // A teacher only sees their own courses, so this column is always them
    { key: "teacher_id", label: "Teacher", lookup: "teachers", hiddenFor: ["teacher"] },
    { key: "institution_id", label: "Institution", lookup: "institutions" },
  ],
  getById: getCourseById,
  titleKey: "name",
  // Edit form uses ids; the detail has { id, name } objects
  detailToRow: (course) => ({
    ...course,
    institution_id: course.institution?.id ?? null,
    teacher_id: course.teacher?.id ?? 0,
  }),
  detailStats: (course) => [
    { label: "Batches", value: course.total_batches, icon: FiLayers },
    { label: "Students", value: course.total_students, icon: FiUsers },
    { label: "Course Fee", value: formatCurrency(course.course_fee), icon: FiCreditCard },
  ],
  detailSections: [
    {
      title: "Course Details",
      fields: [
        { key: "duration", label: "Duration" },
        { key: "course_fee", label: "Course Fee", render: (course) => formatCurrency(course.course_fee) },
        { key: "teacher", label: "Teacher", render: (course) => <EntityLink module="teachers" item={course.teacher} />, hiddenFor: ["teacher"] },
        { key: "institution", label: "Institution", render: (course) => <EntityLink module="institutions" item={course.institution} /> },
        { key: "description", label: "Description", fullWidth: true },
      ],
    },
  ],
  detailExtra: (course) => (
    <RelatedTable
      title="Batches"
      rows={course.batches}
      rowKey={(batch) => batch.id}
      emptyText="No batches for this course yet"
      columns={[
        { label: "Batch", render: (batch) => <EntityLink module="batches" item={batch} /> },
        { label: "Timing", render: (batch) => batch.timing },
        { label: "Mode", render: (batch) => <span className="status-badge">{formatEnum(batch.mode)}</span> },
        { label: "Start", render: (batch) => batch.start_date },
        { label: "End", render: (batch) => batch.end_date },
        { label: "Students", render: (batch) => `${batch.total_students} / ${batch.student_limit}` },
      ]}
    />
  ),
  fields: [
    { name: "name", label: "Course Name", required: true },
    { name: "duration", label: "Duration", required: true, placeholder: "e.g. 3 months" },
    { name: "course_fee", label: "Course Fee", type: "number", required: true },
    // A course's institution is fixed once created
    { name: "institution_id", label: "Institution", type: "select", required: true, loadOptions: getInstitutionDropdownOptions, mode: "create" },
    { name: "teacher_id", label: "Teacher", type: "select", required: true, loadOptions: getTeacherOptions, dependsOn: "institution_id" },
    { name: "description", label: "Description", type: "textarea", required: true },
  ],
};

const Courses = () => <CrudPage config={config} />;

export default Courses;
