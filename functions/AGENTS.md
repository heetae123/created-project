<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-19 | Updated: 2026-03-19 -->

# functions/

## Purpose
Firebase Cloud Functions 기반 백엔드 API 서버. Express.js로 구성. 사이트 설정 CRUD, Cloudinary 이미지 업로드, 문의 이메일 발송 기능을 REST API로 제공. Node 20 런타임.

## Key Files

| File | Description |
|------|-------------|
| `index.js` | 메인 API 핸들러 (~300줄). 모든 엔드포인트 정의. CORS 활성화, XSS 방어 포함 |
| `package.json` | 백엔드 의존성 (firebase-functions, firebase-admin, express, nodemailer, cloudinary, multer, sharp) |
| `.env` | 백엔드 환경 변수 (Cloudinary API Key/Secret, 이메일 계정 등) |

## API Endpoints (index.js)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/settings/:key` | 특정 설정 키 조회 |
| POST | `/api/settings/:key` | 특정 설정 저장 |
| GET | `/api/settings` | 전체 설정 조회 |
| POST | `/api/upload` | Cloudinary 이미지 업로드. multipart/form-data, `file` 필드 |
| POST | `/api/contact` | 문의 이메일 발송. Nodemailer 사용. XSS 방어 처리 |

## For AI Agents

### Working In This Directory
- 프론트엔드(Vite dev)는 `/api/*` 요청을 `localhost:3005`로 프록시 (`vite.config.ts` 설정)
- 로컬 개발 시 `npm run server`로 Express 서버 실행 (루트 package.json 스크립트)
- Firebase 배포 시 `firebase deploy --only functions` 사용
- `index.js`에 새 엔드포인트 추가 시 CORS 헤더 유지 필수
- 이메일 발송 로직: HTML 템플릿에서 사용자 입력값은 반드시 이스케이프 처리

### Testing Requirements
- 로컬 테스트: `npm run server` 실행 후 `curl` 또는 Postman으로 `localhost:3005/api/...` 호출
- 이미지 업로드 테스트: multipart form-data로 파일 전송 후 반환된 Cloudinary URL 확인
- 이메일 테스트: `.env`의 이메일 계정 설정 확인 후 `/api/contact` POST 호출

### Common Patterns
```js
// Cloudinary 업로드 패턴 (index.js 내)
const result = await cloudinary.uploader.upload(file.path, {
  folder: 'mai-entertainment',
  resource_type: 'auto'
});
return { url: result.secure_url };

// XSS 방어 패턴 (이메일 발송)
const sanitize = (str) => str.replace(/[<>&"']/g, (c) => escapeMap[c]);
```

## Dependencies

### Internal
- Firebase Admin SDK (Firestore 접근)
- `.env` 환경 변수 (Cloudinary, 이메일 자격증명)

### External
- express — HTTP 서버
- cors — CORS 헤더
- firebase-functions — Cloud Functions 래퍼
- firebase-admin — Firestore Admin SDK
- cloudinary 2.x — 이미지 CDN 업로드
- multer — multipart 파일 파싱
- sharp — 이미지 리사이징/최적화
- nodemailer 8.x — 이메일 발송

<!-- MANUAL: -->
