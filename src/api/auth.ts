import { apiClient } from "@/lib/axios";
import type {
	LoginRequest,
	LoginResponse,
	SignupRequest,
	SignupResponse,
} from "@/types/auth";

export const authApi = {
		signup: async (data: SignupRequest): Promise<SignupResponse> => {
			const response = await apiClient.post<SignupResponse>(
				"/auth/signup",
				data,
			);
			return response.data;
		},

		login: async (data: LoginRequest): Promise<LoginResponse> => {
			const response = await apiClient.post<LoginResponse>(
				"/auth/login",
				data,
			);
			return response.data;
		},

		logout: async (): Promise<void> => {
			await apiClient.post("/auth/logout");
		},
};
