import { axiosInstance } from "../../../../config/config";
import type { ApiResponse, ListParams, PaginatedResponse } from "../../../types/api";

export type PublishStatus = "PUBLISHED" | "DRAFT";

export type QuestionType =
  | "SHORT_ANSWER"
  | "PARAGRAPH"
  | "MULTIPLE_CHOICE"
  | "CHECKBOXES"
  | "DROPDOWN"
  | "FILE_UPLOAD"
  | "RATING"
  | "LINEAR_SCALE";

export type CorrectAnswer = string | number | (string | number)[] | null;

// List item (no questions)
export interface Assessment {
  id: number;
  title: string;
  instruction: string | null;
  status: PublishStatus;
  start_date: string | null;
  end_date: string | null;
  passing_marks: number | null;
}

export interface QuestionOption {
  id: number;
  option: string | null;
  is_correct: boolean | null;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: QuestionType;
  required: boolean | null;
  min_range: number | null;
  max_range: number | null;
  min_label: string | null;
  max_label: string | null;
  correct_answer: CorrectAnswer;
  options: QuestionOption[];
}

export interface Section {
  id: number;
  name: string;
  questions: Question[];
}

export interface AssessmentDetail extends Assessment {
  course_id: number | null;
  institution_ids: number[];
  sections: Section[];
}

// Items with an id are updated, items without one are created and
// existing items left out are removed.
export interface QuestionPayload {
  id?: number;
  question_text: string;
  question_type: QuestionType;
  required: boolean;
  min_range?: number | null;
  max_range?: number | null;
  min_label?: string | null;
  max_label?: string | null;
  correct_answer?: CorrectAnswer;
  options: { id?: number; option: string }[];
}

export interface AssessmentPayload {
  id?: number;
  title: string;
  instruction: string | null;
  status: PublishStatus;
  start_date: string | null;
  end_date: string | null;
  passing_marks: number | null;
  course_id: number;
  section: { id?: number; name: string; questions: QuestionPayload[] }[];
  institution_ids: number[] | null;
}

// Filters: status, course_id
export const getAllAssessments = async (params: ListParams = {}) => {
  const response = await axiosInstance.get<PaginatedResponse<Assessment>>(
    "student_assessment/get_all_assessments",
    { params }
  );
  return response.data;
};

export const getAssessmentById = async (id: number) => {
  const response = await axiosInstance.get<ApiResponse<AssessmentDetail>>(`student_assessment/${id}`);
  return response.data;
};

export const createAssessment = async (data: AssessmentPayload) => {
  const response = await axiosInstance.post<ApiResponse<string>>("student_assessment", data);
  return response.data;
};

export const updateAssessment = async (id: number, data: AssessmentPayload) => {
  const response = await axiosInstance.put<ApiResponse<string>>("student_assessment", { ...data, id });
  return response.data;
};

export const deleteAssessment = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<string>>(`student_assessment/${id}`);
  return response.data;
};
