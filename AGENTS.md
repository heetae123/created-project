<!-- Generated: 2026-03-19 | Updated: 2026-03-19 -->

# nexus1 (MAI Entertainment)

## Purpose
이벤트/엔터테인먼트 에이전시(MAI Entertainment)를 위한 풀스택 웹 애플리케이션. React 19 + Firebase 기반의 공개 마케팅 사이트와 어드민 CMS를 통합한 프로젝트.

## Key Files

| File | Description |
|------|-------------|
| `src/App.tsx` | 라우터 설정 및 전체 앱 구조 (9.2KB, React Router DOM v7) |
| `src/main.tsx` | 앱 엔트리 포인트 (React.StrictMode 마운트) |
| `src/index.css` | 전역 스타일 (Tailwind CSS 기반) |
| `vite.config.ts` | 빌드 설정 (포트 3000, API 프록시 → localhost:3005, `@/*` 앨리어스) |
| `tsconfig.json` | TypeScript 설정 (ES2022, react-jsx, strict mode) |
| `package.json` | 의존성 및 npm 스크립트 |
| `firebase.json` | Firebase Hosting + Functions 배포 설정 |
| `.env` | 프론트엔드 환경 변수 (Cloudinary, GEMINI_API_KEY 등) |
| `.env.example` | 환경 변수 템플릿 |
| `metadata.json` | 프로젝트 메타데이터 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | 애플리케이션 전체 소스 코드 (see `src/AGENTS.md`) |
| `functions/` | Firebase Cloud Functions 백엔드 API (see `functions/AGENTS.md`) |
| `public/` | 정적 에셋 (로고, PDF 등) |

## For AI Agents

### Working In This Directory
- 루트 설정 파일만 존재. 소스 수정 시 반드시 `src/` 이하를 대상으로 작업
- `vite.config.ts`의 `@` 경로 앨리어스: `@/*` → 프로젝트 루트 기준
- 환경 변수는 `.env.example`을 먼저 확인 후 `.env` 수정

### Testing Requirements
```bash
npm run dev       # 개발 서버 (포트 3000, HMR)
npm run build     # 프로덕션 빌드 → dist/
npm run preview   # 빌드 결과 미리보기
npm run lint      # TypeScript 타입 체크
```

### Common Patterns
- `@` 경로 앨리어스 사용: `import { ... } from '@/components/...'`
- Firebase 초기화는 `src/lib/firebase.ts`에서 한 번만 수행
- Cloudinary를 통한 CDN 이미지 관리

## Dependencies

### External
- React 19.0.0 — UI 렌더링
- Vite 6.2.0 — 빌드 도구
- TypeScript 5.8 — 타입 안전성
- React Router DOM 7.13.1 — 클라이언트 라우팅
- Tailwind CSS 4.1 — 유틸리티 CSS
- Firebase (Firestore, Storage, Auth) — 데이터베이스 및 인증
- Cloudinary 2.9.0 — 이미지 CDN
- Radix UI, Lucide, Motion — UI 컴포넌트 및 아이콘
- React Quill New 3.8.3 — 리치 텍스트 에디터
- Google GenAI 1.29.0 — AI 기능

<!-- MANUAL: -->
