'use client';

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type AnimatedContentWipe = 'none' | 'up' | 'down' | 'left' | 'right' | 'center';
export type AnimatedContentStaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random';

export interface AnimatedContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onAnimationStart'> {
  children?: ReactNode;
  container?: Element | string | null;
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  blur?: number;
  rotate?: number;
  tilt?: number;
  wipe?: AnimatedContentWipe;
  threshold?: number;
  delay?: number;
  stagger?: number;
  staggerFrom?: AnimatedContentStaggerFrom;
  trigger?: 'scroll' | 'mount';
  once?: boolean;
  scrub?: boolean | number;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
  style?: CSSProperties;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const WIPES: Record<string, string> = {
  up: 'linear-gradient(to top, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  down: 'linear-gradient(to bottom, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  left: 'linear-gradient(to left, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  right: 'linear-gradient(to right, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))',
  center:
    'radial-gradient(farthest-corner at 50% 50%, #000 calc(var(--ac-wipe) * 140% - 40%), transparent calc(var(--ac-wipe) * 140%))'
};

const AnimatedContent = ({
  children,
  container,
  distance = 24,
  direction = 'vertical',
  reverse = false,
  duration = 0.45,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  blur = 0,
  rotate = 0,
  tilt = 0,
  wipe = 'none',
  threshold = 0.1,
  delay = 0,
  stagger = 0,
  staggerFrom = 'start',
  trigger = 'scroll',
  once = true,
  scrub = false,
  disappearAfter = 0,
  disappearDuration = 0.35,
  disappearEase = 'power3.in',
  onStart,
  onComplete,
  onDisappearanceComplete,
  className = '',
  style,
  ...props
}: AnimatedContentProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onStart, onComplete, onDisappearanceComplete });

  useIsomorphicLayoutEffect(() => {
    callbacksRef.current = { onStart, onComplete, onDisappearanceComplete };
  });

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      const ctx = gsap.context(() => {
        const targets: Element[] = stagger > 0 && el.children.length ? Array.from(el.children) : [el];
        const rect = el.getBoundingClientRect();
        const inViewNow = trigger === 'mount' || rect.top <= window.innerHeight * (1 - threshold);
        if (inViewNow) {
          gsap.fromTo(
            targets,
            { opacity: 0, y: 8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.34,
              stagger: stagger > 0 ? Math.min(stagger, 0.05) : 0,
              ease: 'power2.out',
              clearProps: 'transform,opacity',
              onComplete: () => callbacksRef.current.onComplete?.(),
            }
          );
          return;
        }
        gsap.set(targets, { opacity: 0, y: 8 });
        ScrollTrigger.create({
          trigger: el,
          start: `top ${(1 - threshold) * 100}%`,
          once: true,
          onEnter: () => {
            gsap.to(targets, {
              opacity: 1,
              y: 0,
              duration: 0.36,
              stagger: stagger > 0 ? Math.min(stagger, 0.05) : 0,
              ease: 'power2.out',
              clearProps: 'transform,opacity',
              onComplete: () => callbacksRef.current.onComplete?.(),
            });
          },
        });
      }, el);
      return () => ctx.revert();
    }

    let scroller: Element | string | null = container || null;
    if (typeof scroller === 'string') scroller = document.querySelector(scroller);

    const ctx = gsap.context(() => {
      const targets: Element[] = stagger > 0 && el.children.length ? Array.from(el.children) : [el];
      const horizontal = direction === 'horizontal';
      const axis = horizontal ? 'x' : 'y';
      const sign = reverse ? -1 : 1;
      const mask = WIPES[wipe];

      const from: gsap.TweenVars = {
        [axis]: distance * sign,
        scale,
        opacity: animateOpacity ? initialOpacity : 1
      };
      const to: gsap.TweenVars = {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration: Math.max(0.2, duration),
        ease
      };

      if (blur > 0) {
        from.filter = `blur(${blur}px)`;
        to.filter = 'blur(0px)';
      }
      if (rotate) {
        from.rotation = rotate * sign;
        to.rotation = 0;
      }
      if (tilt) {
        const tiltAxis = horizontal ? 'rotationY' : 'rotationX';
        from[tiltAxis] = horizontal ? -tilt * sign : tilt * sign;
        to[tiltAxis] = 0;
        from.transformPerspective = 900;
        to.transformPerspective = 900;
      }
      if (mask) {
        gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
        from['--ac-wipe'] = 0;
        to['--ac-wipe'] = 1;
      }
      if (stagger > 0) to.stagger = { each: stagger, from: staggerFrom };

      const settle = () => {
        if (scrub) return;
        gsap.set(targets, {
          clearProps: mask ? 'filter,transform,opacity,maskImage,webkitMaskImage' : 'filter,transform,opacity'
        });
      };

      const disappear = () => {
        if (disappearAfter <= 0) return;
        const out: gsap.TweenVars = {
          [axis]: -distance * sign,
          scale: 0.8,
          opacity: animateOpacity ? initialOpacity : 0,
          delay: disappearAfter,
          duration: disappearDuration,
          ease: disappearEase,
          onComplete: () => callbacksRef.current.onDisappearanceComplete?.()
        };
        if (blur > 0) out.filter = `blur(${blur}px)`;
        if (stagger > 0) out.stagger = { each: stagger, from: staggerFrom };
        gsap.to(targets, out);
      };

      if (trigger === 'mount') {
        const tl = gsap.timeline({
          onStart: () => callbacksRef.current.onStart?.(),
          onComplete: () => {
            callbacksRef.current.onComplete?.();
            settle();
            if (once && !scrub) disappear();
          }
        });
        tl.fromTo(targets, from, to, Math.max(delay, 0));
        return;
      }

      const start = `top ${(1 - threshold) * 100}%`;

      if (scrub) {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo(targets, from, to, 0);
        ScrollTrigger.create({
          trigger: el,
          scroller,
          start,
          end: `top ${Math.max((1 - threshold) * 100 - 45, 5)}%`,
          scrub: scrub === true ? true : Math.max(Number(scrub) || 0, 0.01),
          animation: tl
        });
        return;
      }

      // Only animate from offset when entering; keep elements visible above fold or if trigger already passed
      const rect = el.getBoundingClientRect();
      const inViewNow = rect.top <= window.innerHeight * (1 - threshold);
      if (inViewNow) {
        const tl = gsap.timeline({
          onStart: () => callbacksRef.current.onStart?.(),
          onComplete: () => {
            callbacksRef.current.onComplete?.();
            settle();
          }
        });
        tl.fromTo(targets, from, to, Math.max(delay, 0));
        return;
      }

      const tl = gsap.timeline({
        paused: true,
        onStart: () => callbacksRef.current.onStart?.(),
        onComplete: () => {
          callbacksRef.current.onComplete?.();
          settle();
          if (once) disappear();
        }
      });
      tl.fromTo(targets, from, to, Math.max(delay, 0));

      ScrollTrigger.create({
        trigger: el,
        scroller,
        start,
        once,
        onEnter: () => tl.play(),
        onLeaveBack: once
          ? undefined
          : () => {
              if (mask) gsap.set(targets, { maskImage: mask, webkitMaskImage: mask });
              tl.reverse();
            }
      });
    }, el);

    return () => ctx.revert();
  }, [
    container,
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    blur,
    rotate,
    tilt,
    wipe,
    threshold,
    delay,
    stagger,
    staggerFrom,
    trigger,
    once,
    scrub,
    disappearAfter,
    disappearDuration,
    disappearEase
  ]);

  return (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  );
};

export default AnimatedContent;
