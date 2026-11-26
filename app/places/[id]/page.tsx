import React, { Suspense } from 'react';
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

function PlaceDetailSkeleton() {
  return (
    <div
      className="bg-[var(--bg-canvas)] min-h-screen pb-20"
      aria-busy="true"
      aria-label="Đang tải thông tin địa điểm"
    >
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="h-5 w-64 rounded bg-[var(--bg-surface-muted)] animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <div className="h-[320px] sm:h-[440px] rounded-2xl bg-[var(--bg-surface-muted)] animate-pulse border border-[var(--border-subtle)]" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-xl border border-[var(--border-subtle)] space-y-4">
              <div className="h-6 w-48 rounded bg-[var(--bg-surface-muted)] animate-pulse" />
              <div className="h-10 w-3/4 rounded bg-[var(--bg-surface-muted)] animate-pulse" />
              <div className="h-5 w-1/2 rounded bg-[var(--bg-surface-muted)] animate-pulse" />
            </div>
            <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-xl border border-[var(--border-subtle)] space-y-3">
              <div className="h-7 w-56 rounded bg-[var(--bg-surface-muted)] animate-pulse" />
              <div className="h-4 w-full rounded bg-[var(--bg-surface-muted)] animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-[var(--bg-surface-muted)] animate-pulse" />
              <div className="h-4 w-4/6 rounded bg-[var(--bg-surface-muted)] animate-pulse" />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] space-y-4">
              <div className="h-6 w-40 rounded bg-[var(--bg-surface-muted)] animate-pulse" />
              <div className="h-12 w-full rounded-lg bg-[var(--bg-surface-muted)] animate-pulse" />
              <div className="h-11 w-full rounded-lg bg-[var(--bg-surface-muted)] animate-pulse" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

async function PlaceDetailContent({ params }: Props) {
  const { id } = await params;
  const place = MOCK_PLACES.find((p) => p.id === id);

  if (!place) {
    notFound();
  }

  return <PlaceDetailClient initialPlace={place} />;
}

export default function PlaceDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<PlaceDetailSkeleton />}>
      <PlaceDetailContent params={params} />
    </Suspense>
  );
}
