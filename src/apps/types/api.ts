// Response envelopes shared by every backend endpoint

export interface ApiResponse<T> {
  success: boolean;
  msg: string | null;
  msg_code: string | null;
  body: T | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  msg: string | null;
  msg_code: string | null;
  total_pages: number;
  total_elements: number;
  page_elements: number;
  page_number: number;
  size: number;
  body: T[];
}

export type SortOrder = "asc" | "desc";

export interface ListParams {
  search?: string;
  sort_by?: string;
  sort_order?: SortOrder;
  page?: number;
  size?: number;
  // Module specific filters, e.g. role, course_id, batch_id
  [filter: string]: string | number | undefined;
}

export interface InstitutionDropDown {
  id: number;
  name: string;
}
