import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import {
  createInstitution,
  deleteInstitution,
  getAllInstitutions,
  getInstitutionById,
  updateInstitution,
} from "../../api/institution/InstitutionApi";
import type { Institution, InstitutionDetail, InstitutionPayload } from "../../api/institution/InstitutionApi";
import { FiBookOpen, FiLayers, FiUser, FiUserCheck, FiUsers } from "react-icons/fi";
import { formatCurrency } from "../../../utils/format";
import EntityLink from "../../../components/common_components/entity_link/EntityLink";
import RelatedTable from "../../../components/common_components/related_table/RelatedTable";

const config: CrudPageConfig<Institution, InstitutionPayload, InstitutionDetail> = {
  title: "Institutions",
  entityName: "Institution",
  searchPlaceholder: "Search by name or email...",
  defaultSortBy: "id",
  list: getAllInstitutions,
  create: createInstitution,
  update: updateInstitution,
  remove: deleteInstitution,
  columns: [
    { key: "name", label: "Name", sortKey: "name", link: true },
    { key: "email", label: "Email", sortKey: "email" },
    { key: "contact_number", label: "Contact Number" },
  ],
  getById: getInstitutionById,
  titleKey: "name",
  detailStats: (institution) => [
    { label: "Courses", value: institution.total_courses, icon: FiBookOpen },
    { label: "Batches", value: institution.total_batches, icon: FiLayers },
    { label: "Teachers", value: institution.total_teachers, icon: FiUser },
    { label: "Operators", value: institution.total_operators, icon: FiUserCheck },
    { label: "Students", value: institution.total_students, icon: FiUsers },
  ],
  detailSections: [
    {
      title: "Institution Details",
      fields: [
        { key: "email", label: "Email" },
        { key: "contact_number", label: "Contact Number" },
        { key: "address", label: "Address", fullWidth: true },
      ],
    },
  ],
  detailExtra: (institution) => (
    <RelatedTable
      title="Courses"
      rows={institution.courses}
      rowKey={(course) => course.id}
      emptyText="No courses yet"
      columns={[
        { label: "Course", render: (course) => <EntityLink module="courses" item={course} /> },
        { label: "Teacher", render: (course) => <EntityLink module="teachers" item={course.teacher} /> },
        { label: "Fee", render: (course) => formatCurrency(course.course_fee) },
        {
          label: "Batches",
          render: (course) =>
            course.batches?.length ? (
              <span className="chip-list">
                {course.batches.map((batch) => <EntityLink key={batch.id} module="batches" item={batch} />)}
              </span>
            ) : "-",
        },
      ]}
    />
  ),
  fields: [
    { name: "name", label: "Institution Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "contact_number", label: "Contact Number", required: true },
    { name: "address", label: "Address", type: "textarea", required: true },
  ],
};

const Institutions = () => <CrudPage config={config} />;

export default Institutions;
