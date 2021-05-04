import {
  Page,
  PageContent,
  PageHeading,
  Panel,
  Heading,
} from '../../components';
import classnames from 'classnames';
import styles from './Toerisme.module.scss';
import { AppRoutes, ChapterTitles } from '../../../universal/config/index';
import { ChapterIcon, Linkd } from '../../components';

import { useAppStateGetter } from '../../hooks/useAppState';

export default function Toerisme() {
  const { TOERISME } = useAppStateGetter();
  // Wait for design to show multiple instances for now we take the first in array
  const info = TOERISME?.content?.[0];
  return (
    <Page className={styles.Toerisme}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.TOERISME}
      </PageHeading>
      <PageContent>
        <p>
          Hieronder vind u een overzicht van uw aanvragen voor toeristische
          verhuur
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/"
          >
            Meer informatie over regels voor Particuliere vakantieverhuur
          </Linkd>
          <br />
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BF5FE8785-9B65-443F-9AA7-FD814372C7C2%7D"
          >
            Meer over toeristenbelasting
          </Linkd>
        </p>
        {info && (
          <Panel className={classnames(styles.Panel)}>
            <Heading size="tiny">
              Landelijk registratienummer toeristisch verhuur
            </Heading>
            {info.registrationNumber && <p>{info.registrationNumber}</p>}

            <Heading size="tiny">Adres verhuurde woning</Heading>
            <p>
              {info.street} {info.houseNumber}
              {info.houseLetter}
              {info.houseNumberExtension}
              <br />
              {info.postalCode} {info.city}
            </p>
          </Panel>
        )}
      </PageContent>
    </Page>
  );
}
