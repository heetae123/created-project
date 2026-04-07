<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-19 | Updated: 2026-03-19 -->

# src/components/ui/

## Purpose
애플리케이션 전반에서 재사용 가능한 기본 UI 컴포넌트 라이브러리. Radix UI 기반의 headless 컴포넌트와 커스텀 위젯으로 구성.

## Key Files

| File | Description |
|------|-------------|
| `CustomCalendar.tsx` | 날짜 선택 캘린더 위젯. ContactForm 등에서 날짜 입력 시 사용 |
| `popover.tsx` | Radix UI Popover 래퍼 컴포넌트. 툴팁, 드롭다운 등 오버레이 UI에 사용 |

## For AI Agents

### Working In This Directory
- 공개/어드민 양쪽에서 사용 가능한 **범용** 컴포넌트만 이 디렉토리에 위치
- 어드민 전용 UI는 `Admin/shared/`에 위치
- Radix UI 패턴 준수: 접근성(ARIA), 키보드 네비게이션 지원

### Common Patterns
```tsx
// Popover 사용 예시
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

<Popover>
  <PopoverTrigger>열기</PopoverTrigger>
  <PopoverContent>내용</PopoverContent>
</Popover>
```

### Testing Requirements
- 키보드 접근성 확인 (Tab, Enter, Escape)
- 모바일 터치 이벤트 확인

## Dependencies

### External
- @radix-ui/react-popover (popover.tsx)
- Tailwind CSS (스타일링)

<!-- MANUAL: -->
