import { ReactNode } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';

import { featureToggle, listPageParamKind } from './HLI-thema-config';
import styles from './HLIThema.module.scss';
import { useHliThemaData } from './useHliThemaData';
import { HLIRegelingFrontend } from '../../../../server/services/hli/hli-regelingen-types';
import { type StadspasResponseFrontend } from '../../../../server/services/hli/stadspas-types';
import { entries } from '../../../../universal/helpers/utils';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../components/Page/Page';
import { ParagaphSuppressed } from '../../../components/ParagraphSuppressed/ParagraphSuppressed';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

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

const displayProps: DisplayProps<StadspasDisplayProps> = {
  owner: '',
  actief: 'Status',
};

function Stadspassen({
  stadspassen,
  dateExpiryFormatted,
}: StadspasResponseFrontend) {
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

      {!!stadspassen?.length && dateExpiryFormatted && (
        <Paragraph size="small">
          Het huidige stadspasjaar eindigt op {dateExpiryFormatted}.
        </Paragraph>
      )}
    </PageContentCell>
  );
}

export function HLIThema() {
  const {
    isError,
    isLoading,
    regelingen,
    themaId,
    title,
    tableConfig,
    dependencyError,
    stadspassen,
    dateExpiryFormatted,
    linkListItems,
    routeConfig,
  } = useHliThemaData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  const hasAanvragen = regelingen.some(
    tableConfig[listPageParamKind.lopend].filter
  );

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph>
        Hieronder ziet u al uw regelingen. Indien u of uw kinderen in bezit zijn
        van een Stadspas ziet u ook de stadspasgegevens.
      </Paragraph>
    </PageContentCell>
  );

  const regelingenTables = featureToggle.hliThemaRegelingenActive
    ? entries(tableConfig)
        .filter(([kind]) => {
          return kind === listPageParamKind.lopend ? hasAanvragen : true;
        })
        .map(
          ([
            kind,
            { title, displayProps, filter, sort, maxItems, listPageRoute },
          ]) => {
            return (
              <ThemaPaginaTable<HLIRegelingFrontend>
                key={kind}
                title={title}
                zaken={regelingen.filter(filter).sort(sort)}
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
        id={themaId}
        title={title}
        pageContentTop={pageContentTop}
        linkListItems={linkListItems}
        pageContentMain={
          <>
            {!!stadspassen?.length && (
              <Stadspassen
                stadspassen={stadspassen}
                dateExpiryFormatted={dateExpiryFormatted}
              />
            )}
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
