import { IconButton, Tooltip } from '@mui/material';
import ParkIcon from '@mui/icons-material/Park';
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined';
import { no } from '../i18n/no';
import { useAppearance, useChristmasMode } from '../styles/appearanceMode';

export default function ChristmasToggle() {
  const [enabled, setEnabled] = useChristmasMode();
  const { colors } = useAppearance();
  const label = enabled ? no.christmas.off : no.christmas.on;
  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        aria-pressed={enabled}
        onClick={() => setEnabled(!enabled)}
        sx={{ color: enabled ? colors.success : 'text.secondary' }}
      >
        {enabled ? <ParkIcon /> : <ParkOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
}
