import { useRouter } from "@tanstack/react-router"
import { useAuthStore } from "../stores/authStore"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { authApi } from "../api/auth"
import { userApi } from "../api/user"

export default function OAuthCallbackPage() {
    const router = useRouter()
    const ranRef = useRef(false)

    const setAccessToken = useAuthStore((state) => state.setAccessToken)
    const setUser = useAuthStore((state) => state.setUser)

    useEffect(() => {
        if (ranRef.current) return
        ranRef.current = true
    
        const run = async () => {
          const params = new URLSearchParams(window.location.search)
          const code = params.get('code')
          const error = params.get('error')
    
          if (error) {
            toast.error('소셜 로그인에 실패했습니다.')
            router.navigate({ to: '/' })
            return
          }
    
          if (!code) {
            toast.error('잘못된 OAuth 요청입니다.')
            router.navigate({ to: '/' })
            return
          }
    
          try {
            // 🔑 code → token 교환
            const res = await authApi.exchangeOAuthCode({
              code,
            })
    
            // ✅ store 저장
            setAccessToken(res.data.tokens.accessToken)
            try {
                const { data } = await userApi.getUserProfile()
                setUser(data)
                console.log('User data role:', data.role)
            } catch (error) {
                // getUserProfile 실패해도 토큰으로 role 확인 가능하므로 계속 진행
                console.warn('Failed to get user profile (this is OK for admin):', error)
            }
    
            toast.success('로그인되었습니다.')
    
            // 원하는 페이지로 이동
            router.navigate({ to: '/' })
          } catch (e) {
            toast.error('로그인 처리 중 오류가 발생했습니다.')
            console.log(e)
            router.navigate({ to: '/' })
          }
        }
    
        run()
      }, [router, setAccessToken, setUser])

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">카카오 로그인 처리 중...</p>
        </div>
    )
}