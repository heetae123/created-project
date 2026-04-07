<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-19 | Updated: 2026-03-19 -->

# src/components/

## Purpose
애플리케이션의 모든 React 컴포넌트. 공개 마케팅 페이지 컴포넌트, 레이아웃/섹션 컴포넌트, 어드민 CMS 컴포넌트, 공통 UI 라이브러리로 구성됨.

## Key Files — 공개 페이지

| File | Description |
|------|-------------|
| `Home.tsx` | 홈 랜딩 페이지 컨테이너. Hero, Greeting, HomeFeatures, MainGallery, NewsNotice 등을 조합 |
| `Hero.tsx` | 히어로 배너 섹션 (8.9KB). Firebase에서 이미지/텍스트 동적 로딩 |
| `About.tsx` | 회사 소개 페이지 (14.9KB). 연혁, 비전, 미션 등 표시 |
| `Service.tsx` | 서비스 목록 페이지 (11.5KB). 서비스 카드 목록 |
| `ServiceDetail.tsx` | 개별 서비스 상세 뷰 (9.9KB). 동적 라우트 파라미터 사용 |
| `Portfolio.tsx` | 포트폴리오 갤러리 (11.6KB). 필터링 및 그리드 레이아웃 |
| `PortfolioDetail.tsx` | 포트폴리오 상세 뷰 (6.8KB) |
| `Board.tsx` | 뉴스/게시판 목록 (11.9KB). 페이지네이션, 검색 기능 포함 |
| `BoardDetail.tsx` | 게시글 상세 보기 (12.8KB). 리치 텍스트 렌더링 |
| `BoardWrite.tsx` | 게시글 작성 폼 (6.1KB) |
| `Team.tsx` | 팀원 쇼케이스 (7.7KB). 카드 그리드 레이아웃 |
| `TeamInterview.tsx` | 팀원 인터뷰 뷰 (4.9KB) |
| `ContactPage.tsx` | 문의 페이지 래퍼 |
| `ContactForm.tsx` | 문의 폼 (24.4KB). 이메일 전송, AI 처리 연동 |

## Key Files — 레이아웃 & 섹션

| File | Description |
|------|-------------|
| `Navbar.tsx` | 상단 네비게이션 바 (6KB). 모바일 반응형, 스크롤 감지 |
| `Footer.tsx` | 푸터 섹션 (2.7KB). 링크, 저작권 표시 |
| `Greeting.tsx` | 홈 인사말 섹션 (5.8KB). Firebase에서 텍스트 동적 로딩 |
| `HomeFeatures.tsx` | 홈 특징/강점 소개 섹션 (14.8KB) |
| `MainGallery.tsx` | 홈 이미지 갤러리 섹션 (5.2KB) |
| `NewsNotice.tsx` | 뉴스 티커/공지 섹션 (4.8KB) |
| `Logo.tsx` | 로고 컴포넌트 (SVG 또는 이미지 기반) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `Admin/` | 어드민 CMS 전용 컴포넌트 17개 + 공용 유틸 4개 (see `Admin/AGENTS.md`) |
| `ui/` | 재사용 가능한 기본 UI 컴포넌트 라이브러리 (see `ui/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- 공개 컴포넌트는 Firebase `api.ts`를 통해 데이터 패칭
- 어드민 전용 로직은 반드시 `Admin/` 하위에 위치
- 새 페이지 컴포넌트 추가 시 `App.tsx`에 라우트도 함께 등록
- Tailwind CSS 클래스 사용, 인라인 스타일 최소화

### Testing Requirements
- 각 페이지 컴포넌트: 브라우저에서 직접 라우트 접근으로 확인
- 데이터 패칭 오류: Firebase 콘솔 및 브라우저 콘솔 확인
- 반응형 레이아웃: 모바일/태블릿/데스크톱 뷰포트 확인

### Common Patterns
```tsx
// Firebase 데이터 패칭 패턴
const [data, setData] = useState(null);
useEffect(() => {
  getSettings('key').then(setData);
}, []);

// Tailwind 조건부 클래스
import { cn } from '@/lib/utils';
<div className={cn('base-class', condition && 'conditional-class')} />
```

## Dependencies

### Internal
- `@/lib/api` — Firestore 데이터 접근
- `@/lib/firebase` — Firebase SDK 인스턴스
- `Admin/` — 어드민 전용 컴포넌트 (공개 컴포넌트에서 import 금지)
- `ui/` — 공용 UI 컴포넌트

### External
- react-router-dom (네비게이션, 파라미터)
- lucide-react (아이콘)
- motion (애니메이션)
- react-quill-new (리치 텍스트 뷰어, BoardDetail)

<!-- MANUAL: -->
