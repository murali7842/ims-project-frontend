import { axiosLoginInstance } from "../../../../config/config";

export const login = async (data: URLSearchParams) => {
  try {
    const response = await axiosLoginInstance.post(
      "auth/login",
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};
