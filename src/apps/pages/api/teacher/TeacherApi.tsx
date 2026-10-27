import { axiosInstance } from "../../../../config/config";
import type { ApiResponse, DropDown, InstitutionDropDown, ListParams, PaginatedResponse } from "../../../types/api";

export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  role: string;
  institution: InstitutionDropDown | null;
}

// GET /teacher/{id}: courses taught and their batches
export interface TeacherDetail extends Teacher {
  total_courses: number;
  total_batches: number;
  courses: { id: number; name: string; total_batches: number; batches: DropDown[] }[];
}

export interface TeacherPayload {
  name: string;
  email: string;
  password?: string;
  phone_number: string;
  address: string;
  institution_id: number;
}

// Filters: institution_id (admin only; operators are scoped by the backend). No sorting.
export const getAllTeachers = async (params: ListParams = {}) => {
  const response = await axiosInstance.get<PaginatedResponse<Teacher>>("teacher/get_all_teacher", { params });
  return response.data;
};

export const getTeacherById = async (id: number) => {
  const response = await axiosInstance.get<ApiResponse<TeacherDetail>>(`teacher/${id}`);
  return response.data;
};

export const createTeacher = async (data: TeacherPayload) => {
  const response = await axiosInstance.post<ApiResponse<number>>("teacher", data);
  return response.data;
};

export const updateTeacher = async (id: number, data: TeacherPayload) => {
  const response = await axiosInstance.put<ApiResponse<string>>("teacher", { ...data, id });
  return response.data;
};

export const deleteTeacher = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<string>>(`teacher/${id}`);
  return response.data;
};

// Teacher ids are user ids, which is what course.teacher_id expects
export const getTeacherOptions = async () => {
  const response = await getAllTeachers({ size: 100 });
  return response.body.map((teacher) => ({
    value: String(teacher.id),
    label: teacher.name,
    parent: teacher.institution ? String(teacher.institution.id) : undefined,
  }));
};
