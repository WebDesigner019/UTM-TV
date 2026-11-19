"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Handshake, Megaphone, Mic, Video, type LucideIcon } from "lucide-react";
import { scrollToY, setAccordionJumpHandler } from "@/lib/smooth-scroll";

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Akselerasi dan deselerasi lembut di kedua ujung, dipakai saat melompat
// antar kartu supaya perpindahan tidak terasa tersentak.
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type AccordionItem = {
  id: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  icon: LucideIcon;
  images: { collapsed: string; expanded: string; blue: string; orange: string };
};

const ITEMS: AccordionItem[] = [
  {
    id: "liputan",
    title: "Pengajuan Liputan",
    text: "Ajukan permohonan liputan acara kampus Anda dan pantau statusnya sampai proses selesai.",
    cta: "Ajukan Liputan",
    href: "/ajukan",
    icon: Megaphone,
    images: {
      collapsed: "/images/accordion/card-1-collapsed.png",
      expanded: "/images/accordion/card-1-expanded.png",
      blue: "/images/accordion/card-1-expanded-blue.png",
      orange: "/images/accordion/card-1-expanded-orange.png"
    }
  },
  {
    id: "media-partner",
    title: "Pengajuan Media Partner",
    text: "Bentuk kolaborasi publikasi poster dan promosi acara bersama COMPACT sebagai media partner.",
    cta: "Ajukan Media Partner",
    href: "/ajukan/media-partner",
    icon: Handshake,
    images: {
      collapsed: "/images/accordion/card-2-collapsed.png",
      expanded: "/images/accordion/card-2-expanded.png",
      blue: "/images/accordion/card-2-expanded-blue.png",
      orange: "/images/accordion/card-2-expanded-orange.png"
    }
  },
  {
    id: "kerjasama",
    title: "Pengajuan Kerjasama",
    text: "Ajukan bentuk kerjasama lainnya bersama COMPACT dalam bentuk kolaborasi media.",
    cta: "Ajukan Kerjasama",
    href: "/ajukan/kerjasama",
    icon: Video,
    images: {
      collapsed: "/images/accordion/card-3-collapsed.png",
      expanded: "/images/accordion/card-3-expanded.png",
      blue: "/images/accordion/card-3-expanded-blue.png",
      orange: "/images/accordion/card-3-expanded-orange.png"
    }
  },
  {
    id: "podcast",
    title: "Pengajuan Peminjaman Ruang Podcast",
    text: "Ajukan peminjaman ruang podcast COMPACT untuk kebutuhan rekaman dan produksi konten Anda.",
    cta: "Ajukan Ruang Podcast",
    href: "/ajukan/peminjaman-podcast",
    icon: Mic,
    images: {
      collapsed: "/images/accordion/card-4-collapsed.png",
      expanded: "/images/accordion/card-4-expanded.png",
      blue: "/images/accordion/card-4-expanded-blue.png",
      orange: "/images/accordion/card-4-expanded-orange.png"
    }
  }
];

