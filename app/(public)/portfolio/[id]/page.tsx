import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Metadata, ResolvingMetadata } from 'next';
import PortfolioClient from './PortfolioClient';
import { getSeoSettings } from '@/src/lib/api-server';

const SITE_NAME = "MAI PARTNERS";
const SITE_URL = "https://maiptns.com";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  try {
    const querySnapshot = await getDocs(collection(db, "portfolio"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const [docSnap, seo] = await Promise.all([
    getDoc(doc(db, "portfolio", id)),
    getSeoSettings(),
  ]);

  if (!docSnap.exists()) return { title: { absolute: `포트폴리오 | ${SITE_NAME}` }, alternates: { canonical: `${SITE_URL}/portfolio` } };

  const item = docSnap.data();
  const title = `${item.title} - 포트폴리오 | ${SITE_NAME}`;
  const description = item.client
    ? `${item.title} - ${item.client} | 마이파트너스 이벤트 포트폴리오`
    : `${item.title} | 마이파트너스 이벤트 포트폴리오`;
  const image = item.image || item.thumbnail || seo.ogImage;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/portfolio/${encodeURIComponent(id)}` },
    openGraph: {
      title,
      description,
      images: [image],
      url: `${SITE_URL}/portfolio/${encodeURIComponent(id)}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { id } = await params;

  let jsonLd: object | null = null;

  try {
    const [docSnap, seo] = await Promise.all([
      getDoc(doc(db, "portfolio", id)),
      getSeoSettings(),
    ]);
    if (docSnap.exists()) {
      const item = docSnap.data();
      const description = item.client
        ? `${item.title} - ${item.client} | 마이파트너스 이벤트 포트폴리오`
        : `${item.title} | 마이파트너스 이벤트 포트폴리오`;

      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: item.title,
        description,
        image: item.image || item.thumbnail || seo.ogImage,
        url: `${SITE_URL}/portfolio/${id}`,
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
        },
      };
    }
  } catch {
    // 빌드 시 Firestore 접근 실패 시 클라이언트 렌더링으로 fallback
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PortfolioClient />
    </>
  );
}
