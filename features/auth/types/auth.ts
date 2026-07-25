export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
}

export interface ApiError {
  error: string;
}
