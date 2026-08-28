"use client";

import { useEffect, useId, useRef } from "react";

type MediaShape = "rect" | "deliverables-wedge";
type VeilVariant = "intro" | "deliverables" | "none";

interface FixedSectionMediaProps {
  src: string;
  className?: string;
  position?: string;
  shape?: MediaShape;
  veil?: VeilVariant;
}

/**
 * Viewport-fixed background clipped to the parent section.
 * Image + veil share one fixed layer so they stay in sync while scrolling.
 */
export function FixedSectionMedia({
  src,
  className = "",
  position = "center center",
  shape = "rect",
  veil = "none",
}: FixedSectionMediaProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const layerId = useId().replace(/:/g, "");

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const section = anchor.closest("section");
    if (!section) return;

    const layer = document.createElement("div");
    layer.id = layerId;
    layer.setAttribute("aria-hidden", "true");
    layer.style.position = "fixed";
    layer.style.inset = "0";
    layer.style.zIndex = "0";
    layer.style.pointerEvents = "none";
    layer.style.willChange = "clip-path";
    layer.style.opacity = "0";

    const image = document.createElement("div");
    image.style.position = "absolute";
    image.style.inset = "0";
    image.style.backgroundRepeat = "no-repeat";
    image.style.backgroundSize = "cover";
    image.style.backgroundImage = `url("${src}")`;
    image.style.backgroundPosition = position;
    layer.appendChild(image);

    if (veil !== "none") {
      const veilEl = document.createElement("div");
      veilEl.style.position = "absolute";
      veilEl.style.inset = "0";
      veilEl.className =
        veil === "intro" ? "intro-veil" : "deliverables-media-veil";
      layer.appendChild(veilEl);
    }

    if (shape === "deliverables-wedge") {
      const edge = document.createElement("div");
      edge.className = "deliverables-edge";
      edge.style.position = "absolute";
      edge.style.inset = "0";
      layer.appendChild(edge);
    }

    document.body.appendChild(layer);

    const prevPosition = section.style.position;
    const prevZ = section.style.zIndex;
    const computedPos = window.getComputedStyle(section).position;
    if (computedPos === "static") {
      section.style.position = "relative";
    }
    if (!section.style.zIndex) {
      section.style.zIndex = "1";
    }

    let rafId = 0;
    let active = false;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const visible =
        rect.bottom > 0 && rect.top < vh && rect.right > 0 && rect.left < vw;

      layer.style.opacity = visible ? "1" : "0";
      if (!visible) {
        layer.style.clipPath = "inset(100%)";
        return;
      }

      if (shape === "deliverables-wedge") {
        const x = (p: number) => `${rect.left + rect.width * p}px`;
        const y = (p: number) => `${rect.top + rect.height * p}px`;
        layer.style.clipPath = `polygon(${x(0)} ${y(0)}, ${x(0.8)} ${y(0)}, ${x(0.62)} ${y(1)}, ${x(0)} ${y(1)})`;
      } else {
        const top = Math.max(0, rect.top);
        const bottom = Math.max(0, vh - rect.bottom);
        const left = Math.max(0, rect.left);
        const right = Math.max(0, vw - rect.right);
        layer.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
      }
    };

    const tick = () => {
      update();
      if (active) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (active) return;
      active = true;
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      active = false;
      cancelAnimationFrame(rafId);
      layer.style.opacity = "0";
      layer.style.clipPath = "inset(100%)";
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          start();
        } else {
          stop();
        }
      },
      { root: null, rootMargin: "120px 0px", threshold: 0 }
    );

    observer.observe(section);

    const rect = section.getBoundingClientRect();
    const inView =
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth;
    if (inView) {
      start();
    } else {
      update();
    }

    const onResize = () => update();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      layer.remove();
      section.style.position = prevPosition;
      section.style.zIndex = prevZ;
    };
  }, [src, position, layerId, shape, veil]);

  return (
    <div
      ref={anchorRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-20 ${className}`}
    />
  );
}
