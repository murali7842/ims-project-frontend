import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { createCourse, deleteCourse, getAllCourses, updateCourse } from "../../api/course/CourseApi";
import type { Course, CourseCreatePayload, CourseUpdatePayload } from "../../api/course/CourseApi";
import { getInstitutionDropdownOptions } from "../../api/dashboard/DashboardApi";
import { getTeacherOptions } from "../../api/teacher/TeacherApi";
import { formatCurrency } from "../../../utils/format";

const config: CrudPageConfig<Course, CourseCreatePayload | CourseUpdatePayload> = {
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
    { key: "id", label: "ID", sortKey: "id" },
    { key: "name", label: "Name", sortKey: "name" },
    { key: "duration", label: "Duration", sortKey: "duration" },
    { key: "course_fee", label: "Fee", sortKey: "course_fee", render: (row) => formatCurrency(row.course_fee) },
    { key: "teacher_id", label: "Teacher", lookup: "teachers" },
    { key: "institution_id", label: "Institution", lookup: "institutions" },
  ],
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
