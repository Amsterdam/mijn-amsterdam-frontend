import { ReactNode } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';

import styles from './HLIThemaPagina.module.scss';
import { useHliThemaData } from './useHliThemaData';
import { HLIRegeling } from '../../../server/services/hli/hli-regelingen-types';
import { StadspasFrontend } from '../../../server/services/hli/stadspas-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { LinkProps } from '../../../universal/types/App.types';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import { PageContentCell } from '../../components/Page/Page';
import { DisplayProps } from '../../components/Table/TableV2';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function HistoricItemsMention() {
  return (
    <Paragraph className={styles.HistoricItemsMention}>
      U ziet hier niet alle gegevens uit het verleden. De gegevens die u hier
      niet ziet, heeft u eerder per post ontvangen.
    </Paragraph>
  );
}

type StadspasDisplayProps = {
  owner: ReactNode;
  actief: ReactNode;
};

type StadspassenProps = {
  stadspassen: StadspasFrontend[];
};

const displayProps: DisplayProps<StadspasDisplayProps> = {
  owner: '',
  actief: 'Status',
};

function Stadspassen({ stadspassen }: StadspassenProps) {
  const passen = stadspassen.map((pas) => {
    return {
      owner: (
        <MaRouterLink maVariant="fatNoUnderline" href={pas.link?.to}>
          <span
            className={styles.Stadspas_owner}
          >{`Stadspas van ${pas.owner.firstname}`}</span>
          {!!pas.balance && (
            <span className={styles.Stadspas_balance}>
              Saldo {pas.balanceFormatted}
            </span>
          )}
        </MaRouterLink>
      ),
      actief: (
        <span className={styles.StatusValue}>
          {pas.actief ? 'Actief' : 'Geblokkeerd'}
        </span>
      ),
    };
  });

  return (
    <PageContentCell>
      <ThemaPaginaTable<StadspasDisplayProps>
        displayProps={displayProps}
        zaken={passen}
        className={styles.Stadspassen}
      />

      {!!stadspassen?.length && (
        <Paragraph size="small">
          {stadspassen.length > 1 ? (
            <>
              Voor alle stadspassen geldt de einddatum van{' '}
              {stadspassen[0].dateEndFormatted}
            </>
          ) : (
            <>
              De stadspas heeft een einddatum van{' '}
              {stadspassen[0].dateEndFormatted}
            </>
          )}
        </Paragraph>
      )}
    </PageContentCell>
  );
}

export function HLIThemaPagina() {
  const {
    hasKindtegoed,
    isError,
    isLoading,
    regelingen,
    title,
    routes,
    tableConfig,
    dependencyError,
    stadspassen,
  } = useHliThemaData();

  const pageContentTop = (
    <Paragraph>
      Hieronder ziet u al uw regelingen. Indien u of uw kinderen in bezit zijn
      van een Stadspas ziet u ook de stadspasgegevens.
    </Paragraph>
  );

  const linkListItems: LinkProps[] = [
    {
      to: 'https://www.amsterdam.nl/werk-inkomen/hulp-bij-laag-inkomen/',
      title: 'Meer informatie over regelingen',
    },
    {
      to: 'https://www.amsterdam.nl/stadspas',
      title: 'Meer informatie over Stadspas',
    },
  ];

  if (hasKindtegoed) {
    linkListItems.push({
      to: 'https://www.amsterdam.nl/stadspas/kindtegoed/kosten-terugvragen/',
      title: 'Meer informatie over Kindtegoed declareren',
    });
  }

  const regelingenTables = FeatureToggle.hliThemaRegelingenActive
    ? Object.entries(tableConfig).map(
        ([
          kind,
          {
            title,
            displayProps,
            filter: regelingenListFilter,
            sort: regelingenListSort,
            maxItems,
            className,
            textNoContent,
          },
        ]) => {
          return (
            <ThemaPaginaTable<HLIRegeling>
              key={kind}
              title={title}
              className={className}
              zaken={regelingen
                .filter(regelingenListFilter)
                .sort(regelingenListSort)}
              listPageRoute={generatePath(routes.listPage, {
                kind,
              })}
              displayProps={displayProps}
              textNoContent={textNoContent}
              maxItems={maxItems}
            />
          );
        }
      )
    : [];

  return (
    <>
      <ThemaPagina
        title={title}
        pageContentTop={pageContentTop}
        linkListItems={linkListItems}
        pageContentMain={
          <>
            {!!stadspassen?.length && <Stadspassen stadspassen={stadspassen} />}
            {!!regelingen?.length && regelingenTables}
          </>
        }
        isError={isError}
        errorAlertContent={dependencyError}
        isPartialError={!!dependencyError}
        isLoading={isLoading}
      />
      <HistoricItemsMention />
    </>
  );
}
