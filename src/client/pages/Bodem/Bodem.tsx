import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import {
 ErrorAlert,
  ChapterIcon,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  addTitleLinkComponent,
} from '../../components';
import { useAppStateGetter } from '../../hooks';

const DISPLAY_PROPS_BODEM = {
  adres: 'Adres',
  datumAanvraag: 'Aangevraagd',
  status: 'Status',
};

export default function Bodem() {
  const { BODEM } = useAppStateGetter();

  const loodMetingen = (BODEM.content?.metingen || []).map((meting) => {
    return {
      ...meting,
      datumAanvraag: defaultDateFormat(meting.datumAanvraag),
    };
  });
  const items = addTitleLinkComponent(loodMetingen, 'adres');

  const lopendeAanvragen = items.filter(
    (meting) => meting.status !== 'Afgehandeld' && meting.status !== 'Afgewezen'
  );
  const afgerondeAanvragen = items.filter(
    (meting) => meting.status === 'Afgehandeld' || meting.status === 'Afgewezen'
  );

  return (
    <OverviewPage className="">
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(BODEM)}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.BODEM}
      </PageHeading>
      <PageContent>
        <p>Op deze pagina vindt u informatie over uw lood in de bodem-check.</p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/wonen-leefomgeving/bodem/lood-grond/"
          >
            Meer informatie over lood in de bodem.
          </Linkd>
        </p>
        {isError(BODEM) && (
          <ErrorAlert>
            We kunnen op dit moment geen loodmetingen tonen.
          </ErrorAlert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Lopende aanvragen"
        noItemsMessage="U heeft nog geen loodmetingen aangevraagd."
        startCollapsed={false}
        hasItems={!!lopendeAanvragen?.length}
        isLoading={isLoading(BODEM)}
      >
        <Table items={lopendeAanvragen} displayProps={DISPLAY_PROPS_BODEM} />
      </SectionCollapsible>

      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Eerdere aanvragen"
        noItemsMessage="U hebt geen eerdere aanvragen."
        startCollapsed={false}
        hasItems={!!afgerondeAanvragen?.length}
        isLoading={isLoading(BODEM)}
      >
        <Table items={afgerondeAanvragen} displayProps={DISPLAY_PROPS_BODEM} />
      </SectionCollapsible>
    </OverviewPage>
  );
}
