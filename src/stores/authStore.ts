import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/user";

interface TokenData {
	tokenType: string;
	accessToken: string;
	accessTokenExpiresAt: number;
	refreshToken: string;
	refreshTokenExpiresAt: number;
}

interface AuthState {
	user: User | null;
	tokens: TokenData | null;
	isAuthenticated: boolean;
	setUser: (user: User | null) => void;
	setTokens: (tokens: TokenData | null) => void;
	setAuth: (user: User, tokens: TokenData) => void;
	clearUser: () => void;
	updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			tokens: null,
			isAuthenticated: false,
			setUser: (user) => set({ user, isAuthenticated: !!user }),
			setTokens: (tokens) => set({ tokens }),
			setAuth: (user, tokens) =>
				set({ user, tokens, isAuthenticated: true }),
			clearUser: () =>
				set({ user: null, tokens: null, isAuthenticated: false }),
			updateUser: (updates) =>
				set((state) => ({
					user: state.user ? { ...state.user, ...updates } : null,
				})),
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
