import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { createBatch, deleteBatch, getAllBatches, updateBatch } from "../../api/batch/BatchApi";
import type { Batch, BatchCreatePayload, BatchMode, BatchUpdatePayload } from "../../api/batch/BatchApi";
import { getInstitutionOptions } from "../../api/institution/InstitutionApi";
import { getCourseOptions } from "../../api/course/CourseApi";
import { formatEnum, toDateInput } from "../../../utils/format";

const MODE_BADGE: Record<BatchMode, string> = {
  ONLINE: "blue",
  OFFLINE: "amber",
  HYBRID: "green",
};

const config: CrudPageConfig<Batch, BatchCreatePayload | BatchUpdatePayload> = {
  title: "Batches",
  entityName: "Batch",
  searchPlaceholder: "Search batches...",
  defaultSortBy: "id",
  list: getAllBatches,
  create: (payload) => createBatch(payload as BatchCreatePayload),
  update: updateBatch,
  remove: deleteBatch,
  lookups: {
    courses: getCourseOptions,
    institutions: getInstitutionOptions,
  },
  columns: [
    { key: "id", label: "ID", sortKey: "id" },
    { key: "name", label: "Name", sortKey: "name" },
    { key: "course_id", label: "Course", lookup: "courses" },
    { key: "timing", label: "Timing" },
    {
      key: "mode",
      label: "Mode",
      render: (row) => <span className={`status-badge ${MODE_BADGE[row.mode] ?? ""}`}>{formatEnum(row.mode)}</span>,
    },
    { key: "start_date", label: "Start Date", sortKey: "start_date" },
    { key: "end_date", label: "End Date", sortKey: "end_date" },
    { key: "student_limit", label: "Student Limit", sortKey: "student_limit" },
    { key: "institution_id", label: "Institution", lookup: "institutions" },
  ],
  fields: [
    { name: "name", label: "Batch Name", required: true },
    { name: "timing", label: "Timing", required: true, placeholder: "e.g. 9AM to 11AM" },
    // A batch's institution is fixed once created
    { name: "institution_id", label: "Institution", type: "select", required: true, loadOptions: getInstitutionOptions, mode: "create" },
    { name: "course_id", label: "Course", type: "select", required: true, loadOptions: getCourseOptions, dependsOn: "institution_id" },
    {
      name: "mode",
      label: "Mode",
      type: "select",
      required: true,
      options: [
        { value: "ONLINE", label: "Online" },
        { value: "OFFLINE", label: "Offline" },
        { value: "HYBRID", label: "Hybrid" },
      ],
    },
    { name: "student_limit", label: "Student Limit", type: "number", required: true },
    { name: "start_date", label: "Start Date", type: "date", required: true },
    { name: "end_date", label: "End Date", type: "date", required: true },
  ],
  toFormValues: (row) => ({
    name: row.name,
    timing: row.timing,
    course_id: String(row.course_id),
    mode: row.mode,
    student_limit: String(row.student_limit),
    start_date: toDateInput(row.start_date),
    end_date: toDateInput(row.end_date),
  }),
  toPayload: (values) => ({
    name: values.name.trim(),
    timing: values.timing.trim(),
    course_id: Number(values.course_id),
    mode: values.mode as BatchMode,
    student_limit: Number(values.student_limit),
    start_date: values.start_date,
    end_date: values.end_date,
    ...(values.institution_id ? { institution_id: Number(values.institution_id) } : {}),
  }),
};

const Batches = () => <CrudPage config={config} />;

export default Batches;
