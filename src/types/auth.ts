export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	message?: string;
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
