import { axiosInstance } from "../../../../config/config";
import type { ApiResponse, ListParams, PaginatedResponse } from "../../../types/api";

export interface Payment {
  id: number;
  student_id: number;
  amount_paid: number;
  // Returned as a date (YYYY-MM-DD)
  payment_date: string | null;
  payment_mode: string;
  remarks: string | null;
}

export interface PaymentPayload {
  student_id: number;
  amount_paid: number;
  // Sent as a date-time (YYYY-MM-DDTHH:mm:ss)
  payment_date: string;
  payment_mode: string;
  remarks: string;
}

// Filters: student_id
export const getAllPayments = async (params: ListParams = {}) => {
  const response = await axiosInstance.get<PaginatedResponse<Payment>>("payment/get_all_payments", { params });
  return response.data;
};

export const getPaymentById = async (id: number) => {
  const response = await axiosInstance.get<ApiResponse<Payment>>(`payment/${id}`);
  return response.data;
};

export const createPayment = async (data: PaymentPayload) => {
  const response = await axiosInstance.post<ApiResponse<number>>("payment", data);
  return response.data;
};

export const updatePayment = async (id: number, data: PaymentPayload) => {
  const response = await axiosInstance.put<ApiResponse<string>>("payment", { ...data, id });
  return response.data;
};

export const deletePayment = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<string>>(`payment/${id}`);
  return response.data;
};
