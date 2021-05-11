import { AppRoutes, ChapterTitles } from '../../../universal/config/index';
import {
  ChapterIcon,
  InfoDetail,
  Linkd,
  Page,
  PageContent,
  PageHeading,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './ToeristischeVerhuur.module.scss';

export default function ToeristischeVerhuur() {
  const {
    TOERISTISCHE_VERHUUR: { content },
  } = useAppStateGetter();

  return (
    <Page className={styles.ToeristischeVerhuur}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.TOERISTISCHE_VERHUUR}
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
        {content?.registraties?.map((infoItem, index) => (
          <article key={infoItem.registrationNumber}>
            <InfoDetail
              label={'Landelijk registratienummer toeristische verhuur'}
              value={infoItem.registrationNumber}
            />
            <InfoDetail
              label={'Adres verhuurde woning'}
              value={
                <>
                  {infoItem.street} {infoItem.houseNumber}
                  {infoItem.houseLetter}
                  {infoItem.houseNumberExtension}
                  <br />
                  {infoItem.postalCode} {infoItem.city}
                </>
              }
            />
          </article>
        ))}
      </PageContent>
    </Page>
  );
}
