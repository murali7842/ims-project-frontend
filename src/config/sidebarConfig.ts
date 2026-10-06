import type { IconType } from "react-icons";
import {
  FiGrid,
  FiHome,
  FiUserCheck,
  FiUsers,
  FiUser,
  FiBookOpen,
  FiLayers,
  FiEdit,
  FiCalendar,
  FiCreditCard,
  FiBarChart2,
} from "react-icons/fi";

// Matches the backend UserRole enum (ADMIN / OPERATOR / TEACHER / STUDENT), lower cased
export type UserRole = "admin" | "operator" | "teacher" | "student";

export const USER_ROLES: UserRole[] = ["admin", "operator", "teacher", "student"];

export interface MenuItem {
  label: string;
  // Path segment under /dashboard ("" is the dashboard home)
  path: string;
  icon: IconType;
}

const DASHBOARD: MenuItem = { label: "Dashboard", path: "", icon: FiGrid };
const INSTITUTIONS: MenuItem = { label: "Institutions", path: "institutions", icon: FiHome };
const OPERATORS: MenuItem = { label: "Operators", path: "operators", icon: FiUserCheck };
const USERS: MenuItem = { label: "Users", path: "users", icon: FiUsers };
const STUDENTS: MenuItem = { label: "Students", path: "students", icon: FiUsers };
const TEACHERS: MenuItem = { label: "Teachers", path: "teachers", icon: FiUser };
const COURSES: MenuItem = { label: "Courses", path: "courses", icon: FiBookOpen };
const BATCHES: MenuItem = { label: "Batches", path: "batches", icon: FiLayers };
const EXAMS: MenuItem = { label: "Exams", path: "exams", icon: FiEdit };
const ATTENDANCE: MenuItem = { label: "Attendance", path: "attendance", icon: FiCalendar };
const PAYMENTS: MenuItem = { label: "Payments", path: "payments", icon: FiCreditCard };
const REPORTS: MenuItem = { label: "Reports", path: "reports", icon: FiBarChart2 };

// Sidebar options per role. This is also the source of truth for which
// dashboard routes a role is allowed to open (see DashboardRouter).
// Institutions, operators and users APIs are admin only; the rest allow admin and operator.
export const SIDEBAR_MENU: Record<UserRole, MenuItem[]> = {
  admin: [
    DASHBOARD,
    INSTITUTIONS,
    OPERATORS,
    USERS,
    TEACHERS,
    COURSES,
    BATCHES,
    STUDENTS,
    EXAMS,
    PAYMENTS,
    REPORTS,
  ],
  operator: [
    DASHBOARD,
    STUDENTS,
    TEACHERS,
    COURSES,
    BATCHES,
    EXAMS,
    ATTENDANCE,
    PAYMENTS,
    REPORTS,
  ],
  teacher: [DASHBOARD, STUDENTS, COURSES, BATCHES, EXAMS, ATTENDANCE],
  student: [DASHBOARD, COURSES, EXAMS, ATTENDANCE, PAYMENTS],
};
