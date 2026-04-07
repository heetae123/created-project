<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-19 | Updated: 2026-03-19 -->

# src/components/Admin/shared/

## Purpose
어드민 CMS 컴포넌트 간 공통으로 사용되는 재사용 UI 유틸리티. Toast 알림, 확인 다이얼로그, 파일 업로드, 이미지 미리보기 등 어드민 패널 전반에서 반복 사용되는 UI 패턴을 추상화.

## Key Files

| File | Description |
|------|-------------|
| `Toast.tsx` | 전역 알림 컴포넌트. Context API 기반. `success`, `error`, `info` 타입 지원. 자동 소멸 타이머 포함 |
| `ConfirmModal.tsx` | 삭제/초기화 등 위험 동작 전 확인 다이얼로그. `isOpen`, `onConfirm`, `onCancel`, `message` props |
| `DropZone.tsx` | 드래그&드롭 파일 업로드 UI. Cloud Functions `/api/upload` 엔드포인트로 전송 후 Cloudinary URL 반환 |
| `ImagePreview.tsx` | 업로드된 이미지 미리보기. URL 입력 또는 업로드 직후 프리뷰 표시. 삭제 버튼 포함 |

## For AI Agents

### Working In This Directory
- 이 디렉토리의 컴포넌트는 **어드민 전용**. 공개 페이지에서 import 금지
- `Toast`는 Context Provider로 감싸야 사용 가능 (`AdminLayout`에서 제공)
- `DropZone`은 업로드 완료 후 Cloudinary URL을 `onUpload(url: string)` 콜백으로 반환

### Common Patterns
```tsx
// Toast 사용 (AdminLayout이 Provider 제공)
import { useToast } from './shared/Toast';
const { showToast } = useToast();
showToast('저장되었습니다', 'success');
showToast('오류가 발생했습니다', 'error');

// ConfirmModal 사용
const [showConfirm, setShowConfirm] = useState(false);
<ConfirmModal
  isOpen={showConfirm}
  message="이 항목을 삭제하시겠습니까?"
  onConfirm={async () => { await handleDelete(); setShowConfirm(false); }}
  onCancel={() => setShowConfirm(false)}
/>

// DropZone + ImagePreview 조합
const [imageUrl, setImageUrl] = useState('');
<DropZone onUpload={setImageUrl} accept="image/*" />
{imageUrl && <ImagePreview url={imageUrl} onRemove={() => setImageUrl('')} />}
```

### Testing Requirements
- `DropZone`: 실제 파일 업로드 테스트 시 Cloud Functions 로컬 에뮬레이터 필요 (`npm run server`)
- `Toast`: 자동 소멸 타이머(보통 3초) 동작 확인
- `ConfirmModal`: ESC 키 및 배경 클릭으로 닫힘 확인

## Dependencies

### Internal
- Cloud Functions `/api/upload` 엔드포인트 (DropZone이 호출)

### External
- React Context API (Toast)
- Tailwind CSS (스타일링)
- lucide-react (아이콘: X, Upload, Check 등)

<!-- MANUAL: -->
