"use client";

/* eslint-disable @next/next/no-img-element -- Local art-directed images crossfade as full-screen backgrounds. */

import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FieldCanvas } from "./FieldCanvas";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (path: string) => `${basePath}${path}`;

const backgrounds = [
  "/images/albin/20251127_Zgrywa_136.jpg",
  "/images/albin/20251222_Zgrywa_058.jpg",
  "/images/albin/20251222_Zgrywa_107.jpg",
  "/images/albin/20251222_Zgrywa_164.jpg",
  "/images/albin/20251222_Zgrywa_232.jpg",
  "/images/albin/20251223_Zgrywa_051.jpg",
  "/images/albin/20251223_Zgrywa_106.jpg",
  "/images/albin/20251223_Zgrywa_152.jpg",
  "/images/albin/20251223_Zgrywa_171.jpg",
] as const;

const shortcuts = [
  {
    number: "01",
    label: "Sound direction i postprodukcja",
    name: "Zgrywa Studio",
    href: "https://www.zgrywastudio.com/",
    image: "/images/albin/20251222_Zgrywa_232.jpg",
    gallery: [
      "/images/albin/20251222_Zgrywa_232.jpg",
      "/images/albin/20251127_Zgrywa_136.jpg",
      "/images/albin/20251223_Zgrywa_106.jpg",
    ],
    tone: "green",
  },
  {
    number: "02",
    label: "Creative AI i R&D",
    name: "Generatywni",
    href: "https://generatywni.com/pl/team/mieszko-mahboob",
    image: "/images/albin/20251223_Zgrywa_152.jpg",
    gallery: [
      "/images/albin/20251223_Zgrywa_152.jpg",
      "/images/albin/20251223_Zgrywa_171.jpg",
    ],
    tone: "red",
  },
  {
    number: "03",
    label: "Prototypy i eksperymenty",
    name: "Prototypy",
    image: "/images/albin/20251223_Zgrywa_051.jpg",
    gallery: [
      "/images/albin/20251223_Zgrywa_051.jpg",
      "/images/albin/20251222_Zgrywa_058.jpg",
    ],
    tone: "pastel",
    projects: [
      {
        name: "Kosmiczna Grawitacja",
        description: "Interaktywna nauka fizyki i kosmosu.",
        href: "https://jakiesluchawki.github.io/kosmiczne-laboratorium/",
      },
      {
        name: "Chmurnik",
        description: "Atlas chmur, pogody i atmosfery.",
        href: "https://chmurnik.cloud/",
      },
      {
        name: "Energylandia",
        description: "Pogoda, bezpieczeństwo i plan dnia.",
        href: "https://jakiesluchawki.github.io/planer-energylandia/",
      },
    ],
  },
  {
    number: "04",
    label: "Sound design",
    name: "Futurama 3",
    href: "https://analogdigital.tv/work/quebonafide-futurama-3/",
    image: "/images/albin/20251222_Zgrywa_107.jpg",
    gallery: [
      "/images/albin/20251222_Zgrywa_107.jpg",
      "/images/albin/20251222_Zgrywa_164.jpg",
    ],
    tone: "violet",
  },
] as const;

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Portfolio() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeShortcut, setActiveShortcut] = useState(0);
  const [activeImage, setActiveImage] = useState<string>(shortcuts[0].image);
  const [hoveredShortcut, setHoveredShortcut] = useState<number | null>(null);
  const [signal, setSignal] = useState(false);
  const [prototypesOpen, setPrototypesOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.sessionStorage.getItem("mahboob-intro") === "seen") {
      const seenFrame = window.requestAnimationFrame(() => {
        setLoading(false);
        setProgress(100);
      });
      return () => window.cancelAnimationFrame(seenFrame);
    }

    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const value = Math.min(100, Math.round(((now - started) / 1250) * 100));
      setProgress(value);
      if (value < 100) {
        frame = window.requestAnimationFrame(tick);
      } else {
        window.sessionStorage.setItem("mahboob-intro", "seen");
        window.setTimeout(() => setLoading(false), 360);
      }
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hoveredShortcut === null) return;

    const gallery = shortcuts[hoveredShortcut].gallery;
    let galleryIndex = 0;
    let rotation: number | undefined;
    const delay = window.setTimeout(() => {
      galleryIndex = (galleryIndex + 1) % gallery.length;
      setActiveImage(gallery[galleryIndex]);
      rotation = window.setInterval(() => {
        galleryIndex = (galleryIndex + 1) % gallery.length;
        setActiveImage(gallery[galleryIndex]);
      }, 1350);
    }, 850);

    return () => {
      window.clearTimeout(delay);
      if (rotation) window.clearInterval(rotation);
    };
  }, [hoveredShortcut]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.code !== "Space" || target?.matches("a, button, input, textarea, select")) return;
      event.preventDefault();
      setSignal(true);
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      setSignal(false);
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, triggerModule]) => {
      if (cancelled) return;
      const gsap = gsapModule.gsap;
      const ScrollTrigger = triggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.fromTo(
          "[data-enter]",
          { yPercent: 115, rotate: 1.5 },
          { yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.08, ease: "expo.out", delay: 0.05 },
        );
        gsap.fromTo(
          "[data-fade]",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: "power4.out", delay: 0.38 },
        );

        gsap.utils.toArray<HTMLElement>("[data-scroll-reveal]").forEach((element) => {
          gsap.fromTo(
            element,
            { y: 54, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power4.out",
              scrollTrigger: { trigger: element, start: "top 90%", once: true },
            },
          );
        });
      }, root);
      cleanup = () => context.revert();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const moveLight = (event: React.PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root || event.pointerType === "touch") return;
    root.style.setProperty("--pointer-x", `${event.clientX}px`);
    root.style.setProperty("--pointer-y", `${event.clientY}px`);
    root.style.setProperty("--shift-x", `${(event.clientX / window.innerWidth - 0.5) * -18}px`);
    root.style.setProperty("--shift-y", `${(event.clientY / window.innerHeight - 0.5) * -14}px`);
  };

  const startBackgroundPreview = (index: number) => {
    setActiveShortcut(index);
    setActiveImage(shortcuts[index].image);
    setHoveredShortcut(index);
  };

  const stopBackgroundPreview = () => setHoveredShortcut(null);

  return (
    <div
      ref={rootRef}
      className={`home tone-${shortcuts[activeShortcut].tone} ${signal ? "is-signal" : ""}`}
      style={{
        "--active": activeShortcut,
        "--loader-image": `url("${asset("/images/albin/20251222_Zgrywa_164.jpg")}")`,
        "--contact-image": `url("${asset("/images/albin/20251222_Zgrywa_058.jpg")}")`,
      } as CSSProperties}
      onPointerMove={moveLight}
      onPointerDown={() => setSignal(true)}
      onPointerUp={() => setSignal(false)}
      onPointerCancel={() => setSignal(false)}
    >
      <a className="skip-link" href="#links">Przejdź do linków</a>

      <div className={`intro-loader ${loading ? "is-visible" : ""}`} aria-hidden={!loading}>
        <strong>Mieszko Mahboob</strong>
        <span>{String(progress).padStart(3, "0")}</span>
        <i style={{ transform: `scaleX(${progress / 100})` }} />
      </div>

      <div className="backgrounds" aria-hidden="true">
        {backgrounds.map((image) => (
          <img
            src={asset(image)}
            alt=""
            className={image === activeImage ? "is-active" : ""}
            key={image}
            decoding="async"
          />
        ))}
        <div className="background-wash" />
        <div className="pointer-light" />
        <div className="pointer-rings" />
        <div className="pointer-mark"><i /><i /></div>
      </div>

      <FieldCanvas mode={activeShortcut} xray={signal} />

      <header className="topbar" data-fade>
        <a className="wordmark" href="#top" aria-label="Mieszko Mahboob, początek strony">
          <img src={asset("/brand/zgrywa-symbol.svg")} alt="" width="24" height="31" />
          <span>Mieszko Mahboob</span>
        </a>
        <p>Warszawa</p>
        <a href="mailto:contact@mahboob.pl">contact@mahboob.pl</a>
      </header>

      <main id="top">
        <section className="intro" aria-labelledby="name">
          <p className="roles" data-fade>Sound director · Creative Leader · AI</p>
          <h1 id="name">
            <span><span data-enter>Mieszko</span></span>
            <span><span data-enter>Mahboob</span></span>
          </h1>
          <p className="intro-note" data-fade>
            Zgrywa Studio i Generatywni.<br />Dźwięk, projekty kreatywne, narzędzia AI.
          </p>
          <nav className="intro-socials" aria-label="Profile społecznościowe" data-fade>
            <a href="https://www.linkedin.com/in/mieszkomahboob" target="_blank" rel="noreferrer">LinkedIn <Arrow /></a>
            <a href="https://www.instagram.com/mahboob" target="_blank" rel="noreferrer">Instagram <Arrow /></a>
            <a href="https://x.com/mieszkomahboob" target="_blank" rel="noreferrer">X <Arrow /></a>
          </nav>
          <a className="contact-jump" href="#contact" data-fade>Kontakt <span aria-hidden="true">↓</span></a>
          <div className="hero-ticker" aria-hidden="true">
            <div>
              <span>Sound direction</span><i>✦</i><span>Creative AI</span><i>✦</i><span>Zgrywa Studio</span><i>✦</i><span>Generatywni</span><i>✦</i>
              <span>Sound direction</span><i>✦</i><span>Creative AI</span><i>✦</i><span>Zgrywa Studio</span><i>✦</i><span>Generatywni</span><i>✦</i>
            </div>
          </div>
        </section>

        <section className="shortcut-section" id="links" aria-label="Wybrane linki">
          <div className="shortcut-heading">
            <p>Wybrane</p>
            <p>Najedź. Tła zmienią się.</p>
          </div>
          <div className="shortcut-list">
            {shortcuts.map((item, index) => {
              if ("projects" in item) {
                return (
                  <div
                    className={`prototype-group ${prototypesOpen ? "is-open" : ""}`}
                    onPointerEnter={() => startBackgroundPreview(index)}
                    onPointerLeave={stopBackgroundPreview}
                    data-scroll-reveal
                    key={item.number}
                  >
                    <button
                      className="prototype-summary"
                      type="button"
                      aria-expanded={prototypesOpen}
                      aria-controls="prototype-list"
                      onClick={() => setPrototypesOpen((value) => !value)}
                      onFocus={() => startBackgroundPreview(index)}
                      onBlur={stopBackgroundPreview}
                    >
                      <small>{item.number}</small>
                      <span>{item.label}</span>
                      <strong>{item.name}</strong>
                      <span className="prototype-toggle" aria-hidden="true">{prototypesOpen ? "−" : "+"}</span>
                    </button>
                    <div className="prototype-panel" id="prototype-list">
                      <div className="prototype-panel-inner">
                        {item.projects.map((project) => (
                          <a className="prototype-project" href={project.href} target="_blank" rel="noreferrer" key={project.href}>
                            <strong>{project.name}</strong>
                            <span>{project.description}</span>
                            <Arrow />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  onPointerEnter={() => startBackgroundPreview(index)}
                  onPointerLeave={stopBackgroundPreview}
                  onFocus={() => startBackgroundPreview(index)}
                  onBlur={stopBackgroundPreview}
                  data-scroll-reveal
                  key={item.href}
                >
                  <small>{item.number}</small>
                  <span>{item.label}</span>
                  <strong>{item.name}</strong>
                  <Arrow />
                </a>
              );
            })}
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <p>Kontakt</p>
          <h2 id="contact-title" data-scroll-reveal>Napisz albo zadzwoń.</h2>
          <div className="contact-links" data-scroll-reveal>
            <a href="mailto:contact@mahboob.pl">contact@mahboob.pl <Arrow /></a>
            <a href="tel:+48607397993">+48 607 397 993 <Arrow /></a>
          </div>
          <nav aria-label="Profile społecznościowe">
            <a href="https://www.linkedin.com/in/mieszkomahboob" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/mahboob" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://x.com/mieszkomahboob" target="_blank" rel="noreferrer">X</a>
          </nav>
        </section>
      </main>

      <footer>
        <span>© 2026</span>
        <span>Zdjęcia: Tomek Albin</span>
        <button type="button" onClick={() => setSignal((value) => !value)} aria-pressed={signal}>
          Sygnał <kbd>SPACE</kbd>
        </button>
      </footer>
    </div>
  );
}
