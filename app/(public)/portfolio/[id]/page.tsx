import { Metadata } from 'next';
import PortfolioClient from './PortfolioClient';
import {
  getPortfolioItemServer,
  getPortfolioItemsServer,
  getSeoSettings,
  plainTextFromHtml,
  type PortfolioPublicItem,
} from '@/src/lib/api-server';

const SITE_NAME = "MAI PARTNERS";
const SITE_URL = "https://maiptns.com";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  try {
    const items = await getPortfolioItemsServer();
    return items.map((item) => ({ id: item.id }));
  } catch {
    return [];
  }
}

function getDescription(item: PortfolioPublicItem): string {
  const blockText = item.blocks
    ?.filter((block) => block.type === 'text' && block.content)
    .map((block) => plainTextFromHtml(block.content || ''))
    .join(' ');
  const summary = plainTextFromHtml(item.description || blockText || '');
  const fallback = item.client
    ? `${item.title} - ${item.client} | 마이파트너스 이벤트 포트폴리오`
    : `${item.title} | 마이파트너스 이벤트 포트폴리오`;
  return (summary || fallback).slice(0, 155);
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { id } = await params;
  const [item, seo] = await Promise.all([
    getPortfolioItemServer(id),
    getSeoSettings(),
  ]);

  if (!item) return { title: { absolute: `포트폴리오 | ${SITE_NAME}` }, alternates: { canonical: `${SITE_URL}/portfolio` } };

  const title = `${item.title} - 포트폴리오 | ${SITE_NAME}`;
  const description = getDescription(item);
  const image = item.image || item.thumbnail || seo.ogImage;
  const canonical = `${SITE_URL}/portfolio/${encodeURIComponent(item.id)}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      images: [image],
      url: canonical,
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
  const [item, seo] = await Promise.all([
    getPortfolioItemServer(id).catch(() => null),
    getSeoSettings(),
  ]);
  const canonical = item ? `${SITE_URL}/portfolio/${encodeURIComponent(item.id)}` : `${SITE_URL}/portfolio`;
  const jsonLd = item ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.title,
    description: getDescription(item),
    image: item.image || item.thumbnail || seo.ogImage,
    url: canonical,
    datePublished: item.createdAt,
    dateModified: item.updatedAt || item.createdAt,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PortfolioClient id={item?.id || id} initialItem={item} />
    </>
  );
}
