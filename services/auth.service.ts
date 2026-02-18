import { api } from "@/lib/axios";
import { RegisterRequest } from "@/types/auth";
import Cookies from "js-cookie";

export const authService = {
  register: async (userData: RegisterRequest) => {
    const { data } = await api.post("/users", userData);
    return data;
  },

  login: async (credentials: { email: string; password?: string }) => {
    const { data } = await api.post("/users/login", credentials);
    if (data.token) {
      Cookies.set("token", data.token, { expires: 1 });
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    }
    return data;
  },
};
