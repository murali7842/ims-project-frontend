import { axiosInstance } from "../../../../config/config";
import type { ApiResponse, DropDown, InstitutionDropDown } from "../../../types/api";
import type { BackendUserRole } from "../user/UserApi";
import type { BatchMode } from "../batch/BatchApi";
import type { PublishStatus } from "../assessment/AssessmentApi";

// All dashboard endpoints accept institution_id for admins (omit = all institutions).
// For operators the backend ignores it and always uses their own institution.

export interface DashboardFilter {
  institution_id?: number;
}

export interface UsersByRoleFilter extends DashboardFilter {
  year?: number;
  // Requires year
  month?: number;
}

export interface DashboardSummary {
  total_institutions: number;
  total_operators: number;
  total_teachers: number;
  total_students: number;
}

export interface RoleCount {
  role: BackendUserRole;
  count: number;
}

export interface RecentInstitution {
  id: number;
  name: string;
  email: string;
  created_at: string | null;
}

export interface RecentUser {
  id: number;
  name: string;
  email: string;
  role: BackendUserRole;
  created_at: string | null;
}

// Every endpoint returns { body: T }; unwrap it so callers get T directly
const getBody = async <T,>(url: string, params?: object): Promise<T> => {
  const response = await axiosInstance.get<ApiResponse<T>>(url, { params });
  return response.data.body as T;
};

// Admin: all institutions. Operator: only their own institution.
export const getDashboardInstitutions = () => getBody<InstitutionDropDown[]>("dashboard/institutions");

// Institution dropdown options that work for both admins and operators
// (GET /institution/get_all_institutions is admin only)
export const getInstitutionDropdownOptions = async () =>
  (await getDashboardInstitutions()).map((institution) => ({
    value: String(institution.id),
    label: institution.name,
  }));

export const getDashboardSummary = (filter: DashboardFilter = {}) =>
  getBody<DashboardSummary>("dashboard/summary", filter);

// Always returns every role, with 0 when there is no data
export const getUsersByRole = (filter: UsersByRoleFilter = {}) =>
  getBody<RoleCount[]>("dashboard/users_by_role", filter);

export const getRecentInstitutions = (filter: DashboardFilter = {}, limit = 5) =>
  getBody<RecentInstitution[]>("dashboard/recent_institutions", { ...filter, limit });

export const getRecentUsers = (filter: DashboardFilter = {}, limit = 5) =>
  getBody<RecentUser[]>("dashboard/recent_users", { ...filter, limit });

export interface TeacherDashboard {
  total_courses: number;
  total_batches: number;
  total_students: number;
  upcoming_exams: number;
  batches: {
    id: number;
    name: string;
    course: DropDown | null;
    timing: string;
    mode: BatchMode;
    start_date: string;
    end_date: string;
    student_limit: number;
    total_students: number;
  }[];
  recent_exams: {
    id: number;
    title: string;
    status: PublishStatus;
    start_date: string | null;
    end_date: string | null;
    course: DropDown | null;
  }[];
}

// Teacher only: counts, the teacher's batches and recent exams for their courses
export const getTeacherDashboard = () => getBody<TeacherDashboard>("dashboard/teacher");
