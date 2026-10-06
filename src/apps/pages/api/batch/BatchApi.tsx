import { axiosInstance } from "../../../../config/config";
import type { ApiResponse, ListParams, PaginatedResponse } from "../../../types/api";

export type BatchMode = "ONLINE" | "OFFLINE" | "HYBRID";

export interface Batch {
  id: number;
  name: string;
  timing: string;
  student_limit: number;
  start_date: string;
  end_date: string;
  mode: BatchMode;
  course_id: number;
  institution_id: number;
}

export interface BatchCreatePayload {
  name: string;
  timing: string;
  student_limit: number;
  start_date: string;
  end_date: string;
  mode: BatchMode;
  course_id: number;
  institution_id: number;
}

// The institution can't be changed after creation
export type BatchUpdatePayload = Partial<Omit<BatchCreatePayload, "institution_id">>;

export const getAllBatches = async (params: ListParams = {}) => {
  const response = await axiosInstance.get<PaginatedResponse<Batch>>("batch/get_all_batches", { params });
  return response.data;
};

export const getBatchById = async (id: number) => {
  const response = await axiosInstance.get<ApiResponse<Batch>>(`batch/${id}`);
  return response.data;
};

export const createBatch = async (data: BatchCreatePayload) => {
  const response = await axiosInstance.post<ApiResponse<number>>("batch", data);
  return response.data;
};

export const updateBatch = async (id: number, data: BatchUpdatePayload) => {
  const response = await axiosInstance.patch<ApiResponse<string>>(`batch/${id}`, data);
  return response.data;
};

export const deleteBatch = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<string>>(`batch/${id}`);
  return response.data;
};

// Grouped by course (parent) so a batch dropdown can follow the chosen course
export const getBatchOptions = async () => {
  const response = await getAllBatches({ size: 100, sort_by: "name", sort_order: "asc" });
  return response.body.map((batch) => ({
    value: String(batch.id),
    label: batch.name,
    parent: String(batch.course_id),
    data: { institution_id: batch.institution_id },
  }));
};
