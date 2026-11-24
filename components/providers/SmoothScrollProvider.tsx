'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
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
  useLenis(() => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

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
        duration: 1.0,
        smoothWheel: true,
      }}
    >
      <LenisScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}
