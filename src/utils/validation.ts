import { z } from "zod";

// 이메일 스키마
export const emailSchema = z
	.string()
	.min(1, "이메일을 입력해주세요.")
	.email("올바른 이메일 형식을 입력해주세요.");

// 비밀번호 스키마 (영어+숫자 포함, 8~30자)
export const passwordSchema = z
	.string()
	.min(8, "비밀번호는 8~30자 사이여야 합니다.")
	.max(30, "비밀번호는 8~30자 사이여야 합니다.")
	.regex(/(?=.*[A-Za-z])(?=.*\d)/, "비밀번호는 영어와 숫자를 모두 포함해야 합니다.");

// 닉네임 스키마 (3~10자)
export const nicknameSchema = z
	.string()
	.min(3, "닉네임은 3~10자 사이여야 합니다.")
	.max(10, "닉네임은 3~10자 사이여야 합니다.");

// 이름 스키마
export const nameSchema = z
	.string()
	.min(2, "이름은 최소 2자 이상이어야 합니다.");

// 생년월일 스키마
export const birthDateSchema = z
	.string()
	.min(1, "생년월일을 입력해주세요.")
	.regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요.");

// 로그인 폼 스키마
export const loginFormSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "비밀번호를 입력해주세요."),
});

// 회원가입 폼 스키마
export const signupFormSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	nickname: nicknameSchema,
	birthDate: birthDateSchema,
	password: passwordSchema,
	passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요."),
}).refine((data) => data.password === data.passwordConfirm, {
	message: "비밀번호가 일치하지 않습니다.",
	path: ["passwordConfirm"],
});

// 내 정보 수정 폼 스키마
export const updateUserFormSchema = z.object({
	name: nameSchema,
	nickname: nicknameSchema,
	birthDate: birthDateSchema,
});

// 비밀번호 확인 폼 스키마
export const passwordConfirmFormSchema = z.object({
	password: z.string().min(1, "비밀번호를 입력해주세요."),
});
