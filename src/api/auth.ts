import { apiClient } from "@/lib/axios";
import type {
	LoginRequest,
	LoginResponse,
	SignupRequest,
	SignupResponse,
} from "@/types/auth";

export const authApi = {
	// 회원가입
	signup: async (data: SignupRequest): Promise<SignupResponse> => {
		const response = await apiClient.post<SignupResponse>(
			"/api/v1/auth/signup",
			data,
		);
		return response.data;
	},

	// 로그인
	login: async (data: LoginRequest): Promise<LoginResponse> => {
		const response = await apiClient.post<LoginResponse>(
			"/api/v1/auth/login",
			data,
		);
		return response.data;
	},

	// 로그아웃
	logout: async (): Promise<void> => {
		await apiClient.post("/api/v1/auth/logout");
	},
};
