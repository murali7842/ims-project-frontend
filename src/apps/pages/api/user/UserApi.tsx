import { axiosInstance } from "../../../../config/config";
import type { ApiResponse, InstitutionDropDown, ListParams, PaginatedResponse } from "../../../types/api";

export type BackendUserRole = "ADMIN" | "OPERATOR" | "TEACHER" | "STUDENT";

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  role: BackendUserRole;
  institution: InstitutionDropDown | null;
}

export interface UserUpdatePayload {
  name: string;
  email: string;
  phone_number: string;
  address: string;
}

export const getAllUsers = async (params: ListParams = {}) => {
  const response = await axiosInstance.get<PaginatedResponse<User>>("user/get_all_users", { params });
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await axiosInstance.get<ApiResponse<User>>(`user/${id}`);
  return response.data;
};

export const updateUser = async (id: number, data: UserUpdatePayload) => {
  const response = await axiosInstance.put<ApiResponse<string>>("user", { ...data, id });
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<string>>(`user/${id}`);
  return response.data;
};
