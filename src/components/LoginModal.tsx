import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authApi } from "@/api/auth";
import { userApi } from "@/api/user";
import { useAuthStore } from "@/stores/authStore";
import { loginFormSchema } from "@/utils/validation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import type { LoginRequest } from "@/types/auth";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectPath?: string;
}

export function LoginModal({
  open,
  onOpenChange,
  redirectPath,
}: LoginModalProps) {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      // 로그인 성공 후 사용자 정보 조회
      try {
        const user = await userApi.getMe();
        setUser(user);
        toast.success("로그인되었습니다.");
        onOpenChange(false);

        // 리다이렉트 경로가 있으면 해당 경로로, 없으면 현재 경로 유지
        if (redirectPath) {
          navigate({ to: redirectPath });
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        toast.error("사용자 정보를 가져오는데 실패했습니다.");
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "로그인에 실패했습니다.";
      toast.error(message);
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      loginMutation.mutate(value as LoginRequest);
    },
  });

  // 모달이 닫힐 때 폼 리셋
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
          <DialogDescription>
            WaitFair에 로그인하여 티켓을 예매하세요
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 mt-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const result = loginFormSchema.shape.email.safeParse(value);
                return result.success ? undefined : result.error.message;
              },
            }}
          >
            {(field) => (
              <Input
                type="email"
                label="이메일"
                placeholder="example@email.com"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(", ")}
                disabled={loginMutation.isPending}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                const result = loginFormSchema.shape.password.safeParse(value);
                return result.success ? undefined : result.error.message;
              },
            }}
          >
            {(field) => (
              <Input
                type="password"
                label="비밀번호"
                placeholder="비밀번호를 입력하세요"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(", ")}
                disabled={loginMutation.isPending}
              />
            )}
          </form.Field>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loginMutation.isPending}
            >
              취소
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    !canSubmit || isSubmitting || loginMutation.isPending
                  }
                >
                  {loginMutation.isPending || isSubmitting
                    ? "로그인 중..."
                    : "로그인"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline font-medium"
            onClick={() => {
              onOpenChange(false);
              window.dispatchEvent(new CustomEvent("openSignupModal"));
            }}
          >
            회원가입
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
