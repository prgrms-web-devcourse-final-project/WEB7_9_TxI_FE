/**
 * reCAPTCHA v3 토큰 발급 함수
 * @param action - reCAPTCHA 액션 이름 (기본값: 'pre_register')
 * @returns reCAPTCHA 토큰
 * @throws Error - reCAPTCHA가 로드되지 않았거나 토큰 발급에 실패한 경우
 */
export const getReCaptchaToken = async (action: string = 'pre_register'): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof window.grecaptcha === 'undefined') {
      reject(new Error('reCAPTCHA가 로드되지 않았습니다. 페이지를 새로고침해주세요.'))
      return
    }

    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

    if (!siteKey) {
      reject(new Error('reCAPTCHA Site Key가 설정되지 않았습니다.'))
      return
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha
        ?.execute(siteKey, { action })
        .then(resolve)
        .catch((error) => {
          console.error('reCAPTCHA 토큰 발급 실패:', error)
          reject(new Error('보안 검증에 실패했습니다. 다시 시도해주세요.'))
        })
    })
  })
}
