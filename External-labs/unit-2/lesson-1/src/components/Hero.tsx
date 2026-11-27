import { useEffect, useRef } from "react";
import { IconBolt, IconFlask, IconSparkle } from "@/components/icons";
import { HeroArt } from "@/components/art";
import { T } from "@/lib/math";
import { play } from "@/lib/sound";

type Charge = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  q: 1 | -1;
  r: number;
};

function ChargesCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef({ x: -999, y: -999, active: false });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let raf = 0;
    let charges: Charge[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = () => {
      const count = width < 640 ? 20 : 34;
      charges = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        q: i % 2 === 0 ? 1 : -1,
        r: 3 + Math.random() * 3.4,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(320, rect.width);
      height = Math.max(220, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (charges.length === 0) seed();
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      // field lines between nearby opposite charges
      for (let i = 0; i < charges.length; i++) {
        for (let j = i + 1; j < charges.length; j++) {
          const a = charges[i];
          const b = charges[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 15000) {
            const alpha = (1 - d2 / 15000) * 0.3;
            ctx.strokeStyle =
              a.q !== b.q ? `rgba(47,160,124,${alpha.toFixed(3)})` : `rgba(233,162,43,${(alpha * 0.55).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
          // gentle coulomb-ish drift (softened, bounded)
          const d = Math.sqrt(d2) + 24;
          const f = ((a.q * b.q) / (d * d)) * 26;
          a.vx += (dx / d) * f * 0.02;
          a.vy += (dy / d) * f * 0.02;
          b.vx -= (dx / d) * f * 0.02;
          b.vy -= (dy / d) * f * 0.02;
        }
      }

      for (const c of charges) {
        if (pointer.current.active) {
          const dx = c.x - pointer.current.x;
          const dy = c.y - pointer.current.y;
          const d = Math.hypot(dx, dy) + 12;
          if (d < 170) {
            const f = (c.q * 1) / (d * d);
            c.vx += (dx / d) * f * 42;
            c.vy += (dy / d) * f * 42;
          }
        }

        c.vx = Math.max(-1.1, Math.min(1.1, c.vx * 0.994));
        c.vy = Math.max(-1.1, Math.min(1.1, c.vy * 0.994));
        c.x += c.vx;
        c.y += c.vy;

        if (c.x < 6 || c.x > width - 6) c.vx *= -1;
        if (c.y < 6 || c.y > height - 6) c.vy *= -1;
        c.x = Math.max(6, Math.min(width - 6, c.x));
        c.y = Math.max(6, Math.min(height - 6, c.y));

        const positive = c.q > 0;
        const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r * 4.2);
        glow.addColorStop(0, positive ? "rgba(233,162,43,0.55)" : "rgba(46,154,166,0.5)");
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = positive ? "#e9a22b" : "#2e9aa6";
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255,255,255,0.92)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(c.x - c.r * 0.5, c.y);
        ctx.lineTo(c.x + c.r * 0.5, c.y);
        if (positive) {
          ctx.moveTo(c.x, c.y - c.r * 0.5);
          ctx.lineTo(c.x, c.y + c.r * 0.5);
        }
        ctx.stroke();
      }

      raf = window.requestAnimationFrame(step);
    };

    resize();
    if (reduced) {
      step();
      window.cancelAnimationFrame(raf);
    } else {
      raf = window.requestAnimationFrame(step);
    }

    let rect = canvas.getBoundingClientRect();
    const syncRect = () => {
      rect = canvas.getBoundingClientRect();
    };

    const onMove = (ev: PointerEvent) => {
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const inside = x >= -40 && y >= -40 && x <= rect.width + 40 && y <= rect.height + 40;
      pointer.current = { x, y, active: inside };
    };

    const ro = new ResizeObserver(() => {
      resize();
      syncRect();
    });
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", syncRect, { passive: true });
    window.addEventListener("resize", syncRect);

    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", syncRect);
      window.removeEventListener("resize", syncRect);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

export function Hero({ onStart, onExperiments }: { onStart: () => void; onExperiments: () => void }) {
  const stats = [
    { value: "8", label: "محطات تفاعلية" },
    { value: "7", label: "تجارب منزلية حقيقية" },
    { value: "6", label: "محاكاة حيّة" },
    { value: "14", label: "سؤال تقويم" },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 mesh-paper" />
      <div className="absolute inset-0 grain opacity-[0.05]" />
      <div className="absolute inset-x-0 top-0 h-[420px] opacity-90">
        <ChargesCanvas />
      </div>
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-forest-300/30 blur-3xl anim-float-slow" />
      <div className="pointer-events-none absolute -right-16 top-48 h-72 w-72 rounded-full bg-spark-200/40 blur-3xl anim-float" />

      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="anim-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-forest-900/90 px-3.5 py-1.5 text-[11px] font-bold text-forest-100 ring-1 ring-inset ring-forest-700">
              <IconBolt className="h-3.5 w-3.5 text-spark-400" />
              الوحدة الثانية · الدرس الأول · صفحات <span className="num">73–86</span>
            </span>

            <h2 className="mt-5 text-balance text-4xl font-bold leading-[1.15] text-forest-950 sm:text-5xl lg:text-[3.4rem]">
              الكهرباء الساكنة
              <span className="mt-2 block bg-gradient-to-l from-forest-700 via-forest-500 to-spark-500 bg-clip-text text-2xl text-transparent sm:text-3xl">
                شحناتٌ تسكن… حتى تُدلك فتقفز
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-[15px] leading-8 text-ink-700">
              مشطٌ يمرّ في الشعر فيرفع قصاصات الورق، بالونٌ يلتصق بالجدار، وشرارةٌ صغيرة تلسع إصبعك عند مقبض الباب. كل
              ذلك سببه شيء واحد: انتقال <strong className="text-forest-700">الإلكترونات</strong>. في هذا المختبر لن تقرأ
              الدرس فقط، بل ستُدير شحنته بيديك، وتقيس قوّته، وتصنع تجاربه في بيتك.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  play("spark");
                  onStart();
                }}
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-forest-800 to-forest-600 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_36px_-20px_rgba(6,46,39,1)] transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                <IconSparkle className="h-4 w-4 text-spark-400 transition-transform group-hover:rotate-12" />
                ابدأ المحطة الأولى
              </button>
              <button
                type="button"
                onClick={() => {
                  play("whoosh");
                  onExperiments();
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/85 px-5 py-3 text-sm font-bold text-forest-800 ring-1 ring-inset ring-forest-200 backdrop-blur transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                <IconFlask className="h-4 w-4 text-forest-600" />
                تجارب من الحياة الواقعية
              </button>
            </div>

            <dl className="mt-9 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-forest-200/70 bg-white/75 px-3 py-2.5 text-center backdrop-blur-sm"
                >
                  <dt className="num text-2xl font-bold text-forest-700">{s.value}</dt>
                  <dd className="mt-0.5 text-[11px] font-semibold text-ink-500">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Floating "mystery" card */}
          <div className="relative anim-rise" style={{ animationDelay: "120ms" }}>
            <div className="relative overflow-hidden rounded-[32px] border border-forest-200/80 bg-white/80 p-6 backdrop-blur-md panel-shadow">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-spark-200/50 blur-2xl" />
              <p className="relative text-xs font-bold text-forest-600">سؤال الانطلاق</p>
              <p className="relative mt-2 text-lg font-bold leading-9 text-forest-950">
                لماذا ينجذب قصاص الورق المتعادل نحو المشط المدلوك، رغم أنّ الورق لا يحمل شحنة؟
              </p>

              <HeroArt className="relative mt-4 w-full" />

              <p className="relative mt-3 rounded-2xl bg-forest-50 px-4 py-3 text-[13px] leading-7 text-forest-800">
                الجواب في المحطة الثالثة: المشط يُعيد ترتيب شحنات الورقة (استقطاب) فتقترب الشحنات المخالفة وتبتعد
                المماثلة، ولأن القوة تضعف مع المسافة <T e="F \propto \dfrac{1}{d^{2}}" label="القوة تتناسب عكساً مع مربع المسافة" /> يغلب
                التجاذب.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}