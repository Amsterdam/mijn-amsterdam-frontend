import styles from './WelcomeHeading.module.scss';
import { useAppStateGetter } from '../../hooks/useAppStateStore.ts';

const NOON = 12;
const EVENING = 18;
const NIGHT = 5;

export function WelcomeHeading() {
  const { BRP } = useAppStateGetter();
  const aanschrijfwijze = BRP.content?.persoon?.aanschrijfwijze;
  const hours = new Date().getHours();
  const isMorning = hours < NOON && hours >= NIGHT;
  const isEvening = hours >= EVENING;
  const isNight = hours < NIGHT;
  const isAfternoon = hours >= NOON && hours < EVENING;

  let greetingMsg = 'Welkom';

  switch (true) {
    case isMorning:
      greetingMsg = `Goedemorgen`;
      break;
    case isAfternoon:
      greetingMsg = 'Goedemiddag';
      break;
    case isEvening:
      greetingMsg = 'Goedenavond';
      break;
    case isNight:
      greetingMsg = 'Goedenacht';
      break;
  }
  if (aanschrijfwijze) {
    greetingMsg += ` ${aanschrijfwijze}`;
  }
  return <span className={styles.WelcomeHeading}>{greetingMsg}</span>;
}
