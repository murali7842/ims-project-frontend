import { FiPlus, FiTrash2, FiX } from "react-icons/fi";

import FormField from "../../../components/common_components/form_field/FormField";
import type { QuestionType } from "../../api/assessment/AssessmentApi";
import {
  QUESTION_TYPES,
  emptyOption,
  isChoice,
  isRange,
  isSingleChoice,
  isTextAnswer,
} from "./assessmentForm";
import type { QuestionState } from "./assessmentForm";

interface QuestionEditorProps {
  index: number;
  question: QuestionState;
  onChange: (question: QuestionState) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const QuestionEditor = ({ index, question, onChange, onRemove, canRemove }: QuestionEditorProps) => {
  const type = question.question_type;
  const update = (changes: Partial<QuestionState>) => onChange({ ...question, ...changes });

  const handleTypeChange = (nextType: QuestionType) => {
    update({
      question_type: nextType,
      correctOptions: [],
      options: isChoice(nextType) && question.options.length < 2 ? [emptyOption(), emptyOption()] : question.options,
    });
  };

  const toggleCorrect = (position: number) => {
    if (isSingleChoice(type)) {
      update({ correctOptions: [position] });
      return;
    }
    const selected = question.correctOptions.includes(position);
    update({
      correctOptions: selected
        ? question.correctOptions.filter((value) => value !== position)
        : [...question.correctOptions, position],
    });
  };

  const removeOption = (position: number) => {
    update({
      options: question.options.filter((_, i) => i !== position),
      // Keep correct markers pointing at the same options after the removal
      correctOptions: question.correctOptions
        .filter((value) => value !== position)
        .map((value) => (value > position ? value - 1 : value)),
    });
  };

  const updateOption = (position: number, text: string) => {
    update({
      options: question.options.map((option, i) => (i === position ? { ...option, option: text } : option)),
    });
  };

  return (
    <div className="question-card">
      <div className="question-card-header">
        <span className="question-number">Q{index + 1}</span>
        <label className="required-toggle">
          <input type="checkbox" checked={question.required} onChange={(e) => update({ required: e.target.checked })} />
          Required
        </label>
        {canRemove && (
          <button className="icon-btn danger" onClick={onRemove} aria-label="Remove question" title="Remove question">
            <FiTrash2 />
          </button>
        )}
      </div>

      <div className="question-grid">
        <div className="question-text">
          <FormField
            name={`${question.key}-text`}
            label="Question"
            value={question.question_text}
            onChange={(_, value) => update({ question_text: value })}
            required
          />
        </div>
        <FormField
          name={`${question.key}-type`}
          label="Type"
          type="select"
          value={type}
          onChange={(_, value) => handleTypeChange(value as QuestionType)}
          options={QUESTION_TYPES}
          placeholder="Select type"
        />
      </div>

      {/* OPTIONS */}
      {isChoice(type) && (
        <div className="question-options">
          <span className="question-hint">
            Options — mark the correct {isSingleChoice(type) ? "answer" : "answers"}
          </span>
          {question.options.map((option, position) => (
            <div key={option.key} className="option-row">
              <input
                type={isSingleChoice(type) ? "radio" : "checkbox"}
                name={`${question.key}-correct`}
                checked={question.correctOptions.includes(position)}
                onChange={() => toggleCorrect(position)}
                aria-label={`Mark option ${position + 1} as correct`}
              />
              <input
                type="text"
                className="option-input"
                placeholder={`Option ${position + 1}`}
                value={option.option}
                onChange={(e) => updateOption(position, e.target.value)}
              />
              <button
                className="icon-btn"
                onClick={() => removeOption(position)}
                disabled={question.options.length <= 2}
                aria-label="Remove option"
                title="Remove option"
              >
                <FiX />
              </button>
            </div>
          ))}
          <button className="link-btn" onClick={() => update({ options: [...question.options, emptyOption()] })}>
            <FiPlus /> Add option
          </button>
        </div>
      )}

      {/* EXPECTED ANSWER */}
      {isTextAnswer(type) && (
        <FormField
          name={`${question.key}-answer`}
          label="Expected answer (optional, used for auto grading)"
          type={type === "PARAGRAPH" ? "textarea" : "text"}
          value={question.correctText}
          onChange={(_, value) => update({ correctText: value })}
        />
      )}

      {/* RANGE */}
      {isRange(type) && (
        <div className="question-grid four">
          <FormField name={`${question.key}-min`} label="Min" type="number" value={question.min_range} onChange={(_, value) => update({ min_range: value })} />
          <FormField name={`${question.key}-max`} label="Max" type="number" value={question.max_range} onChange={(_, value) => update({ max_range: value })} />
          <FormField name={`${question.key}-min-label`} label="Min label" value={question.min_label} onChange={(_, value) => update({ min_label: value })} />
          <FormField name={`${question.key}-max-label`} label="Max label" value={question.max_label} onChange={(_, value) => update({ max_label: value })} />
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
