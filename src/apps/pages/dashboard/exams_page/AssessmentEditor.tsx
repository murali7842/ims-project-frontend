import './AssessmentEditor.css';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";

import FormField from "../../../components/common_components/form_field/FormField";
import type { SelectOption } from "../../../components/common_components/form_field/FormField";
import DashboardCard from "../../../components/dashboard_components/card_component/DashboardCard";
import QuestionEditor from "./QuestionEditor";
import { createAssessment, getAssessmentById, updateAssessment } from "../../api/assessment/AssessmentApi";
import type { PublishStatus } from "../../api/assessment/AssessmentApi";
import { getCourseOptions } from "../../api/course/CourseApi";
import { getInstitutionOptions } from "../../api/institution/InstitutionApi";
import { getErrorMessage } from "../../../utils/apiError";
import {
  emptyAssessment,
  emptyQuestion,
  emptySection,
  toFormState,
  toPayload,
  validateAssessment,
} from "./assessmentForm";
import type { AssessmentFormState, QuestionState, SectionState } from "./assessmentForm";

const STATUS_OPTIONS: SelectOption[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
];

const AssessmentEditor = () => {
  const { assessmentId } = useParams();
  const isEdit = !!assessmentId;
  const navigate = useNavigate();

  const [form, setForm] = useState<AssessmentFormState>(emptyAssessment);
  // Institutions as loaded, to only send institution_ids when they changed
  const [initialInstitutionIds, setInitialInstitutionIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [courseOptions, setCourseOptions] = useState<SelectOption[]>([]);
  // null = couldn't load (institutions API is admin only), so the section is hidden
  const [institutionOptions, setInstitutionOptions] = useState<SelectOption[] | null>(null);

  useEffect(() => {
    getCourseOptions()
      .then(setCourseOptions)
      .catch((err) => setError(getErrorMessage(err, "Failed to load courses")));
    getInstitutionOptions()
      .then(setInstitutionOptions)
      .catch(() => setInstitutionOptions(null));
  }, []);

  useEffect(() => {
    if (!assessmentId) return;
    let cancelled = false;

    getAssessmentById(Number(assessmentId))
      .then(({ body }) => {
        if (cancelled || !body) return;
        const state = toFormState(body);
        setForm(state);
        setInitialInstitutionIds(state.institution_ids);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load exam"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  const setField = (name: string, value: string) => setForm((current) => ({ ...current, [name]: value }));

  const toggleInstitution = (id: number) => {
    setForm((current) => ({
      ...current,
      institution_ids: current.institution_ids.includes(id)
        ? current.institution_ids.filter((value) => value !== id)
        : [...current.institution_ids, id],
    }));
  };

  const updateSection = (key: string, changes: Partial<SectionState>) => {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section) => (section.key === key ? { ...section, ...changes } : section)),
    }));
  };

  const removeSection = (key: string) => {
    setForm((current) => ({ ...current, sections: current.sections.filter((section) => section.key !== key) }));
  };

  const updateQuestion = (section: SectionState, question: QuestionState) => {
    updateSection(section.key, {
      questions: section.questions.map((item) => (item.key === question.key ? question : item)),
    });
  };

  const handleSave = async () => {
    const problem = validateAssessment(form);
    if (problem) {
      setError(problem);
      return;
    }

    try {
      setSaving(true);
      setError("");
      // Sending institution_ids again on update makes the backend fail with a 500
      // when the exam already has institutions, so they're only sent when changed.
      const institutionsChanged =
        [...form.institution_ids].sort().join(",") !== [...initialInstitutionIds].sort().join(",");
      const payload = toPayload(form, institutionOptions !== null && (!isEdit || institutionsChanged));
      if (isEdit) {
        await updateAssessment(Number(assessmentId), payload);
      } else {
        await createAssessment(payload);
      }
      navigate("/dashboard/exams");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save exam"));
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading exam...</p>;
  }

  return (
    <div className="assessment-editor">

      {/* HEADER */}
      <div className="editor-header">
        <div className="editor-title">
          <button className="icon-btn" onClick={() => navigate("/dashboard/exams")} aria-label="Back to exams">
            <FiArrowLeft />
          </button>
          <h2>{isEdit ? "Edit Exam" : "New Exam"}</h2>
        </div>
        <div className="editor-actions">
          <button className="btn-outline-grey" onClick={() => navigate("/dashboard/exams")} disabled={saving}>
            Cancel
          </button>
          <button className="btn-primary-red" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save exam"}
          </button>
        </div>
      </div>

      {error && <p className="form-error-banner">{error}</p>}

      {/* DETAILS */}
      <DashboardCard title="Details">
        <div className="editor-grid">
          <div className="span-2">
            <FormField name="title" label="Title" value={form.title} onChange={setField} required />
          </div>
          <FormField
            name="course_id"
            label="Course"
            type="select"
            value={form.course_id}
            onChange={setField}
            options={courseOptions}
            required
          />
          <FormField
            name="status"
            label="Status"
            type="select"
            value={form.status}
            onChange={(name, value) => setField(name, value as PublishStatus)}
            options={STATUS_OPTIONS}
            required
          />
          <FormField name="start_date" label="Start Date" type="date" value={form.start_date} onChange={setField} />
          <FormField name="end_date" label="End Date" type="date" value={form.end_date} onChange={setField} />
          <FormField name="passing_marks" label="Passing Marks" type="number" value={form.passing_marks} onChange={setField} />
          <div className="span-full">
            <FormField name="instruction" label="Instructions" type="textarea" value={form.instruction} onChange={setField} />
          </div>
        </div>

        {institutionOptions && institutionOptions.length > 0 && (
          <div className="institution-picker">
            <span className="question-hint">Publish to institutions</span>
            <div className="institution-list">
              {institutionOptions.map((option) => (
                <label key={option.value} className="institution-chip">
                  <input
                    type="checkbox"
                    checked={form.institution_ids.includes(Number(option.value))}
                    onChange={() => toggleInstitution(Number(option.value))}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        )}
      </DashboardCard>

      {/* SECTIONS */}
      {form.sections.map((section, sectionIndex) => (
        <div key={section.key} className="section-card">
          <div className="section-card-header">
            <span className="section-number">Section {sectionIndex + 1}</span>
            <input
              className="section-name-input"
              placeholder="Section name"
              value={section.name}
              onChange={(e) => updateSection(section.key, { name: e.target.value })}
            />
            {form.sections.length > 1 && (
              <button className="icon-btn danger" onClick={() => removeSection(section.key)} aria-label="Remove section" title="Remove section">
                <FiTrash2 />
              </button>
            )}
          </div>

          {section.questions.map((question, questionIndex) => (
            <QuestionEditor
              key={question.key}
              index={questionIndex}
              question={question}
              onChange={(next) => updateQuestion(section, next)}
              onRemove={() =>
                updateSection(section.key, {
                  questions: section.questions.filter((item) => item.key !== question.key),
                })
              }
              canRemove={section.questions.length > 1}
            />
          ))}

          <button
            className="link-btn"
            onClick={() => updateSection(section.key, { questions: [...section.questions, emptyQuestion()] })}
          >
            <FiPlus /> Add question
          </button>
        </div>
      ))}

      <button
        className="btn-outline-grey add-section-btn"
        onClick={() => setForm((current) => ({ ...current, sections: [...current.sections, emptySection()] }))}
      >
        <FiPlus /> Add section
      </button>
    </div>
  );
};

export default AssessmentEditor;
