import { Heading } from '@amsterdam/design-system-react';

import styles from './WelcomeHeading.module.scss';
import { ProfileName } from '../../components/MainHeader/ProfileName';
import { PageContentCell } from '../../components/Page/Page';

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
    <PageContentCell
      startWide={1}
      spanWide={7}
      className={styles.WelcomeHeadingWrap}
    >
      <div className={styles.WelcomeHeadingSizer} id="skip-to-id-AppContent">
        <div>
          <Heading className={styles.WelcomeHeading} level={3} size="level-1">
            {hello}{' '}
            <span className={styles.ProfileNameWrap}>
              <ProfileName
                fallbackName="Bezoeker"
                loaderBarConfig={[['400px', '40px', '0']]}
              />
            </span>
          </Heading>
        </div>
      </div>
    </PageContentCell>
  );
}
