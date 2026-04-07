import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSettings } from '../lib/api';

interface Block {
  type: 'text' | 'image';
  content?: string;
  html?: string;
  url?: string;
  caption?: string;
}

const defaultData = {
  title: '마음을 기획하는 사람들,',
  highlight: '마이파트너스',
  suffix: '입니다.',
  blocks: [
    { type: 'text' as const, content: '안녕하세요. 마이파트너스 대표이사입니다.' },
    { type: 'text' as const, content: '마이파트너스는 다양한 기업 행사를 기획·연출하며, 행사 목적과 브랜드 가치를 가장 효과적으로 전달하는 경험을 만들어 왔습니다.' },
    { type: 'text' as const, content: '정교한 기획력과 감동을 만드는 연출력, 안정적인 운영을 바탕으로 전문가 협업과 정성을 통해 행사의 완성도를 책임집니다.' },
    { type: 'text' as const, content: '우리는 일회성으로 소비되는 이벤트가 아닌, 클라이언트가 원하는 브랜드 경험을 구현하고 참가자 모두에게 의미 있는 순간을 전달합니다.' },
    { type: 'text' as const, content: '수많은 현장에서 쌓은 실무 노하우와 전문성을 기반으로 기업 담당자가 안심하고 맡길 수 있는, 신뢰할 수 있는 행사 파트너가 되겠습니다.' },
  ],
  signoff: '마이파트너스 대표이사',
  titleSize: 48,
  titleColor: '#18181B',
  highlightColor: '#F97316',
  bodySize: 18,
  bodyColor: '#525252',
};

export default function Greeting() {

  const [data, setData] = useState(defaultData);

  useEffect(() => {
    getSettings('greeting')
      .then((saved: any) => {
        if (!saved) return;
        // migrate old paragraphs format
        if (saved.paragraphs && !saved.blocks) {
          saved.blocks = saved.paragraphs.map((p: string) => ({ type: 'text', content: p }));
        }
        setData(saved);
      })
      .catch(() => {});
  }, []);

  const blocks: Block[] = data.blocks || [];

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <Link
          href="/about"
          className="inline-flex items-center space-x-2 text-zinc-400 hover:text-[#F97316] font-bold mb-12 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>회사소개로 돌아가기</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-[#F97316] font-bold text-sm tracking-widest uppercase mb-4">
            CEO Greeting
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 leading-tight mb-6">
            대표 인사말
          </h1>
          <div className="w-16 h-1 bg-[#F97316] mx-auto" />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-50 rounded-[40px] p-10 md:p-16 border border-zinc-100"
        >
          <div className="max-w-3xl mx-auto space-y-8 font-medium leading-relaxed">
            <p
              className="font-black leading-tight"
              style={{
                fontSize: data.titleSize ? `${data.titleSize}px` : undefined,
                color: data.titleColor || '#18181B',
              }}
            >
              {data.title}<br />
              <span style={{ color: data.highlightColor || '#F97316' }}>{data.highlight}</span>{data.suffix}
            </p>

            {blocks.map((block, idx) => {
              const textContent = block.html || block.content;
              if (block.type === 'text' && textContent) {
                return (
                  <div
                    key={idx}
                    className="prose prose-zinc max-w-none ql-editor"
                    style={{ padding: 0, minHeight: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(textContent) }}
                  />
                );
              }
              if (block.type === 'image' && block.url) {
                return (
                  <figure key={idx} className="my-6">
                    <img
                      src={block.url}
                      alt={block.caption || ''}
                      className="w-full rounded-2xl shadow-md"
                    />
                    {block.caption && (
                      <figcaption className="mt-3 text-center text-sm text-zinc-400">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }
              return null;
            })}

            <div className="pt-8 border-t border-zinc-200">
              <p className="text-right">
                <span className="text-zinc-400 text-base font-bold">{data.signoff}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="flex justify-center mt-16">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-10 py-5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full transition-all shadow-lg shadow-[#F97316]/20 text-lg"
          >
            프로젝트 문의하기
          </Link>
        </div>
      </div>
    </div>
  );
}
