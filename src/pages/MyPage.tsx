import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/user";
import { useAuthStore } from "@/stores/authStore";
import { PasswordConfirmModal } from "@/components/PasswordConfirmModal";
import { UserInfoEditModal } from "@/components/UserInfoEditModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { User, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";

export default function MyPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { setUser, clearUser, updateUser } = useAuthStore();

	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [passwordAction, setPasswordAction] = useState<
		"edit" | "delete" | null
	>(null);

	// 사용자 정보 조회 (useSuspenseQuery는 항상 데이터를 반환)
	const { data: userData } = useSuspenseQuery({
		queryKey: ["user", "me"],
		queryFn: userApi.getMe,
	});

	// 사용자 정보 업데이트
	useEffect(() => {
		setUser(userData);
	}, [userData, setUser]);

	// 내 정보 수정
	const updateMutation = useMutation({
		mutationFn: userApi.updateMe,
		onSuccess: (data) => {
			updateUser(data);
			queryClient.invalidateQueries({ queryKey: ["user", "me"] });
			toast.success("정보가 수정되었습니다.");
			setIsEditModalOpen(false);
		},
		onError: (error: any) => {
			const message =
				error.response?.data?.message || "정보 수정에 실패했습니다.";
			toast.error(message);
		},
	});

	// 회원 탈퇴
	const deleteMutation = useMutation({
		mutationFn: userApi.deleteMe,
		onSuccess: () => {
			toast.success("회원 탈퇴가 완료되었습니다.");
			clearUser();
			navigate({ to: "/" });
		},
		onError: (error: any) => {
			const message =
				error.response?.data?.message || "회원 탈퇴에 실패했습니다.";
			toast.error(message);
		},
	});

	// 비밀번호 확인 후 액션 실행
	const handlePasswordConfirm = (password: string) => {
		if (passwordAction === "delete") {
			deleteMutation.mutate({ password });
			setIsPasswordModalOpen(false);
		} else if (passwordAction === "edit") {
			// 비밀번호 확인 성공, 정보 수정 모달 열기
			setIsPasswordModalOpen(false);
			setIsEditModalOpen(true);
		}
	};

	// 정보 수정 버튼 클릭
	const handleEditClick = () => {
		setPasswordAction("edit");
		setIsPasswordModalOpen(true);
	};

	// 회원 탈퇴 버튼 클릭
	const handleDeleteClick = () => {
		const confirmed = window.confirm(
			"정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
		);
		if (confirmed) {
			setPasswordAction("delete");
			setIsPasswordModalOpen(true);
		}
	};

	// userData는 Suspense에 의해 항상 존재
	const displayUser = userData;

	return (
		<div className="min-h-screen">
			<main className="container mx-auto px-4 py-12 max-w-2xl">
				<h1 className="text-3xl font-bold mb-8">마이페이지</h1>

				<Card className="p-6 mb-6">
					<div className="flex items-center gap-4 mb-6">
						<div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
							<User className="w-10 h-10 text-white" />
						</div>
						<div>
							<h2 className="text-2xl font-bold">{displayUser.name}</h2>
							<p className="text-gray-600">{displayUser.email}</p>
						</div>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<Label>이름</Label>
							<Input value={displayUser.name} disabled />
						</div>

						<div className="space-y-2">
							<Label>이메일</Label>
							<div className="flex items-center gap-2">
								<Mail className="w-4 h-4 text-gray-600" />
								<Input value={displayUser.email} disabled />
							</div>
						</div>

						<div className="space-y-2">
							<Label>닉네임</Label>
							<Input value={displayUser.nickname} disabled />
						</div>

						<div className="space-y-2">
							<Label>생년월일</Label>
							<Input value={displayUser.birthDate} disabled />
						</div>

						<div className="space-y-2">
							<Label>가입일</Label>
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-gray-600" />
								<Input
									value={dayjs(displayUser.createdAt).format("YYYY-MM-DD")}
									disabled
								/>
							</div>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<h3 className="text-xl font-bold mb-4">계정 설정</h3>
					<div className="space-y-3">
						<Button
							variant="outline"
							className="w-full justify-start"
							onClick={handleEditClick}
						>
							내 정보 수정
						</Button>
						<Button
							variant="outline"
							className="w-full justify-start text-red-600"
							onClick={handleDeleteClick}
						>
							회원 탈퇴
						</Button>
					</div>
				</Card>
			</main>

			<PasswordConfirmModal
				open={isPasswordModalOpen}
				onOpenChange={setIsPasswordModalOpen}
				onConfirm={handlePasswordConfirm}
				title={passwordAction === "delete" ? "회원 탈퇴" : "비밀번호 확인"}
				description={
					passwordAction === "delete"
						? "회원 탈퇴를 위해 비밀번호를 입력해주세요."
						: "내 정보 수정을 위해 비밀번호를 입력해주세요."
				}
				isLoading={deleteMutation.isPending}
			/>

			{displayUser && (
				<UserInfoEditModal
					open={isEditModalOpen}
					onOpenChange={setIsEditModalOpen}
					user={displayUser}
					onSubmit={(data) => updateMutation.mutate(data)}
					isLoading={updateMutation.isPending}
				/>
			)}
		</div>
	);
}
