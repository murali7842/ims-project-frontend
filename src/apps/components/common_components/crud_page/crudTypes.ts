import type { ListParams, PaginatedResponse } from "../../../types/api";
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
}

export interface CrudFilter {
  name: string;
  label: string;
  options?: SelectOption[];
  loadOptions?: OptionsLoader;
}

export interface CrudPageConfig<T extends { id: number }, P = Record<string, unknown>> {
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
  list: (params: ListParams) => Promise<PaginatedResponse<T>>;
  create?: (payload: P) => Promise<unknown>;
  update?: (id: number, payload: P) => Promise<unknown>;
  remove?: (id: number) => Promise<unknown>;
  // Row -> form values for editing. Defaults to row[field.name]
  toFormValues?: (row: T) => FormValues;
  // Form values -> request body. Defaults to buildPayload
  toPayload?: (values: FormValues, options: FormOptions) => P;
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
