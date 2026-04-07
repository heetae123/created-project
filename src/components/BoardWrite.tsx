import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { createBoardPost } from '../lib/api';

export default function BoardWrite() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', author: '', password: '', content: '', category: 'news' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.content.trim()) {
      setError('제목, 작성자, 내용을 모두 입력해주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await createBoardPost(form);
      router.push(`/board/${result.id}`);
    } catch {
      setError('등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-zinc-950 min-h-screen">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/board')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">목록으로 돌아가기</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 md:p-12"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-8">글쓰기</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">작성자 *</label>
                <input
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="이름을 입력하세요"
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">비밀번호</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="삭제 시 필요합니다"
                  className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">카테고리</label>
              <div className="flex gap-3">
                {[
                  { value: 'news', label: 'NEWS' },
                  { value: 'certificate', label: 'CERTIFICATE' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, category: opt.value }))}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      form.category === opt.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 border border-white/10 hover:border-orange-500/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">제목 *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2">내용 *</label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={12}
                placeholder="내용을 입력하세요"
                className="w-full px-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors resize-y"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/board')}
                className="px-8 py-3 bg-zinc-800 text-zinc-300 rounded-full font-bold hover:bg-zinc-700 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {submitting ? '등록 중...' : '등록'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
