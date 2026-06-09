import { Paragraph } from '@amsterdam/design-system-react';

import { listPageParamKind, stadspasDisplayProps } from './HLI-thema-config.ts';
import styles from './HLIThema.module.scss';
import { useHliThemaData } from './useHliThemaData.ts';
import type {
  HLIRegelingFrontend,
  HLIRegelingSpecificatieFrontend,
} from '../../../../server/services/hli/hli-regelingen-types.ts';
import { type StadspasResponseFrontend } from '../../../../server/services/hli/stadspas-types.ts';
import { entries } from '../../../../universal/helpers/utils.ts';
import { MaRouterLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { ParagaphSuppressed } from '../../../components/ParagraphSuppressed/ParagraphSuppressed.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaZaken from '../../../components/Thema/ThemaPaginaZaken.tsx';
import { useSmallScreen } from '../../../hooks/media.hook.ts';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function HistoricItemsMention() {
  return (
    <ParagaphSuppressed>
      U ziet hier niet alle gegevens uit het verleden. De gegevens die u hier
      niet ziet, heeft u eerder per post ontvangen.
    </ParagaphSuppressed>
  );
}

function Stadspassen({
  stadspassen,
  dateExpiryFormatted,
}: StadspasResponseFrontend) {
  const isSmallScreen = useSmallScreen();

  const passen = stadspassen.map((pas) => {
    return {
      ...pas,
      ownerEl: (
        <MaRouterLink maVariant="fatNoUnderline" href={pas.link?.to}>
          <span
            className={styles.Stadspas_owner}
          >{`Stadspas van ${pas.owner.firstname}`}</span>
        </MaRouterLink>
      ),
      owner: `Stadspas van ${pas.owner.firstname}`,
      actief: pas.actief ? 'Actief' : 'Inactief',
    };
  });

  return (
    <>
      <ThemaPaginaZaken
        displayProps={stadspasDisplayProps}
        zaken={passen}
        title={isSmallScreen ? 'Stadspassen' : undefined}
        className={styles.Stadspassen}
        contentAfterTheZaken={
          !!stadspassen?.length &&
          dateExpiryFormatted && (
            <Paragraph size="small">
              Het huidige stadspasjaar eindigt op {dateExpiryFormatted}.
            </Paragraph>
          )
        }
      />
    </>
  );
}

export function HLIThema() {
  const {
    isError,
    isLoading,
    regelingen,
    specificaties,
    themaId,
    title,
    tableConfig,
    specificatieTableConfig,
    dependencyError,
    stadspassen,
    dateExpiryFormatted,
    themaConfig,
  } = useHliThemaData();
  useHTMLDocumentTitle(themaConfig.route);

  const hasAanvragen = regelingen.some(
    tableConfig[listPageParamKind.lopend].filter
  );

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph>
        Hieronder ziet u al uw regelingen. Als u een Stadspas heeft aangevraagd,
        komt deze vanzelf op deze pagina te staan.
      </Paragraph>
    </PageContentCell>
  );

  const regelingenTables = themaConfig.featureToggle.regelingen.active
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
              <ThemaPaginaZaken<HLIRegelingFrontend>
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
        pageLinks={themaConfig.pageLinks}
        maintenanceNotificationsPageSlug="stadspas"
        pageContentMain={
          <>
            {!!stadspassen?.length && (
              <Stadspassen
                stadspassen={stadspassen}
                dateExpiryFormatted={dateExpiryFormatted}
              />
            )}
            {!!specificaties.length && (
              <ThemaPaginaZaken<HLIRegelingSpecificatieFrontend>
                title={specificatieTableConfig.title}
                displayProps={specificatieTableConfig.displayProps}
                zaken={specificaties.sort(specificatieTableConfig.sort)}
                maxItems={specificatieTableConfig.maxItems}
                listPageRoute={specificatieTableConfig.listPageRoute}
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
