import { axiosLoginInstance } from "../../../../config/config";
import { decodeToken, normalizeRole, setTokens, setUser } from "../../../utils/authStorage";
import { getUserById } from "../user/UserApi";
import { getDashboardInstitutions } from "../dashboard/DashboardApi";

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

// Saves the tokens and the logged in user's profile (name, role, institution).
// The access token only carries the user id and email, so the profile comes
// from GET /user/{id}. That endpoint is admin only, so for other roles we fall
// back to what the token has.
export const startSession = async (accessToken: string, refreshToken?: string | null) => {
  setTokens(accessToken, refreshToken);

  const payload = decodeToken(accessToken);
  const userId = Number(payload?.sub);

  try {
    const { body: user } = await getUserById(userId);
    if (!user) throw new Error("User not found");

    setUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      institution: user.institution,
    });
  } catch {
    // Not an admin. For operators, /dashboard/institutions returns only their
    // own institution, which scopes their lists and pre-fills their forms.
    const institutions = await getDashboardInstitutions().catch(() => []);

    setUser({
      id: userId,
      name: payload?.name ?? payload?.email ?? "User",
      email: payload?.email ?? "",
      role: normalizeRole(payload?.role),
      institution: institutions.length === 1 ? institutions[0] : null,
    });
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