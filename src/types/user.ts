export interface User {
  userId: number
  email: string
  fullName: string
  nickname: string
  role: string
  birthDate: string
  signupDate: string
}

export interface UpdateUserRequest {
  fullName: string
  nickname: string
  year: string
  month: string
  day: string
}
