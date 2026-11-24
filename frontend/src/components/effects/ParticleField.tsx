import { useEffect, useRef } from 'react';

/**
 * A slow constellation of points that link up when close, echoing the idea of
 * matching. Canvas-based, capped DPR, paused when the tab is hidden, and never
 * mounted when reduced motion or a low-power device is detected.
 */
export default function ParticleField({ density = 0.00005, color = '148, 163, 255' }: { density?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let frame = 0;
    let running = true;
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let points: P[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.max(24, Math.round(w * h * density)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.3 + 0.4,
      }));
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      const link = 120;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        for (let j = i + 1; j < points.length; j++) {
          const q = points[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < link * link) {
            ctx.strokeStyle = `rgba(${color}, ${0.09 * (1 - Math.sqrt(d2) / link)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${color}, 0.5)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      running = !document.hidden;
      cancelAnimationFrame(frame);
      if (running) frame = requestAnimationFrame(draw);
    };

    resize();
    frame = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density, color]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
