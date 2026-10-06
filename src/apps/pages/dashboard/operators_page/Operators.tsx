import CrudPage from "../../../components/common_components/crud_page/CrudPage";
import type { CrudPageConfig } from "../../../components/common_components/crud_page/crudTypes";
import { createOperator, deleteOperator, getAllOperators, updateOperator } from "../../api/operator/OperatorApi";
import type { Operator, OperatorPayload } from "../../api/operator/OperatorApi";
import { getInstitutionOptions } from "../../api/institution/InstitutionApi";

const config: CrudPageConfig<Operator, OperatorPayload> = {
  title: "Operators",
  entityName: "Operator",
  searchPlaceholder: "Search by name or email...",
  defaultSortBy: "id",
  list: getAllOperators,
  create: createOperator,
  update: updateOperator,
  remove: deleteOperator,
  columns: [
    { key: "id", label: "ID", sortKey: "id" },
    { key: "name", label: "Name", sortKey: "name" },
    { key: "email", label: "Email", sortKey: "email" },
    { key: "phone_number", label: "Phone" },
    { key: "institution", label: "Institution", render: (row) => row.institution?.name ?? "-" },
    { key: "address", label: "Address" },
  ],
  fields: [
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true, mode: "create" },
    { name: "phone_number", label: "Phone Number", required: true },
    { name: "institution_id", label: "Institution", type: "select", required: true, loadOptions: getInstitutionOptions },
    { name: "address", label: "Address", type: "textarea", required: true },
  ],
  toFormValues: (row) => ({
    name: row.name,
    email: row.email,
    phone_number: row.phone_number,
    address: row.address,
    institution_id: row.institution ? String(row.institution.id) : "",
  }),
  toPayload: (values) => ({
    name: values.name.trim(),
    email: values.email.trim(),
    phone_number: values.phone_number.trim(),
    address: values.address.trim(),
    institution_id: Number(values.institution_id),
    ...(values.password ? { password: values.password } : {}),
  }),
};

const Operators = () => <CrudPage config={config} />;

export default Operators;