export function ScrollAccordion() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const expandedGroupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const collapsedGroupRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const blueRefs = useRef<(HTMLImageElement | null)[]>([]);
  const orangeRefs = useRef<(HTMLImageElement | null)[]>([]);
  const jumpRef = useRef<(index: number) => void>(() => {});

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!section || !stage || !track) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    const expandedGroups = expandedGroupRefs.current.filter(Boolean) as HTMLElement[];
    const collapsedGroups = collapsedGroupRefs.current.filter(Boolean) as HTMLButtonElement[];
    const blueSilhouettes = blueRefs.current.filter(Boolean) as HTMLImageElement[];
    const orangeSilhouettes = orangeRefs.current.filter(Boolean) as HTMLImageElement[];
    if (cards.length !== ITEMS.length) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      let active = -1;
      let activeFractions: number[] = [];
      let jumpToken = 0;
      let jumpTimer: number | null = null;

      const restoreCardState = () => {
        stage.classList.remove("accordion-stage-active");
        cards.forEach((card) => {
          card.style.removeProperty("width");
          card.querySelectorAll<HTMLElement>("[data-card-link]").forEach((link) => {
            link.removeAttribute("tabindex");
          });
        });
        [...expandedGroups, ...collapsedGroups].forEach((group) => {
          group.removeAttribute("aria-hidden");
          group.style.removeProperty("filter");
          group.style.removeProperty("visibility");
          group.style.removeProperty("opacity");
          group.style.removeProperty("pointerEvents");
        });
        collapsedGroups.forEach((button) => {
          button.tabIndex = 0;
        });
        [...blueSilhouettes, ...orangeSilhouettes].forEach((silhouette) => {
          silhouette.style.removeProperty("opacity");
          silhouette.style.removeProperty("visibility");
          silhouette.style.removeProperty("transform");
        });
      };

      const setActiveCard = (index: number) => {
        if (index === active) return;
        active = index;
        cards.forEach((card, i) => {
          const isActive = i === index;
          card.querySelectorAll<HTMLElement>("[data-card-link]").forEach((link) => {
            if (isActive) link.removeAttribute("tabindex");
            else link.setAttribute("tabindex", "-1");
          });

          if (isActive) {
            expandedGroups[i].removeAttribute("aria-hidden");
            collapsedGroups[i].setAttribute("aria-hidden", "true");
            collapsedGroups[i].style.pointerEvents = "none";
            collapsedGroups[i].tabIndex = -1;
          } else {
            expandedGroups[i].setAttribute("aria-hidden", "true");
            collapsedGroups[i].removeAttribute("aria-hidden");
            collapsedGroups[i].style.pointerEvents = "";
            collapsedGroups[i].tabIndex = 0;
          }
        });
      };

      const gap = () => {
        const value = parseFloat(getComputedStyle(track).columnGap || "16");
        return Number.isFinite(value) ? value : 16;
      };
      const available = () => stage.clientWidth - gap() * (ITEMS.length - 1);
      const activeWidth = () => Math.min(840, available() * 0.64);
      const collapsedWidth = () => (available() - activeWidth()) / (ITEMS.length - 1);

      stage.classList.add("accordion-stage-active");
      // autoAlpha ikut menyetel visibility, jadi panel yang belum/tidak
      // terbuka benar-benar tidak bisa menerima klik maupun fokus.
      gsap.set(expandedGroups, { autoAlpha: 0, filter: "blur(14px)" });
      gsap.set(collapsedGroups, { autoAlpha: 1, filter: "blur(0px)" });
      // Siluet warna mulai tersembunyi tepat di belakang foto, lalu melebar
      // keluar saat kartu benar-benar terbuka penuh.
      gsap.set([...blueSilhouettes, ...orangeSilhouettes], { autoAlpha: 0, xPercent: 0 });
      cards[0].querySelectorAll<HTMLElement>("[data-card-link]").forEach((link) => {
        link.removeAttribute("tabindex");
      });

      const view = 1.3;
      const transition = 1.6;
      const activeTimes: number[] = [0];

      const timeline = gsap.timeline({
        defaults: { ease: "power1.inOut" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => "+=" + Math.round(window.innerHeight * 4.2),
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (activeFractions.length === 0) return;
            let next = 0;
            for (let i = 1; i < activeFractions.length; i += 1) {
              if (self.progress >= activeFractions[i]) next = i;
            }
            setActiveCard(next);
          }
        }
      });

      let time = 0;

      const spreadSilhouettes = (index: number, at: number, duration: number) => {
        const start = at + 0.2;
        timeline.to(
          orangeSilhouettes[index],
          { autoAlpha: 1, xPercent: -1.1, duration, ease: "power3.out" },
          start
        );
        timeline.to(
          blueSilhouettes[index],
          { autoAlpha: 1, xPercent: 1.1, duration, ease: "power3.out" },
          start
        );
      };

      const retractSilhouettes = (index: number, at: number, duration: number) => {
        timeline.to(
          orangeSilhouettes[index],
          { autoAlpha: 0, xPercent: 0, duration, ease: "power2.in" },
          at
        );
        timeline.to(
          blueSilhouettes[index],
          { autoAlpha: 0, xPercent: 0, duration, ease: "power2.in" },
          at
        );
      };

      // Kartu pertama langsung terbuka sejak awal.
      timeline.set(cards[0], { width: () => activeWidth() }, 0);
      for (let i = 1; i < ITEMS.length; i += 1) {
        timeline.set(cards[i], { width: () => collapsedWidth() }, 0);
      }
      timeline.set(collapsedGroups[0], { autoAlpha: 0, filter: "blur(14px)" }, 0);
      timeline.set(expandedGroups[0], { autoAlpha: 1, filter: "blur(0px)" }, 0);
      timeline.set(orangeSilhouettes[0], { autoAlpha: 1, xPercent: -1.5 }, 0);
      timeline.set(blueSilhouettes[0], { autoAlpha: 1, xPercent: 1.5 }, 0);

      time += view;

      for (let i = 0; i < ITEMS.length - 1; i += 1) {
        const start = time;

        timeline.to(cards[i], { width: () => collapsedWidth(), duration: transition, ease: "power2.inOut" }, start);
        timeline.to(cards[i + 1], { width: () => activeWidth(), duration: transition, ease: "power2.inOut" }, start);

        timeline.to(
          expandedGroups[i],
          { autoAlpha: 0, filter: "blur(14px)", duration: transition * 0.3, ease: "power2.inOut" },
          start + transition * 0.35
        );
        timeline.to(
          collapsedGroups[i],
          { autoAlpha: 1, filter: "blur(0px)", duration: transition * 0.25, ease: "power2.out" },
          start + transition * 0.4
        );

        timeline.to(
          collapsedGroups[i + 1],
          { autoAlpha: 0, filter: "blur(14px)", duration: transition * 0.3, ease: "power2.inOut" },
          start + transition * 0.3
        );
        timeline.to(
          expandedGroups[i + 1],
          { autoAlpha: 1, duration: transition * 0.4, ease: "power2.out" },
          start + transition * 0.2
        );
        timeline.to(
          expandedGroups[i + 1],
          { filter: "blur(0px)", duration: transition * 0.3, ease: "power2.inOut" },
          start + transition * 0.7
        );
        retractSilhouettes(i, start, transition * 0.3);
        // Kartu berikutnya baru memunculkan siluetnya saat sudah terbuka penuh.
        spreadSilhouettes(i + 1, start + transition * 0.85, transition * 0.5);

        // Samakan status aktif dengan akhir animasi panel supaya aria-hidden
        // tidak menandai konten yang masih terlihat.
        activeTimes.push(start + transition * 0.65);
        time += transition + view;
      }

      timeline.to({}, { duration: view }, time - view);

      activeFractions = activeTimes.map((value) => value / timeline.duration());
      // Titik scroll di tengah fase diam tiap kartu, dipakai saat kartu sempit
      // diklik. Kartu pertama sudah terbuka sejak awal.
      const jumpFractions = activeTimes.map((value, i) =>
        i === 0
          ? (view * 0.3) / timeline.duration()
          : (value + transition * 0.35 + view * 0.15) / timeline.duration()
      );
      jumpRef.current = (index) => {
        const trigger = timeline.scrollTrigger;
        if (!trigger) return;
        const targetY = (i: number) => trigger.start + jumpFractions[i] * (trigger.end - trigger.start);

        const distance = index - active;
        if (Math.abs(distance) <= 1) {
          scrollToY(targetY(index), { duration: 0.8, easing: easeInOutCubic });
          return;
        }

        // Lewati satu per satu kartu di antaranya dengan jeda 200ms supaya
        // lompatan dari kartu pertama ke terakhir tidak terasa terlalu cepat.
        const step = distance > 0 ? 1 : -1;
        const queue: number[] = [];
        for (let i = active + step; i !== index; i += step) queue.push(i);
        queue.push(index);

        const token = jumpToken += 1;
        if (jumpTimer !== null) {
          window.clearTimeout(jumpTimer);
          jumpTimer = null;
        }

        const run = (position: number) => {
          if (token !== jumpToken) return;
          const last = position === queue.length - 1;
          scrollToY(targetY(queue[position]), {
            duration: 0.7,
            easing: easeInOutCubic,
            onComplete: () => {
              if (token !== jumpToken || last) return;
              jumpTimer = window.setTimeout(() => run(position + 1), 200);
            }
          });
        };
        run(0);
      };

      setAccordionJumpHandler((index) => {
        jumpRef.current(index);
        return true;
      });

      setActiveCard(0);

      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        jumpToken += 1;
        if (jumpTimer !== null) window.clearTimeout(jumpTimer);
        jumpRef.current = () => {};
        setAccordionJumpHandler(null);
        restoreCardState();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section id="pilih-jenis" ref={sectionRef} className="scroll-mt-24 pb-12 sm:pb-16">
      <div
        ref={stageRef}
        data-accordion-stage
        className="accordion-stage relative mx-auto flex w-full max-w-7xl flex-col items-center gap-4 overflow-hidden px-4 pt-8 sm:pt-10 motion-safe:md:justify-center motion-safe:md:gap-3 md:px-0"
      >
        <div className="mx-auto w-full max-w-6xl px-0 md:px-4">
          <h2 data-reveal className="text-balance text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
            Pilih Jenis Pengajuan
          </h2>
          <p data-reveal className="mt-1.5 text-base text-slate-500 sm:text-lg">
            Pilih salah satu jenis pengajuan sesuai kebutuhan Anda bersama COMPACT.
          </p>
        </div>

        <div
          ref={trackRef}
          data-accordion-track
          className="flex w-full flex-col items-center gap-6 motion-safe:md:flex-row motion-safe:md:items-stretch motion-safe:md:justify-center motion-safe:md:gap-4"
        >
          {ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={item.id}
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                className="relative w-full max-w-[640px] shrink-0 overflow-hidden rounded-[28px] border border-line/80 bg-white shadow-card md:h-[min(600px,74svh)] md:w-[min(760px,62vw)] md:max-w-none"
              >
                <div
                  ref={(element) => {
                    expandedGroupRefs.current[index] = element;
                  }}
                  className="relative flex h-full w-full flex-col md:flex-row motion-safe:md:absolute motion-safe:md:inset-0"
                >
                  <div className="flex flex-col justify-center p-6 sm:p-8 md:w-[54%] md:p-10 lg:p-14">
                    <span className="tile-icon h-14 w-14">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 break-words text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-7 text-slate-500 sm:text-base">{item.text}</p>
                    <Link
                      href={item.href}
                      data-card-link
                      className="btn-primary mt-7 w-full justify-center sm:w-auto sm:self-start"
                    >
                      {item.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="relative h-64 w-full shrink-0 overflow-hidden sm:h-72 md:h-auto md:w-[46%]">
                    <Image
                      ref={(element) => {
                        orangeRefs.current[index] = element;
                      }}
                      src={item.images.orange}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 30vw, 90vw"
                      aria-hidden
                      className="pointer-events-none -translate-x-[1.5%] select-none object-contain object-bottom"
                    />
                    <Image
                      ref={(element) => {
                        blueRefs.current[index] = element;
                      }}
                      src={item.images.blue}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 30vw, 90vw"
                      aria-hidden
                      className="pointer-events-none translate-x-[1.5%] select-none object-contain object-bottom"
                    />
                    <Image
                      src={item.images.expanded}
                      alt=""
                      fill
                      priority={index === 0}
                      sizes="(min-width: 768px) 30vw, 90vw"
                      className="z-10 object-contain object-bottom"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  ref={(element) => {
                    collapsedGroupRefs.current[index] = element;
                  }}
                  onClick={() => jumpRef.current(index)}
                  aria-label={`Buka ${item.title}`}
                  className="absolute inset-0 hidden cursor-pointer flex-col items-center justify-between gap-4 px-3 py-6 text-left motion-safe:md:flex"
                >
                  <span className="tile-icon h-12 w-12 shrink-0">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex min-h-0 flex-1 items-center justify-center overflow-hidden text-center text-sm font-semibold leading-snug tracking-tight text-ink">
                    {item.title}
                  </span>
                  <div className="relative h-[30%] w-full shrink-0">
                    <Image
                      src={item.images.collapsed}
                      alt=""
                      fill
                      priority={index === 0}
                      sizes="15vw"
                      className="origin-bottom scale-150 object-contain object-bottom"
                    />
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
