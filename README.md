# WaitFair

> 사전 등록과 랜덤 대기열 시스템으로 모든 사용자에게 공평한 티켓 구매 기회를 제공하는 예매 플랫폼


## 💡서비스 소개

**WaitFair**는 기존 선착순 티켓팅 구조에서 발생하는 **불공정성, 서버 트래픽 폭주, 암표 거래 문제**를 해결하기 위해 설계된 **사전 등록 + 랜덤 대기열 기반의 공정한 예매 플랫폼**입니다.

기존 티켓팅은 접속 속도, 네트워크 상태, 디바이스 성능, 자동화 도구 여부 등 환경적 요소에 의해 예매 성공 여부가 결정되었습니다. 

이러한 요소들은 사용자가 통제할 수 없으며, 진심으로 예매를 원하는 사용자에게 공평한 기회를 제공하지 못했습니다.

WaitFair는 이러한 환경적 편차를 제거하고, **누구나 동일한 조건에서 참여할 수 있는 예매 경험**을 제공하는 것을 목표로 합니다.

---

## 👨‍💻 개발 기간 & 팀원 소개

### **개발 기간**

> 2025.12.03 ~ 2026.01.07
> 

### **팀원**

| <a href="https://github.com/jiji-hoon96"><img src="https://github.com/jiji-hoon96.png" width="100"/></a> | <a href="https://github.com/LeeMinwoo115"><img src="https://github.com/LeeMinwoo115.png" width="100"/></a> | <a href="https://github.com/gksdud1109"><img src="https://github.com/gksdud1109.png" width="100"/></a> | <a href="https://github.com/kimeunkyoungg"><img src="https://github.com/kimeunkyoungg.png" width="100"/></a> | <a href="https://github.com/No-366"><img src="https://github.com/No-366.png" width="100"/></a> | <a href="https://github.com/thatgirls00"><img src="https://github.com/thatgirls00.png" width="100"/></a> |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **이지훈** | **이민우** | **정한영** | **김은경** | **나웅철** | **전현수** |
| FE | PO / BE | BE 팀장 | BE | BE | BE |



---

## ✨ WaitFair의 차별점

### BEFORE (기존 선착순 방식의 문제점)

- 네트워크 속도, 디바이스 성능 등 사용자가 통제할 수 없는 요인이 예매 성공 여부를 결정
- 클릭 전쟁으로 인한 서버 과부하 : 오픈 시간 트래픽 폭주로 서버 다운 및 지연 빈번
- 봇/매크로의 남용 : 자동화 도구가 상위 순번을 독점하며 일반 사용자 피해 증가
- 암표(리셀) 문제

### AFTER (WaitFair의 해결책)

- 사전 등록 + 대기열 랜덤 셔플로 공정한 티켓팅 환경 제공
- 배치 단위 입장으로 트래픽 분산
- reCAPTCHA & IP Rate Limiting & IDC IP 차단 & Device Fingerprinting 기반 봇/매크로 차단
- Dynamic QR, 디바이스 중복 차단, Merkle Tree 기반 양도 시스템으로 암표 문제 해결

---

## ✅ 주요 기능

1. JWT 기반 인증 / 인가 및 소셜 로그인
2. CoolSMS를 비롯한 봇/매크로 차단 사전 등록
3. Fisher-Yates Shuffle 기반 공정한 대기열 배정 & WebSocket 기반 실시간 순서 확인
4. WebSocket 기반 실시간 좌석 선택
5. Toss Payments 기반 결제
6. Dynamic QR 티켓
7. WebSocket 기반 실시간 알림
8. Merkle Tree 기반 양도 시스템
9. 관리자 대시보드
10. Grafana Alloy 기반 서버 관측 파이프라인
