import type {
  AssessmentDetail,
  AssessmentPayload,
  CorrectAnswer,
  PublishStatus,
  Question,
  QuestionPayload,
  QuestionType,
} from "../../api/assessment/AssessmentApi";

// Editor state for the assessment builder, plus conversion to / from the API shape.

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "MULTIPLE_CHOICE", label: "Multiple choice" },
  { value: "CHECKBOXES", label: "Checkboxes" },
  { value: "DROPDOWN", label: "Dropdown" },
  { value: "SHORT_ANSWER", label: "Short answer" },
  { value: "PARAGRAPH", label: "Paragraph" },
  { value: "RATING", label: "Rating" },
  { value: "LINEAR_SCALE", label: "Linear scale" },
  { value: "FILE_UPLOAD", label: "File upload" },
];

const SINGLE_CHOICE: QuestionType[] = ["MULTIPLE_CHOICE", "DROPDOWN"];
const TEXT_ANSWER: QuestionType[] = ["SHORT_ANSWER", "PARAGRAPH"];
const RANGE: QuestionType[] = ["RATING", "LINEAR_SCALE"];

export const isChoice = (type: QuestionType) => SINGLE_CHOICE.includes(type) || type === "CHECKBOXES";
export const isSingleChoice = (type: QuestionType) => SINGLE_CHOICE.includes(type);
export const isTextAnswer = (type: QuestionType) => TEXT_ANSWER.includes(type);
export const isRange = (type: QuestionType) => RANGE.includes(type);

export interface OptionState {
  key: string;
  id?: number;
  option: string;
}

export interface QuestionState {
  key: string;
  id?: number;
  question_text: string;
  question_type: QuestionType;
  required: boolean;
  options: OptionState[];
  // Choice questions: positions (0 based) of the correct options
  correctOptions: number[];
  // Short answer / paragraph: expected answer
  correctText: string;
  min_range: string;
  max_range: string;
  min_label: string;
  max_label: string;
}

export interface SectionState {
  key: string;
  id?: number;
  name: string;
  questions: QuestionState[];
}

export interface AssessmentFormState {
  title: string;
  instruction: string;
  status: PublishStatus;
  start_date: string;
  end_date: string;
  passing_marks: string;
  course_id: string;
  institution_ids: number[];
  sections: SectionState[];
}

let keySequence = 0;
export const newKey = () => `item-${++keySequence}`;

export const emptyOption = (): OptionState => ({ key: newKey(), option: "" });

export const emptyQuestion = (): QuestionState => ({
  key: newKey(),
  question_text: "",
  question_type: "MULTIPLE_CHOICE",
  required: true,
  options: [emptyOption(), emptyOption()],
  correctOptions: [],
  correctText: "",
  min_range: "1",
  max_range: "5",
  min_label: "",
  max_label: "",
});

export const emptySection = (): SectionState => ({ key: newKey(), name: "", questions: [emptyQuestion()] });

export const emptyAssessment = (): AssessmentFormState => ({
  title: "",
  instruction: "",
  status: "DRAFT",
  start_date: "",
  end_date: "",
  passing_marks: "",
  course_id: "",
  institution_ids: [],
  sections: [emptySection()],
});

// Existing data stores correct answers either as option text or as option positions
const toCorrectOptions = (answer: CorrectAnswer, question: Question) => {
  const values = Array.isArray(answer) ? answer : answer === null || answer === undefined ? [] : [answer];

  return values
    .map((value) => {
      const byText = question.options.findIndex((option) => option.option === String(value));
      if (byText >= 0) return byText;
      const position = Number(value);
      return Number.isInteger(position) && position >= 0 && position < question.options.length ? position : -1;
    })
    .filter((position) => position >= 0);
};

