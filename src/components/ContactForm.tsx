import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  CheckCircle2,
  ArrowRight,
  Upload,
  X,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { submitContact, uploadFile, getSettings } from '../lib/api';
import CustomCalendar from './ui/CustomCalendar';
import { format } from 'date-fns';
import { HighlightText } from '../lib/highlight';

interface LandingTexts {
  contactLabel?: string;
  contactTitle?: string;
  contactDesc?: string;
  contactTitleSize?: number;
  contactColor?: string;
  contactDescSize?: number;
}

const locPool = [
  '서울 강남구', '서울 송파구', '서울 마포구', '서울 영등포', '서울 서초구', '서울 종로구', '서울 용산구',
  '경기 수원시', '경기 수정구', '경기 성남시', '경기 용인시', '경기 고양시', '경기 안양시',
  '부산 해운대', '부산 수영구', '인천 연수구', '인천 남동구', '대전 유성구', '대구 수성구',
  '제주 서귀포', '제주 제주시', '광주 서구', '울산 남구', '세종시', '충남 천안시',
];
const svcPool = [
  '기업 컨퍼런스', '신제품 쇼케이스', '연말 갈라디너', '야외 페스티벌', '브랜드 시사 프로모션',
  'VIP 의전행사', '브랜드 런칭쇼', '리조트 세미나', '신년 시무식', '주주총회 행사',
  '창립기념식', '체육대회', '시상식 행사', '공연 축제', '전시회 부스', '워크샵 세미나',
  '임원 만찬', '고객 초청 행사', '기자간담회', '사내 콘서트', '팀빌딩 행사', '수주 기념식',
  '준공식 행사', '런칭 파티', '포럼 행사',
];
const statusPool = ['상담중', '접수완료'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateReservations(count: number) {
  const locs = shuffle(locPool);
  const svcs = shuffle(svcPool);
  return Array.from({ length: count }, (_, i) => ({
    loc: locs[i % locs.length],
    svc: svcs[i % svcs.length],
    status: statusPool[Math.random() < 0.5 ? 0 : 1],
  }));
}

const reservationData = generateReservations(12);
const rollingData = [...reservationData, ...reservationData];

export default function ContactForm() {

  const router = useRouter();
  const [texts, setTexts] = useState<LandingTexts>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getSettings('landing_texts')
      .then((data: LandingTexts | null) => { if (data) setTexts(data); })
      .catch(() => {});
  }, []);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    eventName: '',
    eventDate: undefined as Date | undefined,
    location: '',
    details: '',
    attendance: '',
    budget: '',
    referral: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length <= 3) {
        formatted = cleaned;
      } else if (cleaned.length <= 7) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
      }
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (selectedFiles.length + newFiles.length > 5) {
        alert('파일은 최대 5개까지만 첨부 가능합니다.');
        return;
      }
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const attachmentUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        for (const file of selectedFiles) {
          const url = await uploadFile(file);
          attachmentUrls.push(url);
        }
        setUploadingFiles(false);
      }

      await submitContact({
        ...formData,
        eventDate: formData.eventDate ? format(formData.eventDate, 'yyyy-MM-dd') : '',
        attachments: attachmentUrls,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('문의 제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="py-24 bg-[#0a0a0a] min-h-[800px] flex items-center px-4 md:px-6">
        <div className="max-w-4xl mx-auto w-full text-center bg-zinc-900 p-8 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] border border-zinc-800 shadow-2xl">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-[#F97316]/10 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 className="w-12 h-12 text-[#F97316]" />
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-black text-zinc-100 mb-6">성공적으로 접수되었습니다!</h2>
          <p className="text-zinc-400 font-medium mb-12 text-base md:text-xl leading-relaxed">
            마이파트너스 디렉터가 24시간 이내에 <br className="hidden md:block" />
            작성하신 내용을 바탕으로 최적의 견적을 제안해 드립니다.
          </p>
          <button onClick={() => router.push('/')} className="inline-flex px-12 py-5 bg-[#F97316] text-white font-black rounded-2xl text-sm md:text-base hover:bg-[#EA580C] transition-all hover:scale-105 shadow-xl shadow-[#F97316]/20">홈으로 돌아가기</button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-[#0a0a0a] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F97316]/5 rounded-full blur-[150px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#F97316]/5 rounded-full blur-[150px] -ml-64 -mb-64" />

      {/* 좌우 컨테이너 높이 맞춤 (우측 폼이 전체 높이의 기준이 됨) */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col lg:flex-row gap-8 lg:items-stretch">

        {/* Left Side: Text and Status Box */}
        <div className="w-full lg:w-5/12 flex flex-col">

          {/* 다시 왼쪽 제자리로 돌아온 텍스트 영역 */}
          <div className="text-center lg:text-left space-y-3 mb-8">
            <div className="inline-block px-4 py-1 rounded-full bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] text-[10px] font-black tracking-[0.3em] uppercase">
              {texts.contactLabel ?? 'Contact Us'}
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-zinc-100 leading-[1.2] tracking-tight" style={{ fontSize: texts.contactTitleSize || 48 }}>
              <HighlightText text={texts.contactTitle ?? '지금 마이파트너스의\n"완벽한 행사"를 경험하세요!'} color={texts.contactColor || '#F97316'} />
            </h2>
            <div className="w-12 h-[1px] bg-gradient-to-r from-[#F97316] to-transparent mx-auto lg:mx-0" />
            <p className="text-zinc-400 font-medium text-sm md:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0 whitespace-pre-line" style={{ fontSize: texts.contactDescSize || 14 }}>
              {texts.contactDesc ?? '전문 디렉터가 24시간 이내에 작성하신 내용을 바탕으로 최적의 견적을 제안해 드립니다.'}
            </p>
          </div>

          {/* flex-1과 min-h-0을 주어, 텍스트가 차지하고 '남은 공간'만 완벽하게 채움 */}
          <div className="bg-zinc-900 rounded-[2.5rem] p-6 md:p-8 border border-zinc-800 shadow-2xl relative overflow-hidden group flex-1 flex flex-col min-h-[400px] lg:min-h-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="mb-6 relative z-10 shrink-0">
              <h4 className="font-black text-zinc-100 text-xl mb-1">마이파트너스 실시간 문의현황</h4>
              <p className="text-zinc-500 text-xs font-medium">고객님들이 신청하신 최근 문의 현황입니다.</p>
            </div>

            <div className="flex-1 flex flex-col relative z-10 min-h-0">
              <div className="grid grid-cols-3 gap-4 pb-3 border-b border-zinc-700 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest shrink-0">
                <span>지역</span>
                <span>행사/서비스</span>
                <span className="text-right">접수현황</span>
              </div>

              {/* 스크롤 뼈대 (높이 고정 종속) */}
              <div className="relative overflow-hidden mt-3 flex-1 min-h-0">
                <motion.div
                  animate={{ y: ["0%", "-50%"] }}
                  transition={{ duration: 25, ease: "linear", repeat: Infinity }}
                  className="absolute w-full flex flex-col"
                >
                  {rollingData.map((row, i) => (
                    <div key={i} className="grid grid-cols-3 gap-4 items-center py-4 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 transition-all cursor-default border border-zinc-700 mb-2 shrink-0">
                      <span className="text-zinc-400 font-bold text-[11px] truncate">{row.loc}</span>
                      <span className="text-zinc-300 font-semibold text-[11px] truncate">{row.svc}</span>
                      <div className="flex justify-end">
                        <span className={`px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-tighter ${row.status === '상담중' ? 'bg-[#F97316] text-white' : 'bg-zinc-700 text-zinc-400'}`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-zinc-900 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-900 to-transparent z-10 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form (이 폼의 자연스러운 길이가 전체 섹션의 높이를 결정합니다) */}
        <div className="w-full lg:w-7/12">
          <div className="bg-zinc-900 rounded-[3rem] p-6 md:p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden border border-zinc-800">
            {isSubmitting && (
              <div className="absolute inset-0 bg-zinc-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6">
                <Loader2 className="w-16 h-16 text-[#F97316] animate-spin" />
                <div className="text-center">
                  <p className="font-black text-2xl text-zinc-100 mb-2">Processing...</p>
                  <p className="text-zinc-400 font-medium">거의 다 되었습니다. 잠시만 기다려 주세요.</p>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black text-zinc-100 tracking-tight mb-2">온라인 견적 문의</h3>
              <p className="text-zinc-400 font-medium text-sm">정확한 제안을 위해 아래 정보를 빠짐없이 입력해 주세요.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* Section: Basic Info */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">업체(단체)명 *</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="마이파트너스" className="w-full px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] text-sm font-bold transition-all text-zinc-100 placeholder:text-zinc-600" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">담당자 성함(직함) *</label>
                    <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="홍길동 디렉터" className="w-full px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] text-sm font-bold transition-all text-zinc-100 placeholder:text-zinc-600" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">담당자 연락처 *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" maxLength={13} className="w-full px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] text-sm font-bold transition-all text-zinc-100 placeholder:text-zinc-600" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">담당자 이메일 *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="hello@mai.com" className="w-full px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] text-sm font-bold transition-all text-zinc-100 placeholder:text-zinc-600" required />
                  </div>
                </div>
              </div>

              {/* Section: Event Info */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">행사명 *</label>
                  <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} placeholder="창립 10주년 비전 선포식" className="w-full px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] text-sm font-bold transition-all text-zinc-100 placeholder:text-zinc-600" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">행사 일시 *</label>
                    <CustomCalendar
                      selected={formData.eventDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, eventDate: date }))}
                      placeholder="날짜 선택"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">행사 장소 *</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="서울 또는 경기권 호텔" className="w-full px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] text-sm font-bold transition-all text-zinc-100 placeholder:text-zinc-600" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">참석 인원 *</label>
                    <div className="relative">
                      <select name="attendance" value={formData.attendance} onChange={handleChange} className="w-full px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] text-sm font-bold transition-all text-zinc-100 appearance-none cursor-pointer" required>
                        <option value="" className="bg-zinc-800">선택</option>
                        <option value="100명 미만" className="bg-zinc-800">100명 미만</option>
                        <option value="100~300명" className="bg-zinc-800">100~300명</option>
                        <option value="300~500명" className="bg-zinc-800">300~500명</option>
                        <option value="500명 이상" className="bg-zinc-800">500명 이상</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">예상 예산 *</label>
                    <div className="relative">
                      <select name="budget" value={formData.budget} onChange={handleChange} className="w-full px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] text-sm font-bold transition-all text-zinc-100 appearance-none cursor-pointer" required>
                        <option value="" className="bg-zinc-800">선택</option>
                        <option value="미정" className="bg-zinc-800">협의 후 결정</option>
                        <option value="1000~3000만원" className="bg-zinc-800">1000~3000만원</option>
                        <option value="3000~5000만원" className="bg-zinc-800">3000~5000만원</option>
                        <option value="5000만원~1억원" className="bg-zinc-800">5000만원~1억원</option>
                        <option value="1억원 이상" className="bg-zinc-800">1억원 이상</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">행사 세부 내용 *</label>
                  <textarea rows={2} name="details" value={formData.details} onChange={handleChange} placeholder="행사 기획 시 가장 중요하게 생각하시는 부분을 알려주세요." className="w-full px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] text-sm font-bold resize-none transition-all text-zinc-100 leading-relaxed placeholder:text-zinc-600" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">마이파트너스에 대해 어떻게 알게 되셨나요? *</label>
                  <div className="relative">
                    <select name="referral" value={formData.referral} onChange={handleChange} className="w-full px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] text-sm font-bold transition-all text-zinc-100 appearance-none cursor-pointer" required>
                      <option value="" className="bg-zinc-800">선택</option>
                      <option value="포털 사이트 검색" className="bg-zinc-800">포털 사이트 검색</option>
                      <option value="SNS (인스타그램 등)" className="bg-zinc-800">SNS (인스타그램 등)</option>
                      <option value="지인 추천" className="bg-zinc-800">지인 추천</option>
                      <option value="기존 고객" className="bg-zinc-800">기존 고객</option>
                      <option value="기타" className="bg-zinc-800">기타</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Section: Files */}
              <div className="space-y-2 pt-1">
                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <div onClick={() => fileInputRef.current?.click()} className="w-full p-5 bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-700 hover:border-[#F97316] transition-all group">
                  <Upload className="w-5 h-5 text-[#F97316] mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[13px] font-black text-zinc-100">행사 관련 자료 첨부</span>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-zinc-800 rounded-xl border border-zinc-700">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-3 h-3 text-[#F97316]" />
                          <span className="text-[11px] font-bold text-zinc-100 truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => removeFile(idx)} className="text-zinc-600 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start space-x-2.5 cursor-pointer group">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 cursor-pointer appearance-none rounded-md border-2 border-zinc-600 bg-zinc-800 checked:bg-[#F97316] checked:border-[#F97316] transition-all" required />
                  <span className="text-[11px] font-bold text-zinc-500 leading-tight">개인정보 수집 및 이용에 동의합니다. (필수)</span>
                </label>

                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-zinc-100 text-zinc-900 font-black rounded-2xl hover:bg-[#F97316] hover:text-white transition-all flex items-center justify-center space-x-3 shadow-xl shadow-black/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
                  <span className="text-[15px]">제출하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}
