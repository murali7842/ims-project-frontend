import './CrudPage.css';
import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";

import DataTable from "../data_table/DataTable";
import ConfirmDialog from "../confirm_dialog/ConfirmDialog";
import SelectFilter from "../select_filter/SelectFilter";
import CrudFormModal from "./CrudFormModal";
import { buildPayload } from "./crudTypes";
import type { CrudFilter, CrudPageConfig, FormOptions, FormValues } from "./crudTypes";
import type { TableColumn } from "../data_table/DataTable";
import type { SelectOption } from "../form_field/FormField";
import { usePaginatedList } from "../../../hooks/usePaginatedList";
import { useSessionUser } from "../../../hooks/useSessionUser";
import { getErrorMessage } from "../../../utils/apiError";
import { getInstitutionDropdownOptions } from "../../../pages/api/dashboard/DashboardApi";

const INSTITUTION_FILTER: CrudFilter = {
  name: "institution_id",
  label: "Institutions",
  loadOptions: getInstitutionDropdownOptions,
};

// For `institutionScoped` lists: admins filter by any institution,
// operators always send their own (the backend enforces this too)
const useInstitutionScope = (config: { institutionScoped?: boolean; filters?: CrudFilter[] }) => {
  const user = useSessionUser();
  const isAdmin = user?.role === "admin";
  const ownInstitutionId = user?.institution?.id;
  const scoped = !!config.institutionScoped;

  const baseParams = useMemo(
    () => (scoped && !isAdmin && ownInstitutionId ? { institution_id: ownInstitutionId } : undefined),
    [scoped, isAdmin, ownInstitutionId]
  );

  const filters = useMemo(
    () => (scoped && isAdmin ? [INSTITUTION_FILTER, ...(config.filters ?? [])] : config.filters ?? []),
    [scoped, isAdmin, config.filters]
  );

  return { baseParams, filters };
};

interface CrudPageProps<T extends { id: number }, P> {
  config: CrudPageConfig<T, P>;
  // Replace the built-in form modal, e.g. to open a full page editor
  onAdd?: () => void;
  onEdit?: (row: T) => void;
}

// Loads every async option list (lookups + filters) once when the page opens
const useOptionLists = (loaders: Record<string, () => Promise<SelectOption[]>>) => {
  const [lists, setLists] = useState<Record<string, SelectOption[]>>({});

  useEffect(() => {
    let cancelled = false;

    Object.entries(loaders).forEach(([key, load]) => {
      load()
        .then((options) => {
          if (!cancelled) setLists((current) => ({ ...current, [key]: options }));
        })
        // A missing name list only means ids are shown instead of names
        .catch(() => undefined);
    });

    return () => {
      cancelled = true;
    };
  }, [loaders]);

  return lists;
};

type FormState<T> = { mode: "create" } | { mode: "edit"; row: T } | null;

const TOAST_DURATION_MS = 3000;

