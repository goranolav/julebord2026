import { Box, Typography } from '@mui/material';
import { DISPLAY_FONT, flicker, NEON, neonText } from '../styles/neon';

interface NeonLogoProps {
  size?: 'large' | 'small';
}

/** "JEOPARDY!" in magenta neon tubes, with an occasional flicker on one letter. */
export default function NeonLogo({ size = 'large' }: NeonLogoProps) {
  const word = 'JEOPARDY';
  const flickerIndex = 3;

  return (
    <Typography
      component="div"
      role="img"
      aria-label="Jeopardy!"
      sx={{
        fontFamily: DISPLAY_FONT,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: '0.08em',
        color: '#ffe8fb',
        textShadow: neonText(NEON.magenta, size === 'large' ? 1.4 : 0.8),
        fontSize: size === 'large' ? { xs: '2.6rem', sm: '4.5rem', md: '6.5rem' } : '2rem',
        userSelect: 'none',
      }}
    >
      {word.split('').map((letter, index) => (
        <Box
          key={index}
          component="span"
          aria-hidden
          sx={index === flickerIndex ? { animation: `${flicker} 4s linear infinite` } : undefined}
        >
          {letter}
        </Box>
      ))}
      <Box
        component="span"
        aria-hidden
        sx={{ color: '#fffbe0', textShadow: neonText(NEON.yellow, size === 'large' ? 1.4 : 0.8) }}
      >
        !
      </Box>
    </Typography>
  );
}
