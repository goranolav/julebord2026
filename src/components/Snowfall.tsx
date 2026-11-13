import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { prefersReducedMotion } from '../hooks/useAnimatedNumber';

const FLAKE_COUNT = 80;

interface Flake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
}

function makeFlake(width: number, height: number, anywhere: boolean): Flake {
  return {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : -10,
    radius: 1 + Math.random() * 2.6,
    speed: 0.3 + Math.random() * 0.9,
    drift: 0.3 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    opacity: 0.45 + Math.random() * 0.5,
  };
}

/** Gentle falling snow on a full-screen canvas behind the content. */
export default function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // Skip in test environments and for users who prefer reduced motion.
    if (!canvas || prefersReducedMotion() || navigator.userAgent.includes('jsdom')) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const flakes = Array.from({ length: FLAKE_COUNT }, () => makeFlake(width, height, true));
    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(50, now - last) / 16.7;
      last = now;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.speed * dt;
        f.phase += 0.01 * dt;
        f.x += Math.sin(f.phase) * f.drift * 0.5 * dt;
        if (f.y > height + 10) flakes[i] = makeFlake(width, height, false);
        ctx.globalAlpha = f.opacity;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      aria-hidden
      className="neon-layer"
      sx={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}
    />
  );
}
