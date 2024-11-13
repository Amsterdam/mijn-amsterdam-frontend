import { Link } from '@amsterdam/design-system-react';

import styles from './AVG.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  ErrorAlert,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  ThemaIcon,
  addTitleLinkComponent,
} from '../../components';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

const DISPLAY_PROPS_AVG = {
  idAsLink: 'Nummer',
  ontvangstDatum: 'Ontvangen op',
  themaString: 'Onderwerp',
};

const AVG = () => {
  const { AVG } = useAppStateGetter();

  const avgVerzoeken = AVG.content?.verzoeken?.map((avgVerzoek) => ({
    ...avgVerzoek,

    ontvangstDatum: defaultDateFormat(avgVerzoek.ontvangstDatum),
    idAsLink: avgVerzoek.id,
    themaString: avgVerzoek.themas.join(', '),
  }));

  const avgVerzoekenLopend = avgVerzoeken
    ? addTitleLinkComponent(
        avgVerzoeken.filter((avgVerzoek) => avgVerzoek.datumAfhandeling === ''),
        'idAsLink'
      )
    : [];
  const avgVerzoekenAfgehandeld = avgVerzoeken
    ? addTitleLinkComponent(
        avgVerzoeken.filter((avgVerzoek) => avgVerzoek.datumAfhandeling !== ''),
        'idAsLink'
      )
    : [];

  return (
    <OverviewPage className={styles.AVG}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(AVG)}
        icon={<ThemaIcon />}
      >
        {ThemaTitles.AVG}
      </PageHeading>
      <PageContent>
        <p>Hier ziet u een overzicht van uw ingediende AVG verzoeken.</p>
        <p>
          <Link href="https://www.amsterdam.nl/privacy/loket/">
            Loket persoonsgegevens gemeente Amsterdam
          </Link>
        </p>
        {isError(AVG) && (
          <ErrorAlert>
            We kunnen op dit moment geen AVG verzoeken tonen.
          </ErrorAlert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Lopende verzoeken"
        noItemsMessage="U heeft nog geen AVG verzoeken ingediend."
        startCollapsed={false}
        hasItems={!!avgVerzoekenLopend?.length}
        isLoading={isLoading(AVG)}
        className={styles.SectionCollapsibleFirst}
      >
        <Table items={avgVerzoekenLopend} displayProps={DISPLAY_PROPS_AVG} />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Afgehandelde verzoeken"
        noItemsMessage="U heeft nog geen afgehandelde AVG verzoeken."
        startCollapsed={false}
        hasItems={!!avgVerzoekenAfgehandeld?.length}
        isLoading={isLoading(AVG)}
      >
        <Table
          items={avgVerzoekenAfgehandeld}
          displayProps={DISPLAY_PROPS_AVG}
        />
      </SectionCollapsible>
    </OverviewPage>
  );
};

export default AVG;
