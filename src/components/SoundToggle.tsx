import { IconButton, Tooltip } from '@mui/material';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { no } from '../i18n/no';
import { useSoundEnabled } from '../audio/soundSettings';
import { NEON } from '../styles/neon';

export default function SoundToggle() {
  const [enabled, setEnabled] = useSoundEnabled();
  const label = enabled ? no.sound.mute : no.sound.unmute;
  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        aria-pressed={!enabled}
        onClick={() => setEnabled(!enabled)}
        sx={{ color: enabled ? NEON.cyan : 'text.secondary' }}
      >
        {enabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
      </IconButton>
    </Tooltip>
  );
}
