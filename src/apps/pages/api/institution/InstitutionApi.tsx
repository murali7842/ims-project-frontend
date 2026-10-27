import { axiosInstance } from "../../../../config/config";
import type { ApiResponse, DropDown, ListParams, PaginatedResponse } from "../../../types/api";

export interface Institution {
  id: number;
  name: string;
  email: string;
  address: string;
  contact_number: string | null;
}

// GET /institution/{id}: institution-wide counts and each course with its batches
export interface InstitutionDetail extends Institution {
  total_courses: number;
  total_batches: number;
  total_teachers: number;
  total_operators: number;
  total_students: number;
  courses: {
    id: number;
    name: string;
    course_fee: number;
    teacher: DropDown | null;
    batches: DropDown[];
  }[];
}

export interface InstitutionPayload {
  name: string;
  email: string;
  address: string;
  contact_number: string;
}

export const getAllInstitutions = async (params: ListParams = {}) => {
  const response = await axiosInstance.get<PaginatedResponse<Institution>>(
    "institution/get_all_institutions",
    { params }
  );
  return response.data;
};

export const getInstitutionById = async (id: number) => {
  const response = await axiosInstance.get<ApiResponse<InstitutionDetail>>(`institution/${id}`);
  return response.data;
};

export const createInstitution = async (data: InstitutionPayload) => {
  const response = await axiosInstance.post<ApiResponse<Institution>>("institution", data);
  return response.data;
};

export const updateInstitution = async (id: number, data: InstitutionPayload) => {
  const response = await axiosInstance.put<ApiResponse<string>>("institution", { ...data, id });
  return response.data;
};

export const deleteInstitution = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<string>>(`institution/${id}`);
  return response.data;
};

// Options for institution dropdowns (backend max page size is 100)
export const getInstitutionOptions = async () => {
  const response = await getAllInstitutions({ size: 100, sort_by: "name", sort_order: "asc" });
  return response.body.map((institution) => ({
    value: String(institution.id),
    label: institution.name,
  }));
};
