export interface User {
  userId: number
  fullName?: string
  email: string
  nickname: string
  birthDate?: string
  role: string
  signupDate?: string
}

export interface UserProfile {
  userId: number
  fullName: string
  email: string
  nickname: string
  birthDate: string
  role: string
  signupDate: string
}

export interface ApiResponse<T> {
  status: string
  message: string
  data: T
}

export interface UpdateUserRequest {
  fullName?: string
  nickname?: string
  birthDate?: string
}
