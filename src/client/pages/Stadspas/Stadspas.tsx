import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import type { WpiStadspas } from '../../../server/services/wpi/wpi-types';
import {
  AppRoutes,
  ChapterTitles,
  FeatureToggle,
} from '../../../universal/config';
import { dateSort, isError, isLoading } from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  Alert,
  ChapterIcon,
  Linkd,
  MaintenanceNotifications,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  addTitleLinkComponent,
} from '../../components';
import { LinkdInline } from '../../components/Button/Button';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import { REQUEST_PROCESS_COMPLETED_STATUS_IDS } from '../Inkomen/Inkomen';
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

function multipleOwners(stadspassen: WpiStadspas[] | undefined) {
  if (stadspassen === undefined) {
    return false;
  }

  return stadspassen.some((pas) => pas.owner !== stadspassen[0].owner);
}

export default function Stadspas() {
  const { WPI_STADSPAS } = useAppStateGetter();
  const aanvragen = WPI_STADSPAS.content?.aanvragen;

  const items = useMemo(() => {
    if (!aanvragen) {
      return [];
    }
    return addTitleLinkComponent(
      aanvragen
        .map((item) => {
          const activeStatusStep = item.steps.find(
            (step) => step.id === item.statusId
          );
          return Object.assign({}, item, {
            displayDateEnd: defaultDateFormat(
              item.dateEnd || item.datePublished
            ),
            displayDateStart: defaultDateFormat(item.dateStart),
            status: activeStatusStep?.status.replace(/-\s/g, '') || '', // Compensate for pre-broken words like Terugvorderings- besluit.
          });
        })
        .sort(dateSort('datePublished', 'desc'))
    );
  }, [aanvragen]);

  const itemsRequested = items.filter(
    (item) => !REQUEST_PROCESS_COMPLETED_STATUS_IDS.includes(item.statusId)
  );
  const itemsCompleted = items.filter((item) =>
    REQUEST_PROCESS_COMPLETED_STATUS_IDS.includes(item.statusId)
  );

  const hasActiveRequests = !!itemsRequested.length;
  const hasActiveDescisions = !!itemsCompleted.length;
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
        <h4>Hoe weet ik of ik een geldige Stadspas heb?</h4>
        <p>
          Hieronder staat het Stadspasnummer van uw actieve pas. Dit pasnummer
          staat ook op de achterkant van uw pas.
        </p>
        <p>
          Bel <a href="tel:020 252 6000">020 252 6000</a> om een nieuwe Stadspas
          aan te vragen.
        </p>
        {!isLoadingStadspas &&
          multipleOwners(WPI_STADSPAS.content?.stadspassen) && (
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
          <Alert>We kunnen op dit moment niet alle gegevens tonen.</Alert>
        )}
      </PageContent>

      {hasStadspas && (
        <SectionCollapsible
          id="SectionCollapsible-stadpas"
          title="Stadspas"
          startCollapsed={false}
          isLoading={isLoadingStadspas}
          hasItems={hasStadspas}
          className={styles.SectionCollapsibleFirst}
        >
          <Table
            items={stadspasItems}
            displayProps={stadspasDisplayProps}
            className={styles.Table}
          />
        </SectionCollapsible>
      )}

      {FeatureToggle.stadspasRequestsActive && (
        <>
          <SectionCollapsible
            id="SectionCollapsible-stadspas-request-process"
            title="Lopende aanvragen"
            startCollapsed={hasStadspas}
            isLoading={isLoadingStadspas}
            hasItems={hasActiveRequests}
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
            noItemsMessage="U hebt op dit moment geen eerdere aanvragen."
          >
            <Table
              items={itemsCompleted}
              displayProps={decisionsDisplayProps}
              className={styles.Table}
            />
          </SectionCollapsible>
        </>
      )}
    </OverviewPage>
  );
}