// Generic list + search + filters + create/edit/delete screen driven by a config
const CrudPage = <T extends { id: number }, P>({ config, onAdd, onEdit }: CrudPageProps<T, P>) => {
  const { baseParams, filters } = useInstitutionScope(config);
  const list = usePaginatedList(config.list, { sortBy: config.defaultSortBy, baseParams });

  const loaders = useMemo(() => {
    const result: Record<string, () => Promise<SelectOption[]>> = { ...config.lookups };
    filters.forEach((filter) => {
      if (filter.loadOptions) result[`filter:${filter.name}`] = filter.loadOptions;
    });
    return result;
  }, [config.lookups, filters]);
  const optionLists = useOptionLists(loaders);

  // `lookup` columns show the name for an id, e.g. course_id -> "Java Full Stack"
  const columns = useMemo<TableColumn<T>[]>(
    () =>
      config.columns.map((column) => {
        if (!column.lookup || column.render) return column;
        const lookupKey = column.lookup;
        return {
          ...column,
          render: (row: T) => {
            const id = String((row as Record<string, unknown>)[column.key] ?? "");
            return optionLists[lookupKey]?.find((option) => option.value === id)?.label ?? (id || "-");
          },
        };
      }),
    [config.columns, optionLists]
  );
  const [formState, setFormState] = useState<FormState<T>>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const formFields = useMemo(() => {
    const mode = formState?.mode;
    return config.fields.filter((field) => !field.mode || field.mode === mode);
  }, [config.fields, formState?.mode]);

  const getInitialValues = (): FormValues => {
    if (formState?.mode !== "edit") return {};
    if (config.toFormValues) return config.toFormValues(formState.row);

    const row = formState.row as Record<string, unknown>;
    return Object.fromEntries(formFields.map((field) => [field.name, String(row[field.name] ?? "")]));
  };

  const handleSubmit = async (values: FormValues, options: FormOptions) => {
    const payload = config.toPayload ? config.toPayload(values, options) : (buildPayload(values, formFields) as P);

    if (formState?.mode === "edit") {
      await config.update!(formState.row.id, payload);
      setToast(`${config.entityName} updated`);
    } else {
      await config.create!(payload);
      setToast(`${config.entityName} created`);
    }

    setFormState(null);
    list.reload();
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      setDeleteLoading(true);
      setDeleteError("");
      await config.remove!(deleting.id);
      setDeleting(null);
      setToast(`${config.entityName} deleted`);
      list.reload();
    } catch (error) {
      setDeleteError(getErrorMessage(error, "Delete failed"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const canAdd = !!onAdd || !!config.create;
  const canEdit = !!onEdit || !!config.update;
  const hasActions = canEdit || !!config.remove;

  return (
    <div className="crud-page">

      {/* HEADER */}
      <div className="crud-page-header">
        <h2>{config.title}</h2>
        {canAdd && (
          <button className="btn-primary-red" onClick={() => (onAdd ? onAdd() : setFormState({ mode: "create" }))}>
            <FiPlus /> Add {config.entityName}
          </button>
        )}
      </div>

      {/* TOOLBAR */}
      <div className="crud-toolbar">
        <div className="crud-search">
          <FiSearch />
          <input
            type="text"
            placeholder={config.searchPlaceholder ?? `Search ${config.title.toLowerCase()}...`}
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
          />
        </div>

        {filters.map((filter) => (
          <SelectFilter
            key={filter.name}
            label={filter.label}
            value={list.filters[filter.name] ?? ""}
            onChange={(value) => list.setFilter(filter.name, value)}
            options={filter.options ?? optionLists[`filter:${filter.name}`] ?? []}
            allLabel={`All ${filter.label}`}
          />
        ))}
      </div>

      {list.error && <p className="form-error-banner">{list.error}</p>}

      {/* TABLE */}
      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(row) => row.id}
        loading={list.loading}
        sortBy={list.sortBy}
        sortOrder={list.sortOrder}
        onSort={list.toggleSort}
        page={list.page}
        totalPages={list.totalPages}
        totalElements={list.totalElements}
        onPageChange={list.setPage}
        actions={
          hasActions
            ? (row) => (
                <div className="crud-row-actions">
                  {canEdit && (
                    <button
                      onClick={() => (onEdit ? onEdit(row) : setFormState({ mode: "edit", row }))}
                      aria-label="Edit"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                  )}
                  {config.remove && (
                    <button
                      className="danger"
                      onClick={() => {
                        setDeleteError("");
                        setDeleting(row);
                      }}
                      aria-label="Delete"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              )
            : undefined
        }
      />

      {/* CREATE / EDIT */}
      {formState && (
        <CrudFormModal
          title={`${formState.mode === "edit" ? "Edit" : "Add"} ${config.entityName}`}
          submitText={formState.mode === "edit" ? "Save changes" : "Create"}
          fields={formFields}
          initialValues={getInitialValues()}
          onSubmit={handleSubmit}
          onClose={() => setFormState(null)}
        />
      )}

      {/* DELETE */}
      {deleting && (
        <ConfirmDialog
          title={`Delete ${config.entityName}`}
          message={`Are you sure you want to delete this ${config.entityName.toLowerCase()}? This cannot be undone.`}
          loading={deleteLoading}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toast && <div className="crud-toast">{toast}</div>}
    </div>
  );
};

export default CrudPage;
