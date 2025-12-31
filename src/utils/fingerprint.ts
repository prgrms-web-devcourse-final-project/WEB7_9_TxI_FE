import FingerprintJS from '@fingerprintjs/fingerprintjs'

let fpPromise: Promise<any> | null = null

/**
 * 디바이스 지문(Fingerprint) visitorId를 가져옵니다.
 * FingerprintJS를 사용하여 브라우저/디바이스의 고유 ID를 생성합니다.
 *
 * @returns {Promise<string>} visitorId
 */
export async function getVisitorId(): Promise<string> {
  try {
    // FingerprintJS 인스턴스 로드 (캐싱)
    if (!fpPromise) {
      fpPromise = FingerprintJS.load()
    }

    const fp = await fpPromise
    const result = await fp.get()

    return result.visitorId
  } catch (error) {
    console.error('[Fingerprint] Error getting visitorId:', error)

    // FingerprintJS 실패 시 fallback: 간단한 브라우저 지문 생성
    return generateFallbackFingerprint()
  }
}

/**
 * FingerprintJS가 실패했을 때 사용할 fallback 지문 생성
 * 브라우저 정보를 조합하여 간단한 해시 생성
 */
function generateFallbackFingerprint(): string {
  const nav = window.navigator
  const screen = window.screen

  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
  ].join('|')

  // 간단한 해시 함수
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  return `fallback_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`
}
