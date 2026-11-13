import { useAppearance } from '../styles/appearanceMode';
import NeonBackground from './NeonBackground';
import Snowfall from './Snowfall';

/** Decorative background for the active theme. */
export default function AppBackground() {
  const appearance = useAppearance();
  return appearance.id === 'christmas' ? <Snowfall /> : <NeonBackground />;
}
