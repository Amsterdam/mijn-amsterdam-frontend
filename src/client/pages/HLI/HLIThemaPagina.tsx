import { ReactNode } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';

import styles from './HLIThemaPagina.module.scss';
import { useHliThemaData } from './useHliThemaData';
import { HLIRegeling } from '../../../server/services/hli/hli-regelingen-types';
import { StadspasFrontend } from '../../../server/services/hli/stadspas-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import { PageContentCell } from '../../components/Page/Page';
import { ParagaphSuppressed } from '../../components/ParagraphSuppressed/ParagraphSuppressed';
import { DisplayProps } from '../../components/Table/TableV2';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function HistoricItemsMention() {
  return (
    <ParagaphSuppressed>
      U ziet hier niet alle gegevens uit het verleden. De gegevens die u hier
      niet ziet, heeft u eerder per post ontvangen.
    </ParagaphSuppressed>
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
    tableConfig,
    dependencyError,
    stadspassen,
    linkListItems,
  } = useHliThemaData();

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph>
        Hieronder ziet u al uw regelingen. Indien u of uw kinderen in bezit zijn
        van een Stadspas ziet u ook de stadspasgegevens.
      </Paragraph>
    </PageContentCell>
  );

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
            listPageRoute,
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
              listPageRoute={listPageRoute}
              displayProps={displayProps}
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
            <PageContentCell startWide={3} spanWide={8}>
              <HistoricItemsMention />
            </PageContentCell>
          </>
        }
        isError={isError}
        errorAlertContent={dependencyError}
        isPartialError={!!dependencyError}
        isLoading={isLoading}
      />
    </>
  );
}
