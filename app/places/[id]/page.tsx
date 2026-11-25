import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MOCK_PLACES } from '@/data/places';
import PlaceDetailClient from '@/components/place/PlaceDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Note on data architecture:
 * generateStaticParams pre-renders routes for MOCK_PLACES at build time.
 * Dynamic places created in client-side state (localStorage) via Admin CMS
 * will not have pre-rendered static HTML routes at build time. For Phase 2,
 * migrate to a remote database (e.g. Supabase/PostgreSQL) with dynamic server rendering or ISR.
 */
export async function generateStaticParams() {
  return MOCK_PLACES.map((p) => ({
    id: p.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const place = MOCK_PLACES.find((p) => p.id === id);
  if (!place) return { title: 'Không tìm thấy địa điểm' };

  return {
    title: `${place.name} | Du Lịch Quảng Ngãi`,
    description: place.description,
  };
}

export default async function PlaceDetailPage({ params }: Props) {
  const { id } = await params;
  const place = MOCK_PLACES.find((p) => p.id === id);

  if (!place) {
    notFound();
  }

  return <PlaceDetailClient initialPlace={place} />;
}
