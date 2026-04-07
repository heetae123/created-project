<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-19 | Updated: 2026-03-19 -->

# src/

## Purpose
애플리케이션의 모든 소스 코드. React 컴포넌트, 라우팅, 비즈니스 로직, Firebase 연동 유틸리티를 포함. 공개 마케팅 사이트와 어드민 CMS 두 영역으로 구분됨.

## Key Files

| File | Description |
|------|-------------|
| `App.tsx` | 전체 라우팅 구성. 공개 페이지 + 어드민 라우트 정의. React.lazy로 코드 스플리팅 |
| `main.tsx` | ReactDOM.createRoot 엔트리. StrictMode 래핑 |
| `index.css` | Tailwind CSS 지시어 및 전역 커스텀 스타일 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `components/` | 모든 React 컴포넌트 (공개/어드민) (see `components/AGENTS.md`) |
| `lib/` | Firebase, API, 유틸리티 함수 모음 (see `lib/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `App.tsx`는 라우트 추가 시 반드시 수정해야 하는 단일 진입점
- 어드민 라우트는 `ProtectedRoute`로 감싸야 함
- 코드 스플리팅: `React.lazy` + `<Suspense>` 패턴 유지

### Testing Requirements
- 라우트 변경 후 `npm run dev`로 네비게이션 동작 확인
- TypeScript 오류: `npm run lint`

### Common Patterns
- 경로 앨리어스 `@/` 사용 (예: `@/components/Navbar`)
- Firebase SDK는 `@/lib/firebase`에서 import
- API 함수는 `@/lib/api` 또는 `@/lib/admin-api`에서 import

## Dependencies

### Internal
- `components/` ← 모든 UI 컴포넌트
- `lib/` ← Firebase, API 유틸리티

### External
- react-router-dom v7 (라우팅)
- firebase (SDK)

<!-- MANUAL: -->
