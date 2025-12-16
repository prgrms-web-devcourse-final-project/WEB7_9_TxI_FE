import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { updateUserFormSchema } from "@/utils/validation";
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
import type { User } from "@/types/user";

interface UserInfoEditModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User;
	onSubmit: (data: { name: string; nickname: string; birthDate: string }) => void;
	isLoading?: boolean;
}

export function UserInfoEditModal({
	open,
	onOpenChange,
	user,
	onSubmit,
	isLoading = false,
}: UserInfoEditModalProps) {
	const form = useForm({
		defaultValues: {
			name: user.name,
			nickname: user.nickname,
			birthDate: user.birthDate,
		},
		onSubmit: async ({ value }) => {
			onSubmit(value);
		},
	});

	// 모달이 열릴 때마다 최신 사용자 정보로 폼 업데이트
	useEffect(() => {
		if (open) {
			form.setFieldValue("name", user.name);
			form.setFieldValue("nickname", user.nickname);
			form.setFieldValue("birthDate", user.birthDate);
		}
	}, [open, user]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogClose onClose={() => onOpenChange(false)} />
				<DialogHeader>
					<DialogTitle>내 정보 수정</DialogTitle>
					<DialogDescription>수정할 정보를 입력해주세요.</DialogDescription>
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
								const result = updateUserFormSchema.shape.name.safeParse(value);
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
								disabled={isLoading}
							/>
						)}
					</form.Field>

					<form.Field
						name="nickname"
						validators={{
							onChange: ({ value }) => {
								const result = updateUserFormSchema.shape.nickname.safeParse(value);
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
								disabled={isLoading}
							/>
						)}
					</form.Field>

					<form.Field
						name="birthDate"
						validators={{
							onChange: ({ value }) => {
								const result = updateUserFormSchema.shape.birthDate.safeParse(value);
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
								disabled={isLoading}
							/>
						)}
					</form.Field>

					<div className="flex gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							className="flex-1"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
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
									disabled={!canSubmit || isSubmitting || isLoading}
								>
									{isLoading || isSubmitting ? "수정 중..." : "수정"}
								</Button>
							)}
						</form.Subscribe>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
