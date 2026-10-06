import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import Modal from "../modal/Modal";
import FormField from "../form_field/FormField";
import type { SelectOption } from "../form_field/FormField";
import type { CrudField, FormOptions, FormValues } from "./crudTypes";
import { getErrorMessage } from "../../../utils/apiError";

interface CrudFormModalProps {
  title: string;
  submitText: string;
  fields: CrudField[];
  initialValues: FormValues;
  onSubmit: (values: FormValues, options: FormOptions) => Promise<void>;
  onClose: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (fields: CrudField[], values: FormValues) => {
  const errors: Record<string, string> = {};

  fields.forEach((field) => {
    const value = values[field.name]?.trim() ?? "";
    if (field.required && !value) {
      errors[field.name] = `${field.label} is required`;
    } else if (value && field.type === "email" && !EMAIL_PATTERN.test(value)) {
      errors[field.name] = "Enter a valid email address";
    } else if (value && field.type === "number" && Number.isNaN(Number(value))) {
      errors[field.name] = `${field.label} must be a number`;
    }
  });

  return errors;
};

const CrudFormModal = ({ title, submitText, fields, initialValues, onSubmit, onClose }: CrudFormModalProps) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState<Record<string, SelectOption[]>>({});

  useEffect(() => {
    let cancelled = false;

    fields
      .filter((field) => field.loadOptions)
      .forEach((field) => {
        field.loadOptions!()
          .then((options) => {
            if (!cancelled) setAsyncOptions((current) => ({ ...current, [field.name]: options }));
          })
          .catch((error) => {
            if (!cancelled) setSubmitError(getErrorMessage(error, `Failed to load ${field.label.toLowerCase()} options`));
          });
      });

    return () => {
      cancelled = true;
    };
  }, [fields]);

  const fieldNames = new Set(fields.map((field) => field.name));

  const getOptions = (field: CrudField): SelectOption[] | undefined => {
    const options = field.loadOptions ? asyncOptions[field.name] : field.options;
    if (!field.dependsOn || !fieldNames.has(field.dependsOn)) return options;
    return options?.filter((option) => option.parent === values[field.dependsOn!]);
  };

  const handleChange = (name: string, value: string) => {
    setValues((current) => {
      const next = { ...current, [name]: value };
      // Changing a parent clears the fields that depend on it
      fields.filter((field) => field.dependsOn === name).forEach((field) => {
        next[field.name] = "";
      });
      return next;
    });
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    const validationErrors = validate(fields, values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    try {
      setSaving(true);
      setSubmitError("");
      const options: FormOptions = Object.fromEntries(
        fields.map((field) => [field.name, (field.loadOptions ? asyncOptions[field.name] : field.options) ?? []])
      );
      await onSubmit(values, options);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Save failed"));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn-outline-grey" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-primary-red" onClick={() => handleSubmit()} disabled={saving}>
            {saving ? "Saving..." : submitText}
          </button>
        </>
      }
    >
      <form className="crud-form-grid" onSubmit={handleSubmit} noValidate>
        {fields.map((field) => (
          <div key={field.name} className={field.fullWidth || field.type === "textarea" ? "full-width" : ""}>
            <FormField
              name={field.name}
              label={field.label}
              type={field.type}
              value={values[field.name] ?? ""}
              onChange={handleChange}
              required={field.required}
              placeholder={field.placeholder}
              options={getOptions(field)}
              error={errors[field.name]}
              disabled={saving}
            />
          </div>
        ))}
        {/* Lets Enter submit the form */}
        <button type="submit" hidden />
      </form>

      {submitError && <p className="form-error-banner">{submitError}</p>}
    </Modal>
  );
};

export default CrudFormModal;
