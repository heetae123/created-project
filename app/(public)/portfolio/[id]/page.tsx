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

function getImages(item: PortfolioPublicItem, fallback: string): string[] {
  const blockImages = item.blocks
    ?.filter((block) => block.type === 'image' && block.url)
    .map((block) => block.url as string) || [];
  return [...new Set([item.image, item.thumbnail, ...blockImages, fallback].filter(Boolean) as string[])];
}

function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
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
  const structuredData = item ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${canonical}#project`,
        name: item.title,
        description: getDescription(item),
        image: getImages(item, seo.ogImage),
        url: canonical,
        mainEntityOfPage: canonical,
        inLanguage: 'ko-KR',
        ...(item.category ? { genre: item.category } : {}),
        ...(item.client ? { about: item.client } : {}),
        ...(item.createdAt ? { dateCreated: item.createdAt } : {}),
        ...(item.updatedAt ? { dateModified: item.updatedAt } : {}),
        creator: {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: '포트폴리오', item: `${SITE_URL}/portfolio` },
          { '@type': 'ListItem', position: 3, name: item.title, item: canonical },
        ],
      },
    ],
  } : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
        />
      )}
      <PortfolioClient id={item?.id || id} initialItem={item} />
    </>
  );
}
