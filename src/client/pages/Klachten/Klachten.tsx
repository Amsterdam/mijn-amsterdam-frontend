import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  addTitleLinkComponent,
  Alert,
  ChapterIcon,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import {
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import { useAppStateGetter } from '../../hooks';
import { Klacht } from '../../../server/services/klachten/types';
import styles from './Klachten.module.scss';

const DISPLAY_PROPS_KLACHTEN = {
  idAsLink: 'Nummer van uw klacht',
  ontvangstDatum: 'Ontvangen op',
  onderwerp: 'Onderwerp',
};

export default function Klachten() {
  const { KLACHTEN } = useAppStateGetter();

  const items = KLACHTEN.content?.klachten.map((k) => ({
    ...k,
    idAsLink: k.id,
    ontvangstDatum: defaultDateFormat(k.ontvangstDatum),
  }));

  const klachten = items
    ? (addTitleLinkComponent(items, 'idAsLink') as Klacht[])
    : [];

  return (
    <OverviewPage className={styles.Klachten}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(KLACHTEN)}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.KLACHTEN}
      </PageHeading>
      <PageContent>
        <p>
          Hier ziet u een overzicht van de klachten die u hebt ingediend bij
          gemeente Amsterdam.
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/veelgevraagd/?productid=%7B249D3A8E-ED07-4E4C-BFAD-49F174342FD5%7D#case_%7B9846AD0A-E989-4B5D-A1D3-6D79E34DF1BE%7D"
          >
            Meer informatie over de afhandeling van uw klacht
          </Linkd>
        </p>
        {isError(KLACHTEN) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen klachten tonen.</p>
          </Alert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Ingediende klachten"
        noItemsMessage="U heeft nog geen klachten ingediend."
        startCollapsed={false}
        hasItems={!!klachten?.length}
        isLoading={isLoading(KLACHTEN)}
        track={{
          category: 'Klachten overzicht',
          name: 'Datatabel',
        }}
        className={styles.SectionCollapsibleFirst}
      >
        <Table items={klachten} displayProps={DISPLAY_PROPS_KLACHTEN} />
      </SectionCollapsible>
    </OverviewPage>
  );
}
