import { Box } from '@mui/material';
import { alpha, BG_DARK, gridScroll, NEON } from '../styles/neon';

/**
 * Fixed decorative layers: a synthwave perspective grid behind the content
 * and very faint scanlines on top. Purely visual; ignores pointer events.
 */
export default function NeonBackground() {
  return (
    <>
      <Box
        aria-hidden
        sx={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}
      >
        {/* Horizon glow */}
        <Box
          sx={{
            position: 'absolute',
            left: '-10%',
            right: '-10%',
            bottom: '32vh',
            height: '30vh',
            background: `radial-gradient(ellipse at bottom, ${alpha(NEON.magenta, 0.28)} 0%, transparent 70%)`,
          }}
        />
        {/* Perspective grid floor */}
        <Box
          sx={{
            position: 'absolute',
            left: '-50%',
            right: '-50%',
            bottom: 0,
            height: '45vh',
            transformOrigin: 'bottom center',
            transform: 'perspective(320px) rotateX(58deg)',
            backgroundImage: `
              linear-gradient(${alpha(NEON.magenta, 0.55)} 2px, transparent 2px),
              linear-gradient(90deg, ${alpha(NEON.magenta, 0.55)} 2px, transparent 2px)
            `,
            backgroundSize: '60px 60px',
            animation: `${gridScroll} 2.5s linear infinite`,
            maskImage: `linear-gradient(to top, #000 0%, transparent 85%)`,
            WebkitMaskImage: `linear-gradient(to top, #000 0%, transparent 85%)`,
            opacity: 0.45,
          }}
        />
        {/* Darken the floor towards the content area */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to bottom, ${alpha(BG_DARK, 0)} 40%, ${alpha(BG_DARK, 0.35)} 100%)`,
          }}
        />
      </Box>
      {/* Scanlines (very subtle so they don't bother on a projector) */}
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px)',
          opacity: 0.35,
        }}
      />
    </>
  );
}
