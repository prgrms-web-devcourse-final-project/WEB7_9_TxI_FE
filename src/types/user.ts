export interface User {
	id: string;
	name: string;
	email: string;
	nickname: string;
	birthDate: string;
	createdAt: string;
}

export interface UpdateUserRequest {
	name?: string;
	nickname?: string;
	birthDate?: string;
}

export interface DeleteUserRequest {
	password: string;
}
