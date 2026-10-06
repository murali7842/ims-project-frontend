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

export const register = async (data: any) => {
  try {
    const response = await axiosLoginInstance.post(
      "user/register",
      data,   
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during register:", error);
    throw error;
  }
};

export const forgot = async (data: any) => {
  try {
    const response = await axiosLoginInstance.post(
      "auth/forgot-password",
      data,   
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during register:", error);
    throw error;
  }
};


export const resetPassword = async (data: any) => {

    try {
        const response = await axiosLoginInstance.post(
            "auth/reset-password",
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;

    } catch (error) {

        console.error("Reset Password Error:", error);
        throw error;
    }
};