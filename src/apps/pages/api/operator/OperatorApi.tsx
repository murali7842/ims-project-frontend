import { axiosInstance } from "../../../../config/config";
import type { ApiResponse, InstitutionDropDown, ListParams, PaginatedResponse } from "../../../types/api";

export interface Operator {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  role: string;
  institution: InstitutionDropDown | null;
}

export interface OperatorPayload {
  name: string;
  email: string;
  password?: string;
  phone_number: string;
  address: string;
  institution_id: number;
}

export const getAllOperators = async (params: ListParams = {}) => {
  const response = await axiosInstance.get<PaginatedResponse<Operator>>(
    "operator/get_all_operators",
    { params }
  );
  return response.data;
};

export const getOperatorById = async (id: number) => {
  const response = await axiosInstance.get<ApiResponse<Operator>>(`operator/${id}`);
  return response.data;
};

export const createOperator = async (data: OperatorPayload) => {
  const response = await axiosInstance.post<ApiResponse<number>>("operator", data);
  return response.data;
};

export const updateOperator = async (id: number, data: OperatorPayload) => {
  const response = await axiosInstance.put<ApiResponse<string>>("operator", { ...data, id });
  return response.data;
};

export const deleteOperator = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<string>>(`operator/${id}`);
  return response.data;
};
