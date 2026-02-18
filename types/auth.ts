export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
}

export interface ApiError {
  error: string;
}
