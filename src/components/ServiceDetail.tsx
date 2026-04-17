import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getSettings } from '../lib/api';

const SLUG_TO_SUBCATEGORY: Record<string, string> = {
  ceremony: '기념식 행사', foundation: '창립 행사', sports: '체육대회 행사',
  employee: '임직원 행사', convention: '컨벤션 행사', festival: '공연 축제 행사',
  public: '관공서 기관 행사', promotion: '프로모션 행사', vip: 'VIP 행사',
  game: '게임행사', system: '시스템 협업', hr: '인재 협업',
};

const serviceData: Record<string, any> = {
  ceremony: { title: "기념식 행사", description: "기업의 비전과 가치를 공유하는 임직원 행사", fallbackImg: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80" },
  foundation: { title: "기념행사", description: "새로운 도약을 다짐하는 의미 있는 창립 기념 행사", fallbackImg: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80" },
  sports: { title: "프로모션", description: "임직원의 단합과 활력을 불어넣는 체육대회", fallbackImg: "https://images.unsplash.com/photo-1533443190583-424f9342e475?auto=format&fit=crop&q=80" },
  employee: { title: "Sports", description: "소통과 화합을 위한 맞춤형 임직원 워크샵 및 행사", fallbackImg: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80" },
  convention: { title: "국제행사", description: "성공적인 비즈니스를 위한 전문적인 컨벤션 기획", fallbackImg: "https://images.unsplash.com/photo-1540575861501-7c00117fbade?auto=format&fit=crop&q=80" },
  festival: { title: "컨퍼런스", description: "대중의 눈과 귀를 사로잡는 화려한 공연 및 축제", fallbackImg: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80" },
  public: { title: "컨테스트", description: "신뢰와 품격을 바탕으로 한 관공서 및 공공기관 행사", fallbackImg: "https://images.unsplash.com/photo-1517457373958-b7bdd458ad20?auto=format&fit=crop&q=80" },
  promotion: { title: "공연 축제", description: "브랜드 가치를 극대화하는 타겟 맞춤형 프로모션", fallbackImg: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80" },
  vip: { title: "· 디자인", description: "최고의 예우를 갖춘 프라이빗 VIP 초청 행사", fallbackImg: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80" },
  system: { title: "시스템 협업", description: "최첨단 음향, 조명, 영상 시스템 구축 및 운영", fallbackImg: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80" },
  hr: { title: "인재 협업", description: "행사의 격을 높이는 전문 MC, 모델, 스태프 섭외", fallbackImg: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80" },
};

interface PortfolioItem {
  id: number;
  title: string;
  subcategory?: string;
  image?: string;
  thumbnail?: string;
  featured?: boolean;
}

export default function ServiceDetail({ id: propId }: { id?: string }) {
  const id = propId;
  const router = useRouter();
  const service = id ? serviceData[id] : null;
  const [relatedItems, setRelatedItems] = useState<PortfolioItem[]>([]);
  const [serviceImage, setServiceImage] = useState<string | null>(null);
  const [serviceImagePosition, setServiceImagePosition] = useState<string>('center center');
  const [serviceText, setServiceText] = useState<{ overview?: string; points?: string[] } | null>(null);

  useEffect(() => {
    if (!service) { router.push('/service'); return; }
    const sub = id ? SLUG_TO_SUBCATEGORY[id] : '';
    // 서비스 대표 이미지 가져오기
    if (id) {
      getSettings('service_images')
        .then((data: Record<string, any> | null) => {
          if (data && data[id]) {
            const v = data[id];
            if (typeof v === 'string') {
              setServiceImage(v);
            } else if (v && v.url) {
              setServiceImage(v.url);
              if (v.position) setServiceImagePosition(v.position);
            }
          }
        })
        .catch(() => {});
    }
    // 서비스 텍스트(개요/포인트) 가져오기
    if (id) {
      getSettings('service_texts')
        .then((data: Record<string, any> | null) => {
          if (data && data[id]) setServiceText(data[id]);
        })
        .catch(() => {});
    }
    // 관련 포트폴리오 가져오기
    if (sub) {
      getSettings('portfolio')
        .then((data: PortfolioItem[]) => {
          if (Array.isArray(data)) {
            const matched = data.filter(p => p.subcategory === sub);
            const featured = matched.filter(p => p.featured);
            setRelatedItems(featured);
          }
        })
        .catch(() => {});
    }
  }, [id, service, router]);

  if (!service) return null;

  const heroImage = serviceImage
    || (relatedItems.length > 0 ? (relatedItems[0].image || relatedItems[0].thumbnail) : null)
    || service.fallbackImg;

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Link href="/service" className="inline-flex items-center space-x-2 text-zinc-400 hover:text-[#F97316] font-bold mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>서비스 목록으로 돌아가기</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-zinc-900 mb-6">{service.title}</h1>
            <p className="text-zinc-500 text-xl font-medium">{service.description}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="rounded-[40px] overflow-hidden mb-24 shadow-2xl"
          >
            <img src={heroImage} alt={service.title} className="w-full aspect-[21/9] object-cover" style={{ objectPosition: serviceImagePosition }} />
          </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-zinc-900 flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-[#F97316]" />
              <span>서비스 개요</span>
            </h3>
            {serviceText?.overview && (
              <div className="text-zinc-600 text-lg font-medium leading-relaxed prose prose-zinc max-w-none" dangerouslySetInnerHTML={{ __html: serviceText.overview }} />
            )}
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-zinc-900 flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-[#F97316]" />
              <span>주요 포인트</span>
            </h3>
            <ul className="space-y-4">
              {(serviceText?.points || ["맞춤형 컨셉 기획 및 연출", "전문 인력 및 시스템 투입", "체계적인 위기 관리 및 안전 대책", "결과 보고 및 사후 피드백 제공"]).map((point, idx) => (
                <li key={idx} className="flex items-center space-x-4 text-zinc-600 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-[#F97316]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Related Portfolio */}
        {relatedItems.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center gap-4 mb-10">
              <span className="w-8 h-[2px] bg-[#F97316]" />
              <h3 className="text-2xl font-black text-zinc-900">대표 포트폴리오</h3>
              <div className="flex-1 h-px bg-zinc-100" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedItems.map((item) => (
                <Link key={item.id} href={`/portfolio/${item.id}`} className="group">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-sm">
                    <img
                      src={item.image || item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="font-bold text-zinc-900 group-hover:text-[#F97316] transition-colors">{item.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center mt-20">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-10 py-5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-full transition-all shadow-lg shadow-[#F97316]/20 text-lg"
          >
            이 서비스 문의하기
          </Link>
        </div>
      </div>
    </div>
  );
}
