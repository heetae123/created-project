import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getBoardList } from '../lib/api';

interface Post {
  id: number;
  isNotice: boolean;
  category?: string;
  title: string;
  author: string;
  date: string;
  views: number;
  thumbnail?: string;
  pinned?: boolean;
}

export default function Board() {

  const router = useRouter();
  const [allBoardPosts, setAllBoardPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filter, setFilter] = useState('all');
  const limit = 8;

  useEffect(() => {
    getBoardList(1, 9999, '')
      .then(data => setAllBoardPosts(data.items || []))
      .catch(() => {});
  }, []);

  const getCategory = (post: Post) => post.category || (post.isNotice ? 'notice' : 'news');

  // Sort: pinned first, then by date (newest first), fallback to id
  const sortByDate = (a: Post, b: Post) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const dateA = a.date ? a.date.replace(/\./g, '') : '0';
    const dateB = b.date ? b.date.replace(/\./g, '') : '0';
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return (b.id || 0) - (a.id || 0);
  };

  // Search filter
  const searchFiltered = search
    ? allBoardPosts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase()))
    : allBoardPosts;

  // Category filter
  const allFiltered = (() => {
    if (filter === 'all') return [...searchFiltered].sort(sortByDate);
    return searchFiltered.filter(p => getCategory(p) === filter).sort(sortByDate);
  })();

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(allFiltered.length / limit));
  const filtered = allFiltered.slice((page - 1) * limit, page * limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleFilter = (f: string) => {
    setFilter(f);
    setPage(1);
  };

  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) startPage = Math.max(1, endPage - maxVisible + 1);
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <div className="pt-24 pb-24 bg-white overflow-hidden">
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block text-[#F97316] font-bold text-sm tracking-widest uppercase mb-4"
            >
              Notice & News
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-zinc-900"
            >
              게시판
            </motion.h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { key: 'all', label: '전체' },
              { key: 'notice', label: 'NOTICE' },
              { key: 'news', label: 'NEWS' },
              { key: 'certificate', label: 'CERTIFICATE' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => handleFilter(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === tab.key
                    ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-sm font-medium text-zinc-500">
              총 <span className="text-zinc-900 font-bold">{allFiltered.length}</span>개의 게시물이 있습니다.
            </div>
            <form onSubmit={handleSearch} className="relative w-full md:w-80">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="검색어를 입력하세요."
                className="w-full pl-12 pr-6 py-3 bg-zinc-50 border border-zinc-100 rounded-full focus:outline-none focus:border-[#F97316] transition-colors"
              />
              <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-zinc-300" />
              </button>
            </form>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t-2 border-zinc-900">
                  <th className="py-5 px-4 text-left font-bold text-zinc-900 w-20">번호</th>
                  <th className="py-5 px-4 text-left font-bold text-zinc-900 w-24">분류</th>
                  <th className="py-5 px-4 text-left font-bold text-zinc-900">제목</th>
                  <th className="py-5 px-4 text-center font-bold text-zinc-900 w-24">작성자</th>
                  <th className="py-5 px-4 text-center font-bold text-zinc-900 w-32">작성일</th>
                  <th className="py-5 px-4 text-center font-bold text-zinc-900 w-24">조회수</th>
                </tr>
              </thead>
              <tbody className="border-b border-zinc-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-400">
                      {search ? '검색 결과가 없습니다.' : '등록된 게시물이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((post, idx) => {
                    const cat = getCategory(post);
                    const badgeClass = cat === 'notice'
                      ? 'bg-[#F97316]/10 text-[#F97316]'
                      : cat === 'certificate'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-blue-50 text-blue-500';
                    const badgeLabel = cat === 'notice' ? 'NOTICE' : cat === 'certificate' ? 'CERTIFICATE' : 'NEWS';
                    return (
                      <tr
                        key={post.id}
                        onClick={() => router.push(`/board/${post.id}`)}
                        className="group hover:bg-zinc-50 transition-colors border-t border-zinc-50 cursor-pointer"
                      >
                        <td className="py-6 px-4">
                          <span className="text-zinc-400 font-medium">{(page - 1) * limit + idx + 1}</span>
                        </td>
                        <td className="py-6 px-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${badgeClass}`}>
                            {badgeLabel}
                          </span>
                        </td>
                        <td className="py-6 px-4">
                          <span className="text-zinc-800 font-bold group-hover:text-[#F97316] transition-colors line-clamp-1">
                            {post.pinned && (
                              <span className="inline-block mr-1.5 px-1.5 py-0.5 text-[9px] font-black bg-[#F97316] text-white rounded align-middle">고정</span>
                            )}
                            {post.title}
                          </span>
                        </td>
                        <td className="py-6 px-4 text-center text-zinc-500 font-medium">{post.author}</td>
                        <td className="py-6 px-4 text-center text-zinc-400 font-medium">{post.date}</td>
                        <td className="py-6 px-4 text-center text-zinc-400 font-medium">{post.views}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile List View */}
          <div className="md:hidden border-t-2 border-zinc-900">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-zinc-400 text-sm">
                {search ? '검색 결과가 없습니다.' : '등록된 게시물이 없습니다.'}
              </div>
            ) : (
              filtered.map((post, idx) => {
                const cat = getCategory(post);
                const badgeClass = cat === 'notice'
                  ? 'bg-[#F97316]/10 text-[#F97316]'
                  : cat === 'certificate'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-blue-50 text-blue-500';
                const badgeLabel = cat === 'notice' ? 'NOTICE' : cat === 'certificate' ? 'CERTIFICATE' : 'NEWS';
                return (
                  <div
                    key={post.id}
                    onClick={() => router.push(`/board/${post.id}`)}
                    className="py-6 border-b border-zinc-100 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium">{post.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 leading-snug line-clamp-2">
                      {post.pinned && (
                        <span className="inline-block mr-1.5 px-1.5 py-0.5 text-[9px] font-black bg-[#F97316] text-white rounded align-middle">고정</span>
                      )}
                      {post.title}
                    </h3>
                    <div className="flex items-center text-[12px] text-zinc-500 font-medium gap-3">
                      <span>{post.author}</span>
                      <span className="w-[1px] h-2.5 bg-zinc-200" />
                      <span>조회수 {post.views}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-16">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-100 text-zinc-400 hover:border-[#F97316] hover:text-[#F97316] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {pageNumbers.map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
                    n === page
                      ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20'
                      : 'border border-zinc-100 text-zinc-400 hover:border-[#F97316] hover:text-[#F97316]'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-100 text-zinc-400 hover:border-[#F97316] hover:text-[#F97316] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
