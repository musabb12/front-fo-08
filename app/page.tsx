import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="relative isolate flex min-h-screen items-center overflow-hidden">
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/hero-real.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="anim-kenburns object-cover"
        />
      </div>
      <div className="media-veil absolute inset-0 -z-10" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-blueprint-grid bg-grid-24 opacity-35"
      />

      <div className="mx-auto w-full max-w-3xl px-6 py-24 text-center">
        <p className="anim-slide-up mb-4 font-mono text-xs uppercase tracking-[0.25em] text-amber">
          الوكالة · خدمات رقمية
        </p>
        <h1 className="anim-slide-up anim-delay-1 mb-6 font-display text-3xl font-extrabold text-paper md:text-5xl">
          مواقع تُرسم مخططًا قبل ما تُبنى
        </h1>
        <p className="anim-slide-up anim-delay-2 mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          ابدأ من صفحة خدمة البرمجة وتطوير المواقع — نموذج حي لكيفية تقديمنا للمشاريع.
        </p>
        <div className="anim-slide-up anim-delay-3 flex flex-wrap items-center justify-center gap-4">
          <Button href="/services/web-development" variant="primary">
            استعرض الخدمة
          </Button>
          <Button href="/admin" variant="outline">
            لوحة المحتوى
          </Button>
        </div>
      </div>
    </main>
  );
}
