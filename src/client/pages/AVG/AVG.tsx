import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { defaultDateFormat, isLoading } from '../../../universal/helpers';
import {
  addTitleLinkComponent,
  ChapterIcon,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { useAppStateGetter } from '../../hooks';
import styles from './AVG.module.scss';

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
        icon={<ChapterIcon />}
      >
        {ChapterTitles.AVG}
      </PageHeading>
      <PageContent>
        <p>Hier ziet u een overzicht van uw ingediende AVG verzoeken.</p>
        <p>
          <Linkd external={true} href="https://www.amsterdam.nl/privacy/loket/">
            Loket persoonsgegevens gemeente Amsterdam
          </Linkd>
        </p>
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
        noItemsMessage="U hebt nog geen afgehandelde AVG verzoeken."
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
