import './ExamQuestions.css';
import { FiCheckCircle } from "react-icons/fi";

import type { AssessmentDetail, Question } from "../../api/assessment/AssessmentApi";
import { formatEnum } from "../../../utils/format";
import { isChoice, isRange, isTextAnswer, toFormState } from "./assessmentForm";

// Same correct-answer reading as the editor (positions or option text)
const correctPositions = (question: Question) =>
  toFormState({
    id: 0, title: "", instruction: null, status: "DRAFT", start_date: null, end_date: null,
    passing_marks: null, course_id: null, institution_ids: [], sections: [{ id: 0, name: "", questions: [question] }],
  }).sections[0].questions[0].correctOptions;

// Read-only sections and questions for the exam view page
const ExamQuestions = ({ exam }: { exam: AssessmentDetail }) => {
  if (exam.sections.length === 0) {
    return (
      <section className="detail-card">
        <h3>Questions</h3>
        <p className="detail-loading">No questions yet</p>
      </section>
    );
  }

  return (
    <>
      {exam.sections.map((section, sectionIndex) => (
        <section key={section.id} className="detail-card">
          <h3>
            Section {sectionIndex + 1}: {section.name}
            <span className="exam-question-count">{section.questions.length} questions</span>
          </h3>

          <ol className="exam-questions">
            {section.questions.map((question) => {
              const correct = isChoice(question.question_type) ? correctPositions(question) : [];
              return (
                <li key={question.id}>
                  <div className="exam-question-head">
                    <span className="exam-question-text">{question.question_text}</span>
                    <span className="status-badge">{formatEnum(question.question_type)}</span>
                    {question.required && <span className="status-badge red">Required</span>}
                  </div>

                  {isChoice(question.question_type) && (
                    <ul className="exam-options">
                      {question.options.map((option, position) => (
                        <li key={option.id} className={correct.includes(position) ? "correct" : ""}>
                          {correct.includes(position) && <FiCheckCircle />}
                          {option.option || "-"}
                        </li>
                      ))}
                    </ul>
                  )}

                  {isTextAnswer(question.question_type) && question.correct_answer !== null && !Array.isArray(question.correct_answer) && (
                    <p className="exam-answer">
                      <FiCheckCircle /> Expected answer: {String(question.correct_answer)}
                    </p>
                  )}

                  {isRange(question.question_type) && (
                    <p className="exam-answer muted">
                      Scale {question.min_range ?? "-"} ({question.min_label || "min"}) to {question.max_range ?? "-"} (
                      {question.max_label || "max"})
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </>
  );
};

export default ExamQuestions;
