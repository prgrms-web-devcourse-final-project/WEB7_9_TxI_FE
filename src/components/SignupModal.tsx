import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { signupFormSchema } from "@/utils/validation";
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
import type { SignupRequest } from "@/types/auth";

interface SignupModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSignupSuccess?: () => void;
}

export function SignupModal({
	open,
	onOpenChange,
	onSignupSuccess,
}: SignupModalProps) {
	const signupMutation = useMutation({
		mutationFn: authApi.signup,
		onSuccess: () => {
			toast.success("회원가입이 완료되었습니다. 로그인해주세요.");
			onOpenChange(false);
			// 로그인 모달 열기
			if (onSignupSuccess) {
				onSignupSuccess();
			} else {
				window.dispatchEvent(new CustomEvent("openLoginModal"));
			}
		},
		onError: (error: any) => {
			const message =
				error.response?.data?.message || "회원가입에 실패했습니다.";
			toast.error(message);
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			nickname: "",
			birthDate: "",
			password: "",
			passwordConfirm: "",
		},
		onSubmit: async ({ value }) => {
			signupMutation.mutate(value as SignupRequest);
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
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogClose onClose={() => onOpenChange(false)} />
				<DialogHeader>
					<DialogTitle>회원가입</DialogTitle>
					<DialogDescription>
						WaitFair에 가입하여 티켓을 예매하세요
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
						name="name"
						validators={{
							onChange: ({ value }) => {
								const result = signupFormSchema.shape.name.safeParse(value);
								return result.success ? undefined : result.error.message;
							},
						}}
					>
						{(field) => (
							<Input
								label="이름"
								placeholder="홍길동"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								error={field.state.meta.errors.join(", ")}
								disabled={signupMutation.isPending}
							/>
						)}
					</form.Field>

					<form.Field
						name="email"
						validators={{
							onChange: ({ value }) => {
								const result = signupFormSchema.shape.email.safeParse(value);
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
								disabled={signupMutation.isPending}
							/>
						)}
					</form.Field>

					<form.Field
						name="nickname"
						validators={{
							onChange: ({ value }) => {
								const result = signupFormSchema.shape.nickname.safeParse(value);
								return result.success ? undefined : result.error.message;
							},
						}}
					>
						{(field) => (
							<Input
								label="닉네임"
								placeholder="3~10자"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								error={field.state.meta.errors.join(", ")}
								disabled={signupMutation.isPending}
							/>
						)}
					</form.Field>

					<form.Field
						name="birthDate"
						validators={{
							onChange: ({ value }) => {
								const result = signupFormSchema.shape.birthDate.safeParse(value);
								return result.success ? undefined : result.error.message;
							},
						}}
					>
						{(field) => (
							<Input
								type="date"
								label="생년월일"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								error={field.state.meta.errors.join(", ")}
								disabled={signupMutation.isPending}
							/>
						)}
					</form.Field>

					<form.Field
						name="password"
						validators={{
							onChange: ({ value }) => {
								const result = signupFormSchema.shape.password.safeParse(value);
								return result.success ? undefined : result.error.message;
							},
						}}
					>
						{(field) => (
							<Input
								type="password"
								label="비밀번호"
								placeholder="영어+숫자 포함, 8~30자"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								error={field.state.meta.errors.join(", ")}
								disabled={signupMutation.isPending}
							/>
						)}
					</form.Field>

					<form.Field
						name="passwordConfirm"
						validators={{
							onChangeListenTo: ["password"],
							onChange: ({ value, fieldApi }) => {
								const password = fieldApi.form.getFieldValue("password");
								if (!value) {
									return "비밀번호 확인을 입력해주세요.";
								}
								if (password !== value) {
									return "비밀번호가 일치하지 않습니다.";
								}
								return undefined;
							},
						}}
					>
						{(field) => (
							<Input
								type="password"
								label="비밀번호 확인"
								placeholder="비밀번호를 다시 입력하세요"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								error={field.state.meta.errors.join(", ")}
								disabled={signupMutation.isPending}
							/>
						)}
					</form.Field>

					<div className="flex gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							className="flex-1"
							onClick={() => onOpenChange(false)}
							disabled={signupMutation.isPending}
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
										!canSubmit || isSubmitting || signupMutation.isPending
									}
								>
									{signupMutation.isPending || isSubmitting
										? "가입 중..."
										: "회원가입"}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</form>

				<div className="mt-4 text-center text-sm text-gray-600">
					이미 계정이 있으신가요?{" "}
					<button
						type="button"
						className="text-blue-600 hover:underline font-medium"
						onClick={() => {
							onOpenChange(false);
							window.dispatchEvent(new CustomEvent("openLoginModal"));
						}}
					>
						로그인
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
