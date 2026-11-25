'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis, useLenis } from 'lenis/react';
import type { LenisRef } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  children: ReactNode;
}

function LenisScrollTriggerBridge() {
  const pathname = usePathname();
  const lenis = useLenis(() => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      if (cancelled) return;
      lenis?.resize();
      ScrollTrigger.refresh();
    };

    const rafId = requestAnimationFrame(refresh);
    const timer = setTimeout(refresh, 180);

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [pathname, lenis]);

  return null;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      autoRaf={false}
      root
      options={{
        lerp: 0.12,
        smoothWheel: true,
        respectReducedMotion: true,
        stopInertiaOnNavigate: true,
        anchors: { offset: -88 },
      }}
    >
      <LenisScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}
