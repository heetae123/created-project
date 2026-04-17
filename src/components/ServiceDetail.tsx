import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getSettings, getPortfolioList } from '../lib/api';

const SLUG_TO_SUBCATEGORY: Record<string, string> = {
  ceremony: '기념행사',
  promotion: '프로모션',
  sports: 'Sports',
  vip: 'VIP 행사',
  international: '국제행사',
  conference: '컨퍼런스',
  contest: '컨테스트',
  festival: '공연 축제',
  design: '디자인',
  system: '시스템 협업',
  hr: '인재협업',
};

const serviceData: Record<string, any> = {
  ceremony: { title: "기념행사", description: "송년회, 창립행사, 신년회, 준공식, 협약식, 워크숍, 시상식 등 기업 기념 행사 기획", fallbackImg: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80" },
  promotion: { title: "프로모션", description: "브랜드 가치를 극대화하는 타겟 맞춤형 프로모션 기획", fallbackImg: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80" },
  sports: { title: "Sports", description: "기업 체육대회, 단합행사, 팀빌딩, 레크레이션, e-sports 등", fallbackImg: "https://images.unsplash.com/photo-1533443190583-424f9342e475?auto=format&fit=crop&q=80" },
  vip: { title: "VIP 행사", description: "최고의 예우를 갖춘 VIP 골프행사, VIP 의전 등 프라이빗 서비스", fallbackImg: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&q=80" },
  international: { title: "국제행사", description: "인센티브 투어, 국제세미나, 포럼 등 글로벌 행사 기획", fallbackImg: "https://images.unsplash.com/photo-1540575861501-7c00117fbade?auto=format&fit=crop&q=80" },
  conference: { title: "컨퍼런스", description: "국내 컨벤션, 세미나, 포럼, 사업설명회, 정기총회 등", fallbackImg: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80" },
  contest: { title: "컨테스트", description: "기술 경연대회, 학술제, 경진대회 등", fallbackImg: "https://images.unsplash.com/photo-1517457373958-b7bdd458ad20?auto=format&fit=crop&q=80" },
  festival: { title: "공연 축제", description: "공연 기획, 콘서트, 지역축제, 관공서 기관 행사 등", fallbackImg: "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80" },
  design: { title: "디자인", description: "행사 브랜딩, 공간 디자인, 그래픽 제작 등 비주얼 솔루션", fallbackImg: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80" },
  system: { title: "시스템 협업", description: "최첨단 음향, 조명, 영상 시스템 구축 및 운영", fallbackImg: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80" },
  hr: { title: "인재협업", description: "MC·모델·퍼포머 등 행사에 적합한 전문 인력을 매칭합니다", fallbackImg: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80" },
};

interface PortfolioItem {
  id: string;
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
  const [serviceText, setServiceText] = useState<{ overview?: string; points?: string[]; pointsColor?: string; pointsTextColor?: string } | null>(null);

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
      getPortfolioList()
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
                <li key={idx} className="flex items-center space-x-4 font-bold" style={{ color: serviceText?.pointsTextColor || '#52525b' }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: serviceText?.pointsColor || '#F97316' }} />
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
