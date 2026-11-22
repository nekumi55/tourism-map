import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MOCK_PLACES } from '@/data/places';
import PlaceDetailClient from '@/components/place/PlaceDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

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
    title: `${place.name} | Du Lịch Tỉnh`,
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
