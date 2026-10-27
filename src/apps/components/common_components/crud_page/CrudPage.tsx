import './CrudPage.css';
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiEdit2, FiEye, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import CrudDetailView from "./CrudDetailView";
import type { DetailViewSection } from "./CrudDetailView";
import { useAsyncData } from "../../../hooks/useAsyncData";

import DataTable from "../data_table/DataTable";
import ConfirmDialog from "../confirm_dialog/ConfirmDialog";
import SelectFilter from "../select_filter/SelectFilter";
import ActionMenu from "../action_menu/ActionMenu";
import CrudFormModal from "./CrudFormModal";
import { buildPayload } from "./crudTypes";
import type { CrudFilter, CrudPageConfig, FormOptions, FormValues } from "./crudTypes";
import type { TableColumn } from "../data_table/DataTable";
import type { SelectOption } from "../form_field/FormField";
import { usePaginatedList } from "../../../hooks/usePaginatedList";
import { useSessionUser } from "../../../hooks/useSessionUser";
import type { UserRole } from "../../../../config/sidebarConfig";
import { getErrorMessage } from "../../../utils/apiError";
import { getInstitutionDropdownOptions } from "../../../pages/api/dashboard/DashboardApi";

const DEFAULT_EDITORS: UserRole[] = ["admin", "operator"];

const INSTITUTION_FILTER: CrudFilter = {
  name: "institution_id",
  label: "Institutions",
  loadOptions: getInstitutionDropdownOptions,
};

// Form field / column names that hold the institution
const INSTITUTION_FIELD = "institution_id";
const INSTITUTION_COLUMNS = [INSTITUTION_FIELD, "institution"];

// Admins work across institutions: institution filter, field and column are shown.
// Operators only ever see their own institution, so for them:
// - `institutionScoped` lists always send their institution_id (the backend enforces this too)
// - the institution form field and column are hidden and the id is filled in automatically
const useInstitutionScope = (config: { institutionScoped?: boolean; filters?: CrudFilter[] }) => {
  const user = useSessionUser();
  const isAdmin = user?.role === "admin";
  // Unknown for sessions saved before the institution was stored; then the field stays visible
  const fixedInstitutionId = !isAdmin ? user?.institution?.id : undefined;
  const scoped = !!config.institutionScoped;

  const baseParams = useMemo(
    () => (scoped && fixedInstitutionId ? { institution_id: fixedInstitutionId } : undefined),
    [scoped, fixedInstitutionId]
  );

  const filters = useMemo(
    () => (scoped && isAdmin ? [INSTITUTION_FILTER, ...(config.filters ?? [])] : config.filters ?? []),
    [scoped, isAdmin, config.filters]
  );

  return { baseParams, filters, fixedInstitutionId };
};

