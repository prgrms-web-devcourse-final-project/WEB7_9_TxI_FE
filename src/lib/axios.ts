import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

export const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
	timeout: 10000,
	withCredentials: true, // 쿠키 전송을 위해 필수
	headers: {
		"Content-Type": "application/json",
	},
});

// Request Interceptor
apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	},
);

// Response Interceptor - 토큰 갱신만 처리
apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as any;

		// 401 에러이고, 재시도하지 않은 요청인 경우 (토큰 갱신 로직)
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// RefreshToken으로 재인증 시도
				await apiClient.post("/api/v1/auth/refresh");

				// 원래 요청 재시도
				return apiClient(originalRequest);
			} catch (refreshError) {
				// RefreshToken도 만료된 경우 - 로그아웃 이벤트 발생
				window.dispatchEvent(new CustomEvent("auth:logout"));
				return Promise.reject(refreshError);
			}
		}

		// 에러를 그대로 반환 (TanStack Query에서 처리)
		return Promise.reject(error);
	},
);
