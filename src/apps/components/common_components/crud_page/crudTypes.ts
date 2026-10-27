import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import type { ApiResponse, ListParams, PaginatedResponse } from "../../../types/api";
import type { UserRole } from "../../../../config/sidebarConfig";
import type { TableColumn } from "../data_table/DataTable";
import type { FieldType, SelectOption } from "../form_field/FormField";

export type FormValues = Record<string, string>;

export type OptionsLoader = () => Promise<SelectOption[]>;

// Loaded select options of the open form, keyed by field name
export type FormOptions = Record<string, SelectOption[]>;

export interface CrudField {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  // Async options, e.g. institutions dropdown
  loadOptions?: OptionsLoader;
  // Only show options whose `parent` matches this field's value (e.g. batch depends on course_id).
  // Ignored when the parent field isn't part of the form.
  dependsOn?: string;
  // Show the field only when creating or only when editing
  mode?: "create" | "edit";
  fullWidth?: boolean;
}

export interface CrudColumn<T> extends TableColumn<T> {
  // Show the label of row[key] from config.lookups[lookup] instead of the raw id
  lookup?: string;
  // Clicking the cell opens the record's view page (usually the name column)
  link?: boolean;
  // Hide the column for these roles (e.g. the Teacher column for teachers themselves)
  hiddenFor?: UserRole[];
}

// One label / value pair on the view page
export interface DetailField<D> {
  key: string;
  label: string;
  render?: (record: D) => ReactNode;
  lookup?: string;
  // Spans the whole row, e.g. description or address
  fullWidth?: boolean;
  hiddenFor?: UserRole[];
}

export interface DetailSection<D> {
  title: string;
  fields: DetailField<D>[];
}

export interface CrudFilter {
  name: string;
  label: string;
  options?: SelectOption[];
  loadOptions?: OptionsLoader;
}

// T = list row, P = create/update body, D = record returned by getById (view page)
export interface CrudPageConfig<T extends { id: number }, P = Record<string, unknown>, D extends { id: number } = T> {
  title: string;
  entityName: string;
  searchPlaceholder?: string;
  columns: CrudColumn<T>[];
  fields: CrudField[];
  filters?: CrudFilter[];
  // id -> name lists used by `lookup` columns
  lookups?: Record<string, OptionsLoader>;
  defaultSortBy?: string;
  // The list endpoint accepts institution_id: admins get an institution filter,
  // operators always send their own institution
  institutionScoped?: boolean;
  // Roles that may add / edit here; everyone else gets a read-only page. Defaults to admin and operator.
  editableBy?: UserRole[];
  // Roles that may delete. Defaults to admin and operator.
  deletableBy?: UserRole[];
  list: (params: ListParams) => Promise<PaginatedResponse<T>>;
  create?: (payload: P) => Promise<unknown>;
  update?: (id: number, payload: P) => Promise<unknown>;
  remove?: (id: number) => Promise<unknown>;
  // Row -> form values for editing. Defaults to row[field.name]
  toFormValues?: (row: T) => FormValues;
  // Form values -> request body. Defaults to buildPayload
  toPayload?: (values: FormValues, options: FormOptions) => P;

  // View page (/<module>/view/:id): shown when getById and detailSections are set
  getById?: (id: number) => Promise<ApiResponse<D>>;
  // Field used as the view page heading, e.g. "name"
  titleKey?: string;
  detailSections?: DetailSection<D>[];
  // Counts shown as tiles at the top of the view page
  detailStats?: (record: D) => DetailStat[];
  // Extra content under the sections, e.g. a student's payments
  detailExtra?: (record: D) => ReactNode;
  // Converts the getById record into a list row for Edit / Delete on the view page
  // (needed when the detail shape differs, e.g. course: { id, name } instead of course_id)
  detailToRow?: (record: D) => T;
}

export interface DetailStat {
  label: string;
  value: ReactNode;
  icon?: IconType;
}

// Converts number fields and drops empty optional fields
export const buildPayload = (values: FormValues, fields: CrudField[]) => {
  const payload: Record<string, unknown> = {};

  fields.forEach((field) => {
    const value = values[field.name]?.trim() ?? "";
    if (value === "" && !field.required) return;

    payload[field.name] = field.type === "number" ? Number(value) : value;
  });

  return payload;
};

export const findOption = (options: FormOptions, field: string, value: string) =>
  options[field]?.find((option) => option.value === value);