interface CrudPageProps<T extends { id: number }, P, D extends { id: number } = T> {
  config: CrudPageConfig<T, P, D>;
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
const VIEW_PATH = /\/view\/(\d+)\/?$/;

// Plain value -> text for the view page
const formatValue = (value: unknown): ReactNode => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

// Generic list + search + filters + create/edit/delete screen driven by a config,
// plus a view page at <list path>/view/:id when the config has getById + detailSections
const CrudPage = <T extends { id: number }, P, D extends { id: number } = T>({
  config,
  onAdd,
  onEdit,
}: CrudPageProps<T, P, D>) => {
  const { baseParams, filters, fixedInstitutionId } = useInstitutionScope(config);
  const sessionRole = useSessionUser()?.role ?? "operator";
  const list = usePaginatedList(config.list, { sortBy: config.defaultSortBy, baseParams });
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // /dashboard/students/view/5 -> list path /dashboard/students, viewing record 5
  const viewMatch = pathname.match(VIEW_PATH);
  const listPath = viewMatch ? pathname.slice(0, viewMatch.index) : pathname.replace(/\/$/, "");
  const hasDetail = !!config.getById && !!config.detailSections;
  const viewId = hasDetail && viewMatch ? Number(viewMatch[1]) : undefined;
  const openView = (id: number) => navigate(`${listPath}/view/${id}`);

  // Reloads the view page after an edit
  const [detailVersion, setDetailVersion] = useState(0);
  const getById = config.getById;
  const loadDetail = useCallback(async (): Promise<D | null> => {
    if (!viewId || !getById) return null;
    return (await getById(viewId)).body;
    // detailVersion: refetch after saving an edit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewId, getById, detailVersion]);
  const detail = useAsyncData(loadDetail);

  // Columns and view-page fields this user actually sees: institution ones are hidden for
  // non-admins with a fixed institution, and anything listed in hiddenFor for their role
  const isVisible = useCallback(
    (item: { key: string; hiddenFor?: UserRole[] }) =>
      !(fixedInstitutionId && INSTITUTION_COLUMNS.includes(item.key)) && !item.hiddenFor?.includes(sessionRole),
    [fixedInstitutionId, sessionRole]
  );
  const visibleColumns = useMemo(() => config.columns.filter(isVisible), [config.columns, isVisible]);
  const visibleSections = useMemo(
    () => (config.detailSections ?? []).map((section) => ({ ...section, fields: section.fields.filter(isVisible) })),
    [config.detailSections, isVisible]
  );

  // Only load the id -> name lists something visible uses (avoids requests the role isn't allowed to make)
  const loaders = useMemo(() => {
    const used = new Set(
      [...visibleColumns, ...visibleSections.flatMap((section) => section.fields)]
        .map((item) => item.lookup)
        .filter(Boolean)
    );
    const result: Record<string, () => Promise<SelectOption[]>> = Object.fromEntries(
      Object.entries(config.lookups ?? {}).filter(([key]) => used.has(key))
    );
    filters.forEach((filter) => {
      if (filter.loadOptions) result[`filter:${filter.name}`] = filter.loadOptions;
    });
    return result;
  }, [config.lookups, filters, visibleColumns, visibleSections]);
  const optionLists = useOptionLists(loaders);

  // `lookup` columns show the name for an id, e.g. course_id -> "Java Full Stack"
  const columns = useMemo<TableColumn<T>[]>(
    () =>
      visibleColumns
        .map((column) => {
          let render = column.render;
          if (!render && column.lookup) {
            const lookupKey = column.lookup;
            render = (row: T) => {
              const id = String((row as Record<string, unknown>)[column.key] ?? "");
              return optionLists[lookupKey]?.find((option) => option.value === id)?.label ?? (id || "-");
            };
          }
          if (!column.link || !hasDetail) return render ? { ...column, render } : column;

          // Name column: opens the view page
          const content = render;
          return {
            ...column,
            render: (row: T) => (
              <button className="crud-link" onClick={() => openView(row.id)}>
                {content ? content(row) : formatValue((row as Record<string, unknown>)[column.key])}
              </button>
            ),
          };
        }),
    // openView only depends on listPath
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleColumns, optionLists, hasDetail, listPath]
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

  // Every field of the current mode (used to build the payload)
  const modeFields = useMemo(() => {
    const mode = formState?.mode;
    return config.fields.filter((field) => !field.mode || field.mode === mode);
  }, [config.fields, formState?.mode]);

  // Fields shown in the form (operators don't pick an institution)
  const formFields = useMemo(
    () => (fixedInstitutionId ? modeFields.filter((field) => field.name !== INSTITUTION_FIELD) : modeFields),
    [modeFields, fixedInstitutionId]
  );

  const getInitialValues = (): FormValues => {
    if (formState?.mode !== "edit") return {};
    if (config.toFormValues) return config.toFormValues(formState.row);

    const row = formState.row as Record<string, unknown>;
    return Object.fromEntries(formFields.map((field) => [field.name, String(row[field.name] ?? "")]));
  };

  const handleSubmit = async (formValues: FormValues, options: FormOptions) => {
    // Hidden institution field: fill in the operator's own institution
    const needsInstitution = fixedInstitutionId && modeFields.some((field) => field.name === INSTITUTION_FIELD);
    const values = needsInstitution ? { ...formValues, [INSTITUTION_FIELD]: String(fixedInstitutionId) } : formValues;

    const payload = config.toPayload ? config.toPayload(values, options) : (buildPayload(values, modeFields) as P);

    if (formState?.mode === "edit") {
      await config.update!(formState.row.id, payload);
      setToast(`${config.entityName} updated`);
    } else {
      await config.create!(payload);
      setToast(`${config.entityName} created`);
    }

    setFormState(null);
    list.reload();
    setDetailVersion((version) => version + 1);
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
      // Deleted from its view page: go back to the list
      if (viewId) navigate(listPath);
    } catch (error) {
      setDeleteError(getErrorMessage(error, "Delete failed"));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Read-only for roles outside editableBy (e.g. teachers on courses / batches / students)
  const canWrite = (config.editableBy ?? DEFAULT_EDITORS).includes(sessionRole);
  const canAdd = canWrite && (!!onAdd || !!config.create);
  const canEdit = canWrite && (!!onEdit || !!config.update);
  const canDelete = (config.deletableBy ?? DEFAULT_EDITORS).includes(sessionRole) && !!config.remove;
  const hasActions = hasDetail || canEdit || canDelete;

  const startEdit = (row: T) => (onEdit ? onEdit(row) : setFormState({ mode: "edit", row }));
  const startDelete = (row: T) => {
    setDeleteError("");
    setDeleting(row);
  };

  // Modals shared by the list and the view page
  const modals = (
    <>
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
    </>
  );

  // VIEW PAGE
  if (viewId) {
    const record = detail.data;
    const values = record as unknown as Record<string, unknown> | null | undefined;
    const sections: DetailViewSection[] = record
      ? visibleSections.map((section) => ({
          title: section.title,
          fields: section.fields
            .map((field) => {
              let value: ReactNode;
              if (field.render) value = field.render(record);
              else if (field.lookup) {
                const id = String(values?.[field.key] ?? "");
                value = optionLists[field.lookup]?.find((option) => option.value === id)?.label ?? formatValue(id);
              } else value = formatValue(values?.[field.key]);
              return { label: field.label, value, fullWidth: field.fullWidth };
            }),
        }))
      : [];
    const title = values && config.titleKey ? String(values[config.titleKey] ?? "") : undefined;
    // The record from getById, as a list row for the edit form / delete
    const row = record ? (config.detailToRow ? config.detailToRow(record) : (record as unknown as T)) : undefined;

    return (
      <>
        <CrudDetailView
          entityName={config.entityName}
          title={title || undefined}
          subtitle={record ? `${config.entityName} · ID ${record.id}` : undefined}
          stats={record && config.detailStats ? config.detailStats(record) : undefined}
          sections={sections}
          extra={record && config.detailExtra ? config.detailExtra(record) : undefined}
          loading={detail.loading && !record}
          error={detail.error}
          onBack={() => navigate(listPath)}
          onEdit={canEdit && row ? () => startEdit(row) : undefined}
          onDelete={canDelete && row ? () => startDelete(row) : undefined}
        />
        {modals}
      </>
    );
  }

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

      {list.error && <p className="form-error-banner">{list.error}</p>}

      {/* TABLE (search + filters in its top row) */}
      <DataTable
        toolbar={
          <>
            <label className="crud-search">
              <FiSearch />
              <input
                type="text"
                placeholder={config.searchPlaceholder ?? `Search ${config.title.toLowerCase()}...`}
                value={list.search}
                onChange={(e) => list.setSearch(e.target.value)}
                aria-label={`Search ${config.title.toLowerCase()}`}
              />
            </label>

            {filters.map((filter) => (
              <SelectFilter
                key={filter.name}
                label={filter.label}
                value={list.filters[filter.name] ?? ""}
                onChange={(value) => list.setFilter(filter.name, value)}
                options={filter.options ?? optionLists[`filter:${filter.name}`] ?? []}
                allLabel={`All ${filter.label.toLowerCase()}`}
              />
            ))}
          </>
        }
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
                <ActionMenu
                  items={[
                    ...(hasDetail ? [{ label: "View", icon: FiEye, onClick: () => openView(row.id) }] : []),
                    ...(canEdit ? [{ label: "Edit", icon: FiEdit2, onClick: () => startEdit(row) }] : []),
                    ...(canDelete
                      ? [{ label: "Delete", icon: FiTrash2, danger: true, onClick: () => startDelete(row) }]
                      : []),
                  ]}
                />
              )
            : undefined
        }
      />

      {modals}
    </div>
  );
};

export default CrudPage;
