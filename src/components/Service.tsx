import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { getSettings } from '../lib/api';

const categories = [
  {
    title: "기업행사",
    description: "기업의 비전과 가치를 공유하는 임직원 행사",
    icon: "corporate",
    gradient: "from-amber-50 to-orange-50",
    borderColor: "border-amber-100",
    services: [
      { name: "기념행사", slug: "ceremony", icon: "ceremony", desc: "송년회, 창립행사, 신년회, 준공식, 협약식, 워크숍, 시상식 등" },
      { name: "프로모션", slug: "promotion", icon: "promotion", desc: "브랜드 인지도를 높이는 창의적인 프로모션" },
      { name: "Sports", slug: "sports", icon: "sports", desc: "기업 체육대회, 단합행사, 팀빌딩, 레크레이션, e-sports 등" },
      { name: "VIP 행사", slug: "vip", icon: "vip", desc: "VIP 골프행사, VIP 의전 등" }
    ]
  },
  {
    title: "공공 / 문화행사",
    description: "대중과 소통하고 문화를 전하는 임팩트 있는 무대",
    icon: "public",
    gradient: "from-orange-50 to-red-50",
    borderColor: "border-orange-100",
    services: [
      { name: "국제행사", slug: "international", icon: "international", desc: "인센티브 투어, 국제세미나, 포럼" },
      { name: "컨퍼런스", slug: "conference", icon: "conference", desc: "국내 컨벤션, 세미나, 포럼, 사업설명회, 정기총회 등" },
      { name: "컨테스트", slug: "contest", icon: "contest", desc: "기술 경연대회, 학술제, 경진대회 등" },
      { name: "공연 축제", slug: "festival", icon: "festival", desc: "공연 기획, 콘서트, 지역축제, 관공서 기관 행사 등" }
    ]
  },
  {
    title: "특화 · 지원",
    description: "성공적인 행사를 위한 완벽한 인프라와 맞춤 지원",
    icon: "special",
    gradient: "from-zinc-50 to-stone-50",
    borderColor: "border-zinc-100",
    services: [
      { name: "디자인", slug: "design", icon: "design", desc: "행사 브랜딩, 공간 디자인, 그래픽 제작 등 비주얼 솔루션" },
      { name: "시스템 협업", slug: "system", icon: "system", desc: "음향·조명·영상 등 최첨단 기술 인프라를 지원합니다" },
      { name: "인재협업", slug: "hr", icon: "hr", desc: "MC·모델·퍼포머 등 행사에 적합한 전문 인력을 매칭합니다" }
    ]
  }
];

interface ServiceStyles {
  catTitleSize: number;
  catTitleColor: string;
  svcNameSize: number;
  svcNameColor: string;
  svcDescColor: string;
}

const DEFAULT_SERVICE_STYLES: ServiceStyles = {
  catTitleSize: 28,
  catTitleColor: '#18181B',
  svcNameSize: 18,
  svcNameColor: '#18181B',
  svcDescColor: '#A1A1AA',
};

export default function Service() {

  const [serviceImages, setServiceImages] = useState<Record<string, any>>({});
  const [svcStyles, setSvcStyles] = useState<ServiceStyles>(DEFAULT_SERVICE_STYLES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSettings('service_images').then((data: Record<string, any> | null) => {
        if (data) setServiceImages(data);
      }),
      getSettings('service_styles').then((data: ServiceStyles | null) => {
        if (data && typeof data === 'object') setSvcStyles({ ...DEFAULT_SERVICE_STYLES, ...data });
      }),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getImageUrl = (slug: string, fallback?: string) => {
    const img = serviceImages[slug];
    if (img) return typeof img === 'string' ? img : img.url || fallback;
    return fallback;
  };

  const getImagePosition = (slug: string) => {
    const img = serviceImages[slug];
    if (img && typeof img !== 'string' && img.position) return img.position;
    return 'center center';
  };

  return (
    <div className="pt-24 pb-24 overflow-hidden bg-white">
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-20 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-[#F97316] font-bold text-sm tracking-widest uppercase mb-4"
            >
              Our Service
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-zinc-900 leading-tight mb-6"
            >
              전문적인 기획으로 <br />
              완벽한 순간을 만듭니다
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-500 text-lg font-medium max-w-2xl mx-auto"
            >
              기업 행사부터 공공 프로모션, VIP 의전까지 — 마이파트너스가 완벽하게 기획합니다
            </motion.p>
          </div>

          {loading ? (
            <div className="space-y-16 animate-pulse">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="h-7 w-28 bg-zinc-200 rounded mb-2" />
                  <div className="h-4 w-52 bg-zinc-200 rounded mb-8" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map((j) => (
                      <div key={j} className="bg-zinc-200 rounded-2xl min-h-[240px]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div className="space-y-16">
            {categories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="mb-8">
                  <h3
                    className="font-black"
                    style={{ fontSize: svcStyles.catTitleSize, color: svcStyles.catTitleColor }}
                  >{cat.title}</h3>
                  <p className="text-zinc-500 font-medium text-sm mt-1">{cat.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cat.services.map((svc: any, i) => {
                    const imgUrl = getImageUrl(svc.slug, svc.imageUrl);
                    const imgPos = getImagePosition(svc.slug);
                    const hasImage = !!imgUrl;
                    return (
                    <Link
                      key={i}
                      href={`/service/${svc.slug}`}
                      className="group relative bg-white border border-zinc-100 rounded-2xl p-6 hover:border-[#F97316]/30 hover:shadow-2xl hover:shadow-[#F97316]/10 transition-all duration-500 flex flex-col min-h-[240px] overflow-hidden"
                    >
                      {/* Full Background Image with Blur/Gradient Overlay */}
                      {hasImage && (
                        <>
                          <div className="absolute inset-0 z-0">
                            <img
                              src={imgUrl}
                              alt={svc.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              style={{ objectPosition: imgPos }}
                            />
                            {/* Dark Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                          </div>
                        </>
                      )}

                      {/* Content Layer (Always relative z-10 to be on top) */}
                      <div className={`relative z-10 flex flex-col h-full ${hasImage ? 'text-white' : ''}`}>
                        <h4
                          className={`font-bold mb-2 transition-colors duration-300 ${hasImage ? 'text-white' : 'group-hover:text-[#F97316]'}`}
                          style={hasImage ? { fontSize: svcStyles.svcNameSize } : { fontSize: svcStyles.svcNameSize, color: svcStyles.svcNameColor }}
                        >
                          {svc.name}
                        </h4>

                        <p
                          className="font-medium leading-relaxed flex-grow"
                          style={hasImage ? { fontSize: 12 } : { fontSize: 12, color: svcStyles.svcDescColor }}
                        >
                          {svc.desc}
                        </p>

                        <div className="flex items-center justify-end mt-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${hasImage ? 'bg-white/10 group-hover:bg-[#F97316]' : 'bg-zinc-50 group-hover:bg-[#F97316]'}`}>
                            <svg className={`w-4 h-4 transition-colors duration-300 ${hasImage ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>
    </div>
  );
}
