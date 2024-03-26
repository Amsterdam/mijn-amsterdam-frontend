import { generatePath, useHistory, useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  addTitleLinkComponent,
  ErrorAlert,
  ChapterIcon,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  Pagination,
  SectionCollapsible,
  Table,
} from '../../components';
import {
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import { useAppStateGetter } from '../../hooks';
import type { Klacht } from '../../../server/services/klachten/types';
import styles from './Klachten.module.scss';

const DISPLAY_PROPS_KLACHTEN = {
  idAsLink: 'Nummer van uw klacht',
  ontvangstDatum: 'Ontvangen op',
  onderwerp: 'Onderwerp',
};

export const KLACHTEN_PAGE_SIZE = 20;

export default function Klachten() {
  const { KLACHTEN } = useAppStateGetter();
  const history = useHistory();
  const { page = '1' } = useParams<{
    page?: string;
  }>();

  const currentPage = (() => {
    if (!page) {
      return 1;
    }
    return parseInt(page, 10);
  })();

  const totalCount = KLACHTEN.content?.aantal || 0;

  const klachtenPaginated = (() => {
    const startIndex = currentPage - 1;
    const start = startIndex * KLACHTEN_PAGE_SIZE;
    const end = start + KLACHTEN_PAGE_SIZE;
    return KLACHTEN.content?.klachten.slice(start, end) || [];
  })();

  const items = klachtenPaginated.map((k) => ({
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
            href="https://www.amsterdam.nl/veelgevraagd/klacht-indienen-over-de-gemeente-42fd5#case_%7B9846AD0A-E989-4B5D-A1D3-6D79E34DF1BE%7D"
          >
            Meer informatie over de afhandeling van uw klacht
          </Linkd>
        </p>
        {isError(KLACHTEN) && (
          <ErrorAlert>
            We kunnen op dit moment geen klachten tonen.
          </ErrorAlert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-complaints"
        title="Ingediende klachten"
        noItemsMessage="U heeft nog geen klachten ingediend."
        startCollapsed={false}
        hasItems={!!klachten?.length}
        isLoading={isLoading(KLACHTEN)}
        className={styles.SectionCollapsibleFirst}
      >
        <Table items={klachten} displayProps={DISPLAY_PROPS_KLACHTEN} />
        {totalCount > KLACHTEN_PAGE_SIZE && (
          <Pagination
            className={styles.Pagination}
            totalCount={KLACHTEN.content?.aantal || 0}
            pageSize={KLACHTEN_PAGE_SIZE}
            currentPage={currentPage}
            onPageClick={(page) => {
              history.replace(
                generatePath(AppRoutes.KLACHTEN, {
                  page,
                })
              );
            }}
          />
        )}
      </SectionCollapsible>
    </OverviewPage>
  );
}