const toQuestionState = (question: Question): QuestionState => ({
  key: newKey(),
  id: question.id,
  question_text: question.question_text,
  question_type: question.question_type,
  required: question.required ?? false,
  options: question.options.map((option) => ({ key: newKey(), id: option.id, option: option.option ?? "" })),
  correctOptions: isChoice(question.question_type) ? toCorrectOptions(question.correct_answer, question) : [],
  correctText:
    isTextAnswer(question.question_type) && question.correct_answer !== null && !Array.isArray(question.correct_answer)
      ? String(question.correct_answer)
      : "",
  min_range: question.min_range?.toString() ?? "1",
  max_range: question.max_range?.toString() ?? "5",
  min_label: question.min_label ?? "",
  max_label: question.max_label ?? "",
});

export const toFormState = (detail: AssessmentDetail): AssessmentFormState => ({
  title: detail.title,
  instruction: detail.instruction ?? "",
  status: detail.status,
  start_date: detail.start_date ?? "",
  end_date: detail.end_date ?? "",
  passing_marks: detail.passing_marks?.toString() ?? "",
  course_id: detail.course_id?.toString() ?? "",
  institution_ids: [...new Set(detail.institution_ids)],
  sections: detail.sections.map((section) => ({
    key: newKey(),
    id: section.id,
    name: section.name,
    questions: section.questions.map(toQuestionState),
  })),
});

const toQuestionPayload = (question: QuestionState): QuestionPayload => {
  const type = question.question_type;
  const payload: QuestionPayload = {
    id: question.id,
    question_text: question.question_text.trim(),
    question_type: type,
    required: question.required,
    options: [],
    correct_answer: null,
  };

  if (isChoice(type)) {
    payload.options = question.options.map((option) => ({ id: option.id, option: option.option.trim() }));
    // TODO: confirm with backend whether correct_answer should hold option positions or option ids
    payload.correct_answer = isSingleChoice(type)
      ? question.correctOptions[0] ?? null
      : [...question.correctOptions].sort((a, b) => a - b);
  } else if (isTextAnswer(type)) {
    payload.correct_answer = question.correctText.trim() || null;
  } else if (isRange(type)) {
    payload.min_range = Number(question.min_range);
    payload.max_range = Number(question.max_range);
    payload.min_label = question.min_label.trim() || null;
    payload.max_label = question.max_label.trim() || null;
  }

  return payload;
};

// `includeInstitutions` false sends null, which tells the backend to leave the
// institution mapping unchanged (used for non-admins and unchanged edits).
export const toPayload = (form: AssessmentFormState, includeInstitutions: boolean): AssessmentPayload => ({
  title: form.title.trim(),
  instruction: form.instruction.trim() || null,
  status: form.status,
  start_date: form.start_date || null,
  end_date: form.end_date || null,
  passing_marks: form.passing_marks ? Number(form.passing_marks) : null,
  course_id: Number(form.course_id),
  institution_ids: includeInstitutions ? form.institution_ids : null,
  section: form.sections.map((section) => ({
    id: section.id,
    name: section.name.trim(),
    questions: section.questions.map(toQuestionPayload),
  })),
});

// Returns the first problem found, or "" when the form is valid
export const validateAssessment = (form: AssessmentFormState) => {
  if (!form.title.trim()) return "Title is required";
  if (!form.course_id) return "Course is required";
  if (form.start_date && form.end_date && form.end_date < form.start_date) return "End date must be after start date";
  if (form.sections.length === 0) return "Add at least one section";

  for (const [sectionIndex, section] of form.sections.entries()) {
    const sectionLabel = `Section ${sectionIndex + 1}`;
    if (!section.name.trim()) return `${sectionLabel}: name is required`;
    if (section.questions.length === 0) return `${sectionLabel}: add at least one question`;

    for (const [questionIndex, question] of section.questions.entries()) {
      const questionLabel = `${sectionLabel}, question ${questionIndex + 1}`;
      if (!question.question_text.trim()) return `${questionLabel}: question text is required`;

      if (isChoice(question.question_type)) {
        if (question.options.length < 2) return `${questionLabel}: add at least two options`;
        if (question.options.some((option) => !option.option.trim())) return `${questionLabel}: options can't be empty`;
      }

      if (isRange(question.question_type) && Number(question.min_range) >= Number(question.max_range)) {
        return `${questionLabel}: max must be greater than min`;
      }
    }
  }

  return "";
};
