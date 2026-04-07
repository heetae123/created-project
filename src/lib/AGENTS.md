<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-19 | Updated: 2026-03-19 -->

# src/lib/

## Purpose
Firebase 초기화, Firestore 데이터 접근 레이어, 어드민 전용 API, 리치 텍스트 에디터 설정, 코드 하이라이팅, 유틸리티 함수 모음. 컴포넌트에서 직접 Firebase SDK를 사용하지 않고 이 레이어를 통해 접근.

## Key Files

| File | Description |
|------|-------------|
| `firebase.ts` | Firebase SDK 초기화 (~20줄). `firestore`, `storage`, `auth` 인스턴스 export |
| `api.ts` | 공개 Firestore 데이터 접근 레이어. `getSettings`, `getAllSettings`, `saveSettings`, `getBoardList`, Board CRUD 함수 포함 |
| `admin-api.ts` | 어드민 전용 API 함수. 관리자 권한이 필요한 추가 CRUD 작업 |
| `quill-config.ts` | React Quill New 에디터 설정. 툴바 옵션, 모듈, 포맷 정의 (`AdminBoard`에서 사용) |
| `highlight.tsx` | 코드 하이라이팅 컴포넌트. `BoardDetail`에서 코드 블록 렌더링에 사용 |
| `utils.ts` | 유틸리티 함수. `cn()` — clsx + tailwind-merge 결합 클래스명 헬퍼 |

## For AI Agents

### Working In This Directory
- `firebase.ts`는 SDK 초기화를 한 번만 수행. 절대 다른 파일에서 중복 초기화 금지
- `api.ts`의 `saveSettings(key, value)` — Firestore `settings` 컬렉션의 문서 key에 value를 저장
- `api.ts`의 `getSettings(key)` — 위 저장 값 조회
- 새 Firestore 쿼리 추가 시 이 파일들에 함수로 추상화하여 컴포넌트에 노출

### Common Patterns
```ts
// 설정 조회
import { getSettings, saveSettings } from '@/lib/api';
const heroData = await getSettings('hero');

// 설정 저장
await saveSettings('hero', { title: '...' imageUrl: '...' });

// 게시판 목록 조회 (페이지네이션)
const { posts, total } = await getBoardList(page, 10, searchQuery);

// 클래스명 유틸
import { cn } from '@/lib/utils';
className={cn('base', isActive && 'active', error && 'border-red-500')}
```

### Testing Requirements
- Firebase 연결: `.env`의 Firebase 설정값 확인
- Firestore 읽기/쓰기: Firebase 콘솔에서 데이터 확인
- `quill-config.ts` 변경 시 `AdminBoard`에서 에디터 동작 확인

## Dependencies

### Internal
- 없음 (lib는 의존성 트리의 최하단)

### External
- firebase/firestore — Firestore DB 쿼리
- firebase/storage — Storage 접근
- firebase/auth — Auth 인스턴스
- clsx, tailwind-merge — `cn()` 유틸 (utils.ts)
- react-quill-new — 에디터 타입 참조 (quill-config.ts)

<!-- MANUAL: -->
