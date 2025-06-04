import styles from './WelcomeHeading.module.scss';
import { ProfileName } from '../../components/MainHeader/ProfileName';

const NOON = 12;
const EVENING = 18;
const NIGHT = 5;

export function WelcomeHeading() {
  const hours = new Date().getHours();
  const isMorning = hours < NOON && hours >= NIGHT;
  const isEvening = hours >= EVENING;
  const isNight = hours < NIGHT;
  const isAfternoon = hours >= NOON && hours < EVENING;

  let greetingMsgStart = 'Welkom,';

  switch (true) {
    case isMorning:
      greetingMsgStart = 'Goedemorgen,';
      break;
    case isAfternoon:
      greetingMsgStart = 'Goedemiddag,';
      break;
    case isEvening:
      greetingMsgStart = 'Goedenavond,';
      break;
    case isNight:
      greetingMsgStart = 'Goedenacht,';
      break;
  }

  return (
    <h2 className={styles.WelcomeHeading}>
      {greetingMsgStart}{' '}
      <ProfileName
        fallbackName="Bezoeker"
        loaderBarConfig={[['400px', '40px', '0']]}
        preferVoornaam
      />
    </h2>
  );
}
