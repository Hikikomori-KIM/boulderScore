# boulderScore
## 🧷 Bouldering Party Score Manager

> 클라이버 동호회를 위한 볼데링 파티 점수 관리 웹 애플리케이션  
> React + Firebase 기반, 실시간 랭킹계산 및 관리자 기능 제공

---4

### 🌐 배포 링크 
> 🔗 **[https://climbparty.web.app](https://climbparty.web.app)**  


---

### 📌 프로젝트 소개

**Bouldering Party Score Manager**는 볼데링 파티에서 참가자의 점수 입력과 팀 랭킹 계산을 도움주는 웹 기반 시스템입니다.  
체점자는 참가자의 클리어 유물 입력을 통해 점수를 자동 계산하고, 참가자 및 관리자 페이지에서 실시간으로 점수와 랭킹을 확인할 수 있습니다.  
기존의 수기 체점 및 지배 방식에서 바뀌어, 정확하고 효율적인 파티 운영을 가능하게 해줍니다.

---

### 💻 주요 기능

| 기능 | 설명 |
|--------|------|
| ✅ 참가자 등록 | 참가자 정보 입력 및 파티, 조(team) 배정 |
| ✅ 체점 기능 | 테이프별 클리어 유물 기록, 점수 자동 계산 |
| ✅ 실시간 랭킹 | 조별 점수 및 개인 점수를 차트로 시각화 |
| ✅ 관리자 전용 기능 | 암장/테이프/점수 설정, 파티 구성, 조 평성 |
| ✅ Firebase 연동 | 사용자 인증, 실시간 데이터베이스 처리 |
| ✅ 모바일 대응 | 반응형 UI 지원 (Bootstrap 기반) |

---

### 🛠️ 사용 기술

- **Frontend:** React, Bootstrap, ECharts, React Router
- **Backend (DB):** Firebase Firestore
- **Authentication:** Firebase Auth
- **State Management:** React Context
- **Deployment:** Firebase Hosting

---

### 📂 폴더 구조

```bash
/src
├── components
│   ├── admin/        # 관리자 페이지 컨퍼담트
│   ├── check/        # 체점 페이지
│   ├── rank/         # 랭킹 페이지
│   ├── team/         # 팀 점수 페이지
│   └── common/       # 공통 UI 컨퍼담트
├── contexts          # Auth 및 글로벌 상태 관리
├── firebaseFunctions.js  # Firebase 관련 함수 통합
├── App.jsx
└── index.js
```

---

### 👤 본인의 역할

- 전체 구조 구설 및 Firebase 연동 구조 개발
- 실시간 점수 계산 로직 구현 및 ECharts 차트 구성
- 참가자 등록, 팀 구성, 관리자 설정 UI/기능 개발
- Firebase Auth 기반의 역할 분리(사용자 / 관리자)
- 배포: Firebase Hosting


---


### 📌 기타

- 점수 로집: 색상별 점수(검정 200점 경, 초록 50점) 자동 합산
- 조가별 성비 관리, 수동 포털, 회원 관리자 지원을 고려한 구조 서비스화 경험
