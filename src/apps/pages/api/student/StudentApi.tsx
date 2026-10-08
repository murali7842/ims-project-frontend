import { axiosInstance } from "../../../../config/config";
import type { ApiResponse, ListParams, PaginatedResponse } from "../../../types/api";

export type StudentStatus = "ACTIVE" | "INACTIVE";
export type PaymentStatus = "PAID" | "UNPAID" | "PARTIALLY_PAID";

export interface Student {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  guardian_name: string | null;
  guardian_phone: string | null;
  fee_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_status: PaymentStatus;
  status: StudentStatus;
  institution_id: number;
  course_id: number;
  batch_id: number;
}

export interface StudentPayload {
  name: string;
  email: string;
  phone_number: string;
  address: string;
  guardian_name: string;
  guardian_phone: string;
  status: StudentStatus;
  institution_id: number;
  course_id: number;
  batch_id: number;
}

// The backend's PaymentStatus enum has trailing commas (PAID = "PAID",), so PAID and
// UNPAID come back as ["PAID"] / ["UNPAID"]. Unwrap them until the backend is fixed.
const normalizeStudent = (student: Student): Student => {
  const status: unknown = student.payment_status;
  return Array.isArray(status) ? { ...student, payment_status: status[0] as PaymentStatus } : student;
};

// Filters: institution_id (admin only; operators are scoped by the backend), course_id, batch_id
export const getAllStudents = async (params: ListParams = {}) => {
  const response = await axiosInstance.get<PaginatedResponse<Student>>("student/get_all_students", { params });
  return { ...response.data, body: response.data.body.map(normalizeStudent) };
};

export const getStudentById = async (id: number) => {
  const response = await axiosInstance.get<ApiResponse<Student>>(`student/${id}`);
  const { body } = response.data;
  return { ...response.data, body: body ? normalizeStudent(body) : body };
};

export const createStudent = async (data: StudentPayload) => {
  const response = await axiosInstance.post<ApiResponse<number>>("student", data);
  return response.data;
};

export const updateStudent = async (id: number, data: StudentPayload) => {
  const response = await axiosInstance.put<ApiResponse<string>>("student", { ...data, id });
  return response.data;
};

export const deleteStudent = async (id: number) => {
  const response = await axiosInstance.delete<ApiResponse<string>>(`student/${id}`);
  return response.data;
};

export const getStudentOptions = async () => {
  const response = await getAllStudents({ size: 100, sort_by: "name", sort_order: "asc" });
  return response.body.map((student) => ({
    value: String(student.id),
    label: `${student.name} (${student.email})`,
    data: { balance_amount: student.balance_amount },
  }));
};
