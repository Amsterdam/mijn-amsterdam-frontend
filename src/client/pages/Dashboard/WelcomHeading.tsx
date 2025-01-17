import { Grid, Heading } from '@amsterdam/design-system-react';

import styles from './WelcomeHeading.module.scss';
import { ProfileName } from '../../components/MainHeader/ProfileName';

const HELLO = 'Welkom,';

export function WelcomeHeading() {
  return (
    <Grid.Cell span={7} className={styles.Welcome}>
      <Heading className={styles.WelcomeHeading} level={3}>
        {HELLO}
        <br /> <ProfileName />
      </Heading>
    </Grid.Cell>
  );
}
