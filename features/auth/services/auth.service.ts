import { api } from "@/lib/axios";
import { tokenStorage } from "@/features/auth/storage/token-storage";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "@/features/auth/types/auth";

type MessageResponse = {
  message: string;
};

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

  verifyEmail: async (token: string): Promise<MessageResponse> => {
    const { data } = await api.post<MessageResponse>("/users/verify-email", {
      token,
    });

    return data;
  },

  resendEmailVerification: async (email: string): Promise<MessageResponse> => {
    const { data } = await api.post<MessageResponse>(
      "/users/resend-verification",
      { email },
    );

    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post("/users/forgot-password", { email });

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
