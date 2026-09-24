"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LandingAnimations() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from("[data-hero]", {
        y: 28,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all"
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const childTargets = group.querySelectorAll<HTMLElement>("[data-reveal-item]");
        if (childTargets.length === 0) return;

        gsap.fromTo(
          childTargets,
          { y: 32, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: group,
              start: "top 85%",
              once: true
            }
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 28, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              once: true
            }
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((element) => {
        const target = Number(element.dataset.counter || "0");
        const counter = { value: 0 };
        const label = element.parentElement?.querySelector("[data-counter-label]");
        if (!label) return;

        gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true
          }
        })
          .to(counter, {
            value: target,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
              element.textContent = String(Math.round(counter.value));
            }
          })
          .fromTo(
            label,
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
            "-=0.6"
          );
      });

      ScrollTrigger.refresh();
    }, document.getElementById("landing-animations-root") || undefined);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, []);

  return null;
}