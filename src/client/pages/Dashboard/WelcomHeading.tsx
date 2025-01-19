import styles from './WelcomeHeading.module.scss';
import { ProfileName } from '../../components/MainHeader/ProfileName';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';

const HELLO = 'Welkom,';
const NOON = 12;
const EVENING = 18;
const NIGHT = 5;

export function WelcomeHeading() {
  const hours = new Date().getHours();
  const isMorning = hours < NOON && hours >= NIGHT;
  const isEvening = hours >= EVENING;
  const isNight = hours < NIGHT;
  const isAfternoon = hours >= NOON && hours < EVENING;

  let hello = HELLO;

  switch (true) {
    case isMorning:
      hello = 'Goedemorgen,';
      break;
    case isAfternoon:
      hello = 'Goedemiddag,';
      break;
    case isEvening:
      hello = 'Goedenavond,';
      break;
    case isNight:
      hello = 'Goedenacht,';
      break;
  }

  return (
    <PageHeadingV2 showBacklink={false}>
      {hello}{' '}
      <span className={styles.ProfileNameWrap}>
        <ProfileName />
      </span>
    </PageHeadingV2>
  );
}
