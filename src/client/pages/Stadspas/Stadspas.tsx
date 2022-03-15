import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { dateSort, isError, isLoading } from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { StatusLine } from '../../../universal/types';
import {
  addTitleLinkComponent,
  Alert,
  ChapterIcon,
  Linkd,
  MaintenanceNotifications,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { LinkdInline } from '../../components/Button/Button';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './Stadspas.module.scss';

const stadspasDisplayProps = {
  owner: '',
  passNumber: 'Stadspasnummer',
  displayDateEnd: 'Einddatum',
  detailPageUrl: 'Tegoed',
};

const requestsDisplayProps = {
  displayDateStart: 'Datum aanvraag',
  status: 'Status',
};

const decisionsDisplayProps = {
  displayDateStart: 'Datum aanvraag',
  displayDateEnd: 'Datum besluit',
};

export default function Stadspas() {
  const { WPI_STADSPAS } = useAppStateGetter();
  const aanvragen = WPI_STADSPAS.content?.aanvragen;

  const items: StatusLine[] = useMemo(() => {
    if (!aanvragen) {
      return [];
    }
    return addTitleLinkComponent(
      aanvragen
        .map((item) => {
          return Object.assign({}, item, {
            displayDateEnd: defaultDateFormat(
              item.dateEnd || item.datePublished
            ),
            displayDateStart: defaultDateFormat(item.dateStart),
          });
        })
        .sort(dateSort('datePublished', 'desc'))
    );
  }, [aanvragen]);

  const itemsRequested = items.filter((item) => item.status !== 'Besluit');
  const itemsDecided = items.filter((item) => item.status === 'Besluit');

  const hasActiveRequests = !!itemsRequested.length;
  const hasActiveDescisions = !!itemsDecided.length;
  const hasStadspas = !!WPI_STADSPAS?.content?.stadspassen?.length;

  const stadspasItems = useMemo(() => {
    if (!WPI_STADSPAS.content?.stadspassen) {
      return [];
    }
    return WPI_STADSPAS.content.stadspassen.map((stadspas) => {
      return {
        ...stadspas,
        displayDateEnd: defaultDateFormat(stadspas.dateEnd),
        detailPageUrl: !!stadspas.budgets.length && (
          <LinkdInline
            href={generatePath(AppRoutes['STADSPAS/SALDO'], {
              id: stadspas.id,
            })}
          >
            Bekijk saldo
          </LinkdInline>
        ),
        owner:
          stadspas.passType === 'kind'
            ? `${stadspas.owner} &nbsp;&nbsp;(${stadspas.passType})`
            : stadspas.owner,
      };
    });
  }, [WPI_STADSPAS.content]);

  const isLoadingStadspas = isLoading(WPI_STADSPAS);

  return (
    <OverviewPage className={styles.Stadspas}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={false}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.STADSPAS}
      </PageHeading>
      <PageContent>
        <p>Hieronder vindt u meer informatie over uw eigen Stadspas.</p>
        {!isLoadingStadspas && WPI_STADSPAS.content?.ownerType !== 'kind' && (
          <p>
            Hebt u kinderen of een partner met een Stadspas? Dan ziet u
            hieronder ook hun Stadspassen.
          </p>
        )}
        <p>
          <Linkd external={true} href={ExternalUrls.STADSPAS}>
            Meer informatie over de Stadspas
          </Linkd>
        </p>
        <MaintenanceNotifications page="stadspas" />
        {isError(WPI_STADSPAS) && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>

      {hasStadspas && (
        <SectionCollapsible
          id="SectionCollapsible-stadpas"
          title="Stadspas"
          startCollapsed={false}
          isLoading={isLoadingStadspas}
          hasItems={hasStadspas}
          track={{
            category: 'Stadspas overzicht / Stadpas',
            name: 'Datatabel',
          }}
          className={styles.SectionCollapsibleFirst}
        >
          <Table
            titleKey="moreDetail"
            items={stadspasItems}
            displayProps={stadspasDisplayProps}
            className={styles.Table}
          />
        </SectionCollapsible>
      )}

      <SectionCollapsible
        id="SectionCollapsible-stadspas-request-process"
        title="Lopende aanvragen"
        startCollapsed={hasStadspas}
        isLoading={isLoadingStadspas}
        hasItems={hasActiveRequests}
        track={{
          category: 'Stadspas overzicht / Lopende aanvragen',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen lopende aanvragen."
        className={styles.SectionCollapsible}
      >
        <Table
          items={itemsRequested}
          displayProps={requestsDisplayProps}
          className={styles.Table}
        />
      </SectionCollapsible>

      <SectionCollapsible
        id="SectionCollapsible-stadspas-request-process-decisions"
        startCollapsed={true}
        isLoading={isLoadingStadspas}
        hasItems={hasActiveDescisions}
        title="Eerdere aanvragen"
        track={{
          category: 'Stadspas overzicht / Eerdere aanvragen',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen eerdere aanvragen."
      >
        <Table
          items={itemsDecided}
          displayProps={decisionsDisplayProps}
          className={styles.Table}
        />
      </SectionCollapsible>
    </OverviewPage>
  );
}
