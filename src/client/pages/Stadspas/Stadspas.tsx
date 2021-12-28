import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import type { FocusItem } from '../../../server/services/focus/focus-types';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { dateSort, isError, isLoading } from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
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
  MaintenanceNotifications,
} from '../../components';
import { LinkdInline } from '../../components/Button/Button';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './Stadspas.module.scss';

const stadspasDisplayProps = {
  naam: '',
  pasnummer: 'Stadspasnummer',
  displayDatumAfloop: 'Einddatum',
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
  const { FOCUS_AANVRAGEN, FOCUS_STADSPAS } = useAppStateGetter();
  const aanvragen = FOCUS_AANVRAGEN.content;

  const items: FocusItem[] = useMemo(() => {
    if (!aanvragen) {
      return [];
    }
    return addTitleLinkComponent(
      aanvragen
        .filter((aanvraag) => aanvraag.productTitle === 'Stadspas')
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
  const hasStadspas = !!FOCUS_STADSPAS?.content?.stadspassen?.length;

  const stadspasItems = useMemo(() => {
    if (!FOCUS_STADSPAS.content?.stadspassen) {
      return [];
    }
    return FOCUS_STADSPAS.content.stadspassen.map((stadspas) => {
      return {
        ...stadspas,
        displayDatumAfloop: defaultDateFormat(stadspas.datumAfloop),
        detailPageUrl: !!stadspas.budgets.length && (
          <LinkdInline
            href={generatePath(AppRoutes['STADSPAS/SALDO'], {
              id: stadspas.id,
            })}
          >
            Bekijk saldo
          </LinkdInline>
        ),
      };
    });
  }, [FOCUS_STADSPAS.content]);

  const isLoadingFocus = isLoading(FOCUS_AANVRAGEN);
  const isLoadingStadspas = isLoading(FOCUS_STADSPAS);

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
        {!isLoadingStadspas && FOCUS_STADSPAS.content?.type !== 'kind' && (
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
        {(isError(FOCUS_AANVRAGEN) || isError(FOCUS_STADSPAS)) && (
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
        isLoading={isLoadingFocus}
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
        isLoading={isLoadingFocus}
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
