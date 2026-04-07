export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-zinc-900">
      <h1 className="text-8xl font-black text-[#F97316] mb-4">404</h1>
      <p className="text-2xl font-bold mb-8">페이지를 찾을 수 없습니다</p>
      <a
        href="/"
        className="px-8 py-3 bg-[#F97316] text-white font-bold rounded-full hover:bg-[#EA580C] transition-colors"
      >
        홈으로 돌아가기
      </a>
    </div>
  );
}
