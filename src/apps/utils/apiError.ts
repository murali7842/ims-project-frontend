import axios from "axios";

interface ValidationDetail {
  field: string;
  msg: string;
}

// Turns a backend error into a readable message.
// Errors look like { msg, msg_code } and validation errors add data.details.
export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;
  const details: ValidationDetail[] | undefined = data?.data?.details;

  if (details?.length) {
    return details.map((detail) => `${detail.field}: ${detail.msg}`).join(", ");
  }

  return data?.msg || data?.detail || data?.message || error.message || fallback;
};
