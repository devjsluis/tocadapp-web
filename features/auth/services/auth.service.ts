import { api } from "@/lib/axios";
import { tokenStorage } from "@/features/auth/storage/token-storage";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "@/features/auth/types/auth";

export const authService = {
  register: async (userData: RegisterRequest) => {
    const { data } = await api.post("/users", userData);
    return data;
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/users/login", credentials);

    if (data.token) {
      tokenStorage.set(data.token);
    }

    return data;
  },

  logout: (): void => {
    tokenStorage.remove();
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post("/users/forgot-password", {
      email,
    });

    return data;
  },

  resetPassword: async (token: string, password: string) => {
    const { data } = await api.post("/users/reset-password", {
      token,
      password,
    });

    return data;
  },
};
