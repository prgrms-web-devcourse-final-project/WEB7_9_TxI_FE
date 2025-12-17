import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/user";

interface AuthState {
	user: User | null;
	accessToken: string | null;
	isAuthenticated: boolean;
	setUser: (user: User | null) => void;
	setAccessToken: (token: string | null) => void;
	clearUser: () => void;
	updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			isAuthenticated: false,
			setUser: (user) => set({ user, isAuthenticated: !!user }),
			setAccessToken: (token) => set({ accessToken: token }),
			clearUser: () => set({ user: null, accessToken: null, isAuthenticated: false }),
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
