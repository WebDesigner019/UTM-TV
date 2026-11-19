"use client";

import type Lenis from "lenis";

let activeLenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  activeLenis = instance;
}

type AccordionJumpHandler = (index: number) => boolean;

let accordionJumpHandler: AccordionJumpHandler | null = null;

export function setAccordionJumpHandler(handler: AccordionJumpHandler | null) {
  accordionJumpHandler = handler;
}

export function jumpToAccordion(index: number) {
  return accordionJumpHandler ? accordionJumpHandler(index) : false;
}

export function scrollToTarget(target: HTMLElement, smooth = true) {
  if (activeLenis) {
    activeLenis.scrollTo(target, { offset: 0, immediate: !smooth });
    return;
  }

  target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

export function scrollToY(
  y: number,
  options: { duration?: number; easing?: (t: number) => number; onComplete?: () => void } = {}
) {
  if (activeLenis) {
    activeLenis.scrollTo(y, {
      duration: options.duration,
      easing: options.easing,
      onComplete: options.onComplete
    });
    return;
  }

  window.scrollTo({ top: y, behavior: "smooth" });
  if (options.onComplete) {
    window.setTimeout(options.onComplete, (options.duration ?? 0.8) * 1000);
  }
}
