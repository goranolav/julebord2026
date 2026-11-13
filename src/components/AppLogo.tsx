import { Box, Typography } from '@mui/material';
import { no } from '../i18n/no';
import { useAppearance } from '../styles/appearanceMode';
import { flicker, NEON, neonText } from '../styles/neon';

interface AppLogoProps {
  size?: 'large' | 'small';
}

/** "JEOPARDY!" – neon tubes, or a festive serif with a gold star in Christmas mode. */
export default function AppLogo({ size = 'large' }: AppLogoProps) {
  const appearance = useAppearance();
  return appearance.id === 'christmas' ? <ChristmasLogo size={size} /> : <NeonLogo size={size} />;
}

const WORD = 'JEOPARDY';

function NeonLogo({ size = 'large' }: AppLogoProps) {
  const { fonts } = useAppearance();
  const flickerIndex = 3;
  const large = size === 'large';

  return (
    <Typography
      component="div"
      role="img"
      aria-label={no.logo.neon}
      sx={{
        fontFamily: fonts.display,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: '0.08em',
        color: '#ffe8fb',
        textShadow: neonText(NEON.magenta, large ? 1.4 : 0.6),
        fontSize: large ? { xs: '2.6rem', sm: '4.5rem', md: '6.5rem' } : '1.5rem',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {WORD.split('').map((letter, index) => (
        <Box
          key={index}
          component="span"
          aria-hidden
          sx={index === flickerIndex ? { animation: `${flicker} 4s linear infinite` } : undefined}
        >
          {letter}
        </Box>
      ))}
      <Box component="span" aria-hidden sx={{ color: '#fffbe0', textShadow: neonText(NEON.yellow, large ? 1.4 : 0.6) }}>
        !
      </Box>
    </Typography>
  );
}

function Star({ size }: { size: string }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      sx={{ width: size, height: size, display: 'block', filter: 'drop-shadow(0 0 6px rgba(242,193,78,0.8))' }}
    >
      <path
        d="M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6 5.6 21.1 7 14l-5.3-5 7.2-.9z"
        fill="#f2c14e"
        stroke="#fff3c4"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </Box>
  );
}

function ChristmasLogo({ size = 'large' }: AppLogoProps) {
  const { fonts, colors, glowText } = useAppearance();
  const large = size === 'large';

  return (
    <Typography
      component="div"
      role="img"
      aria-label={no.logo.christmas}
      sx={{
        fontFamily: fonts.display,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: '0.04em',
        color: colors.strong,
        textShadow: `0 3px 0 ${colors.secondary}, ${glowText(colors.gold, large ? 1.2 : 0.5)}`,
        fontSize: large ? { xs: '2.8rem', sm: '4.8rem', md: '6.8rem' } : '1.6rem',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'flex-end',
      }}
    >
      {/* Star sits on top of the J, like on a Christmas tree. */}
      <Box component="span" aria-hidden sx={{ position: 'relative', display: 'inline-block' }}>
        <Box
          component="span"
          sx={{ position: 'absolute', left: '50%', top: '-0.42em', transform: 'translateX(-50%)' }}
        >
          <Star size={large ? '0.55em' : '0.6em'} />
        </Box>
        J
      </Box>
      <Box component="span" aria-hidden>
        {WORD.slice(1)}
      </Box>
      <Box component="span" aria-hidden sx={{ color: colors.gold }}>
        !
      </Box>
    </Typography>
  );
}
