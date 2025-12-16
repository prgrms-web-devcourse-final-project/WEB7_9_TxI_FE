export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	status: string;
	message: string;
	data: {
		tokens: {
			tokenType: string;
			accessToken: string;
			accessTokenExpiresAt: number;
			refreshToken: string;
			refreshTokenExpiresAt: number;
		};
		user: {
			userId: number;
			email: string;
			nickname: string;
			role: string;
		};
	};
}

export interface SignupRequest {
	name: string;
	email: string;
	nickname: string;
	birthDate: string; // YYYY-MM-DD 형식
	password: string;
	passwordConfirm: string;
}

export interface SignupResponse {
	message?: string;
}
