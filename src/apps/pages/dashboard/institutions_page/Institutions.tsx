import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import {
  createInstitution,
  deleteInstitution,
  getAllInstitutions,
  updateInstitution,
} from "../../api/institution/InstitutionApi";
import type { Institution, InstitutionPayload } from "../../api/institution/InstitutionApi";

const config: CrudPageConfig<Institution, InstitutionPayload> = {
  title: "Institutions",
  entityName: "Institution",
  searchPlaceholder: "Search by name or email...",
  defaultSortBy: "id",
  list: getAllInstitutions,
  create: createInstitution,
  update: updateInstitution,
  remove: deleteInstitution,
  columns: [
    { key: "id", label: "ID", sortKey: "id" },
    { key: "name", label: "Name", sortKey: "name" },
    { key: "email", label: "Email", sortKey: "email" },
    { key: "contact_number", label: "Contact Number" },
    { key: "address", label: "Address" },
  ],
  fields: [
    { name: "name", label: "Institution Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "contact_number", label: "Contact Number", required: true },
    { name: "address", label: "Address", type: "textarea", required: true },
  ],
};

const Institutions = () => <CrudPage config={config} />;

export default Institutions;
