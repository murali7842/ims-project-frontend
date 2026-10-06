import { axiosInstance } from "../../../../config/config";
import type { ApiResponse, ListParams, PaginatedResponse } from "../../../types/api";

export interface Course {
  id: number;
  name: string;
  description: string | null;
  duration: string | null;
  course_fee: number;
  institution_id: number | null;
  teacher_id: number;
}

export interface CourseCreatePayload {
  name: string;
  description: string;
  duration: string;
  course_fee: number;
  institution_id: number;
  teacher_id: number;
}

// The institution can't be changed after creation
export type CourseUpdatePayload = Partial<Omit<CourseCreatePayload, "institution_id">>;

export const getAllCourses = async (params: ListParams = {}) => {
  const response = await axiosInstance.get<PaginatedResponse<Course>>("course/get_all_courses", { params });
  return response.data;
};

export const getCourseById = async (id: number) => {
  const response = await axiosInstance.get<ApiResponse<Course>>(`course/${id}`);
  return response.data;
};

export const createCourse = async (data: CourseCreatePayload) => {
  const response = await axiosInstance.post<ApiResponse<number>>("course", data);
  return response.data;
};

export const updateCourse = async (id: number, data: CourseUpdatePayload) => {
  const response = await axiosInstance.patch<ApiResponse<string>>(`course/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<string>>(`course/${id}`);
  return response.data;
};

export const getCourseOptions = async () => {
  const response = await getAllCourses({ size: 100, sort_by: "name", sort_order: "asc" });
  return response.body.map((course) => ({
    value: String(course.id),
    label: course.name,
    parent: course.institution_id ? String(course.institution_id) : undefined,
    data: { institution_id: course.institution_id, course_fee: course.course_fee },
  }));
};
