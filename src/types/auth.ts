export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  fullName: string
  nickname: string
  year: string
  month: string
  day: string
  businessNumber?: string
}

export interface AuthData {
  tokens: {
    tokenType: string
    accessToken: string
    accessTokenExpiresAt: number
    refreshToken: string
    refreshTokenExpiresAt: number
  }
  user: {
    userId: number
    email: string
    nickname: string
    role: string
  }
}
