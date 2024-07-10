import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import { Stadspas } from '../../../server/services/hli/stadspas-types';
import { AppRoutes } from '../../../universal/config';
import { ThemaTitles } from '../../config/thema';
import { isError, isLoading } from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  ThemaIcon,
  ErrorAlert,
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

function hasMultipleOwners(stadspassen: Stadspas[] | undefined) {
  if (stadspassen === undefined) {
    return false;
  }

  return stadspassen.some((pas) => pas.owner !== stadspassen[0].owner);
}

export default function CStadspas() {
  const { STADSPAS } = useAppStateGetter();
  const aanvragen = STADSPAS.content?.aanvragen;
  const hasStadspas = !!STADSPAS?.content?.stadspassen?.length;

  const stadspasItems = useMemo(() => {
    if (!STADSPAS.content?.stadspassen) {
      return [];
    }
    return STADSPAS.content.stadspassen.map((stadspas) => {
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
        owner: stadspas.owner,
      };
    });
  }, [STADSPAS.content]);

  const isLoadingStadspas = isLoading(STADSPAS);

  return (
    <OverviewPage className={styles.Stadspas}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={false}
        icon={<ThemaIcon />}
      >
        {ThemaTitles.STADSPAS}
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
          hasMultipleOwners(STADSPAS.content?.stadspassen) && (
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
        {isError(STADSPAS) && (
          <ErrorAlert>
            We kunnen op dit moment niet alle gegevens tonen.
          </ErrorAlert>
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
    </OverviewPage>
  );
}
