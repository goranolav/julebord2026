import { IconButton, Tooltip } from '@mui/material';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { no } from '../i18n/no';
import { useSoundEnabled } from '../audio/soundSettings';
import { useAppearance } from '../styles/appearanceMode';

export default function SoundToggle() {
  const [enabled, setEnabled] = useSoundEnabled();
  const { colors } = useAppearance();
  const label = enabled ? no.sound.mute : no.sound.unmute;
  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        aria-pressed={!enabled}
        onClick={() => setEnabled(!enabled)}
        sx={{ color: enabled ? colors.primary : 'text.secondary' }}
      >
        {enabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
      </IconButton>
    </Tooltip>
  );
}
