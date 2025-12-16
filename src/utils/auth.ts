import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";

export function requireAuth(location: { pathname: string }) {
	const isAuthenticated = useAuthStore.getState().isAuthenticated;

	if (!isAuthenticated) {
		// confirm 창 표시
		const shouldLogin = window.confirm(
			"로그인이 필요한 페이지입니다. 로그인 하시겠습니까?",
		);

		if (shouldLogin) {
			// 로그인 모달 열기 이벤트 발생
			window.dispatchEvent(
				new CustomEvent("openLoginModal", {
					detail: { redirectPath: location.pathname },
				}),
			);
		}

		// 홈으로 리다이렉트
		throw redirect({ to: "/" });
	}
}
