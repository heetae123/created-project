<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-19 | Updated: 2026-03-19 -->

# src/components/Admin/

## Purpose
어드민 CMS 전용 컴포넌트 모음. Firebase Auth로 보호되는 관리자 대시보드. 사이트의 모든 콘텐츠(히어로, 서비스, 포트폴리오, 팀, 게시판, SEO 등)를 Firestore를 통해 편집·관리할 수 있는 패널들로 구성됨.

## Key Files

| File | Description |
|------|-------------|
| `AdminLayout.tsx` | 어드민 공통 레이아웃. 사이드바 네비게이션, Firebase Auth 상태 감지, 로그아웃 처리 |
| `AdminDashboard.tsx` | 대시보드 허브. 각 어드민 패널로의 진입점 카드 목록 |
| `AdminLogin.tsx` | Firebase Auth 이메일/패스워드 로그인 폼 |
| `ProtectedRoute.tsx` | Firebase Auth 상태 체크 라우트 가드. 미인증 시 `/admin/login`으로 리다이렉트 |
| `AdminHero.tsx` | 히어로 섹션 CMS (30KB). 배경 이미지, 타이틀, 슬로건 편집. Cloudinary 업로드 |
| `AdminPortfolio.tsx` | 포트폴리오 항목 관리 (26KB). CRUD, 이미지 업로드, 순서 정렬 |
| `AdminBoard.tsx` | 뉴스/게시판 관리 (34.3KB). 게시글 CRUD, 리치 텍스트 에디터(React Quill) 포함 |
| `AdminServiceImages.tsx` | 서비스 미디어 관리 (18KB). 서비스별 이미지 업로드 및 교체 |
| `AdminServiceTexts.tsx` | 서비스 텍스트 콘텐츠 관리 (13.6KB). 서비스명, 설명, 상세 텍스트 편집 |
| `AdminTeam.tsx` | 팀원 관리 (17.5KB). 팀원 추가/수정/삭제, 프로필 이미지 업로드 |
| `AdminGreeting.tsx` | 홈 인사말 섹션 관리 (28.6KB). 다국어 텍스트 및 이미지 편집 |
| `AdminLandingTexts.tsx` | 랜딩 페이지 텍스트 관리 (21.6KB). 각 섹션 카피 편집 |
| `AdminEmail.tsx` | 이메일 설정 관리. 수신 이메일 주소, 템플릿 설정 |
| `AdminSeo.tsx` | SEO 메타데이터 관리. title, description, og 태그 등 |
| `AdminKakao.tsx` | 카카오 채팅 연동 설정. 플로팅 버튼 URL, 텍스트 설정 |
| `AdminMap.tsx` | 지도/위치 설정. 주소, 지도 임베드 URL 관리 |
| `AdminInquiries.tsx` | 문의 내역 관리. ContactForm에서 접수된 문의 목록 및 처리 상태 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `shared/` | 어드민 컴포넌트 간 공통 재사용 UI (see `shared/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- 모든 어드민 컴포넌트는 `AdminLayout` 내에서 렌더링됨
- Firebase Auth 인증 상태는 `ProtectedRoute`가 검증하므로 개별 컴포넌트에서 중복 체크 불필요
- Firestore 데이터 저장: `saveSettings(key, value)` 패턴 공통 사용
- 이미지 업로드: `shared/DropZone` → Cloud Functions `/api/upload` → Cloudinary
- 리치 텍스트 편집: `AdminBoard`는 React Quill New 사용 (`@/lib/quill-config` 설정 참조)

### Testing Requirements
- 어드민 패널 테스트 시 Firebase Auth 로그인 필요 (브라우저에서 `/admin/login`)
- Firestore 저장 확인: Firebase 콘솔 → Firestore → settings 컬렉션
- 이미지 업로드 확인: Cloudinary 대시보드 또는 반환된 URL 확인

### Common Patterns
```tsx
// 설정 저장 패턴
const handleSave = async () => {
  await saveSettings('hero', { title, subtitle, imageUrl });
  showToast('저장되었습니다', 'success');
};

// DropZone 이미지 업로드 패턴
<DropZone onUpload={(url) => setImageUrl(url)} accept="image/*" />

// 삭제 확인 패턴
<ConfirmModal
  isOpen={showConfirm}
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
  message="정말 삭제하시겠습니까?"
/>
```

## Dependencies

### Internal
- `@/lib/api` — `getSettings`, `saveSettings` (Firestore CRUD)
- `@/lib/admin-api` — 어드민 전용 API 함수
- `@/lib/firebase` — Firebase Auth 인스턴스
- `shared/Toast` — 성공/오류 알림
- `shared/ConfirmModal` — 삭제 확인 다이얼로그
- `shared/DropZone` — 파일 업로드 UI
- `shared/ImagePreview` — 업로드된 이미지 미리보기

### External
- firebase/auth (인증)
- firebase/firestore (데이터)
- react-quill-new (리치 텍스트 에디터, AdminBoard)
- lucide-react (아이콘)

<!-- MANUAL: -->
