import styles from './WelcomeHeading.module.scss';

const NOON = 12;
const EVENING = 18;
const NIGHT = 5;

export function WelcomeHeading() {
  const hours = new Date().getHours();
  const isMorning = hours < NOON && hours >= NIGHT;
  const isEvening = hours >= EVENING;
  const isNight = hours < NIGHT;
  const isAfternoon = hours >= NOON && hours < EVENING;

  let greetingMsg = 'Welkom';

  switch (true) {
    case isMorning:
      greetingMsg = 'Goedemorgen';
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

  return <h2 className={styles.WelcomeHeading}>{greetingMsg}</h2>;
}
