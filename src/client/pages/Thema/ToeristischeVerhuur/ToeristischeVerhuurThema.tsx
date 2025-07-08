import { Alert, Link, Paragraph } from '@amsterdam/design-system-react';

import {
  BB_VERGUNNING_DISCLAIMER,
  useToeristischeVerhuurThemaData,
} from './useToeristischeVerhuur.hook.ts';
import {
  LVVRegistratie,
  ToeristischeVerhuurVergunning,
} from '../../../../server/services/toeristische-verhuur/toeristische-verhuur-config-and-types.ts';
import { entries } from '../../../../universal/helpers/utils.ts';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function ToeristischeVerhuurThema() {
  const {
    hasBothVerleend,
    hasPermits,
    hasRegistrations,
    hasVergunningBB,
    isError,
    isLoading,
    lvvRegistraties,
    tableConfigVergunningen,
    tableConfigLVVRegistraties,
    title,
    vergunningen,
    hasBBVergunningError,
    hasLVVRegistratiesError,
    hasVakantieVerhuurVergunningError,
    linkListItems,
    routeConfig,
  } = useToeristischeVerhuurThemaData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  const errorAlertContent = isError ? (
    <>Wij kunnen nu niet alle gegevens laten zien.</>
  ) : (
    <>
      {(hasBBVergunningError ||
        hasLVVRegistratiesError ||
        hasVakantieVerhuurVergunningError) && (
        <>
          De volgende gegevens konden niet worden opgehaald:
          {hasBBVergunningError && (
            <>
              <br />- Vergunning(en) bed & breakfast
            </>
          )}
          {hasLVVRegistratiesError && (
            <>
              <br />- Landelijk registratienummer
            </>
          )}
          {hasVakantieVerhuurVergunningError && (
            <>
              <br />- Vergunning(en) vakantieverhuur
            </>
          )}
        </>
      )}
    </>
  );

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph>
        Hieronder vindt u een overzicht van uw vergunningen voor toeristische
        verhuur.
      </Paragraph>
    </PageContentCell>
  );

  const vergunningenTables = entries(tableConfigVergunningen).map(
    ([
      kind,
      { title, displayProps, filter, sort, maxItems, listPageRoute },
    ]) => {
      return (
        <ThemaPaginaTable<ToeristischeVerhuurVergunning>
          key={kind}
          title={title}
          zaken={vergunningen.filter(filter).sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
          maxItems={maxItems}
        />
      );
    }
  );

  const registratieTable = (
    <ThemaPaginaTable<LVVRegistratie>
      key="lvv-registraties"
      title={tableConfigLVVRegistraties.title}
      zaken={lvvRegistraties}
      maxItems={-1}
      displayProps={tableConfigLVVRegistraties.displayProps}
    />
  );

  return (
    <ThemaPagina
      title={title}
      pageContentTop={pageContentTop}
      linkListItems={linkListItems}
      pageContentMain={
        <>
          {(hasBothVerleend || (!hasRegistrations && hasPermits)) && (
            <PageContentCell>
              <Alert heading="Voorwaarden en regels" headingLevel={4}>
                {hasBothVerleend && (
                  <Paragraph className="ams-mb-m">
                    U heeft een vergunning voor vakantieverhuur &eacute;n bed
                    &amp; breakfast. Het is niet toegestaan om op hetzelfde
                    adres zowel aan vakantieverhuur als bed &amp; breakfast te
                    doen. U moet daarom 1 van deze vergunningen opzeggen.{' '}
                    <Link
                      rel="noopener noreferrer"
                      href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/"
                    >
                      Meer informatie over voorwaarden vakantieverhuur
                    </Link>
                    .
                  </Paragraph>
                )}

                {!hasRegistrations && hasPermits && (
                  <Paragraph>
                    U heeft een vergunning voor vakantieverhuur of bed &amp;
                    breakfast. U moet daarom ook een landelijk registratienummer
                    voor toeristische verhuur aanvragen.{' '}
                    <Link
                      rel="noopener noreferrer"
                      href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/registratienummer-toeristische-verhuur/"
                    >
                      Meer informatie over het landelijk registratienummer
                      toeristische verhuur
                    </Link>
                    .
                  </Paragraph>
                )}
              </Alert>
            </PageContentCell>
          )}
          {!hasVergunningBB && (
            <PageContentCell spanWide={8}>
              <Paragraph>{BB_VERGUNNING_DISCLAIMER}</Paragraph>
            </PageContentCell>
          )}
          {vergunningenTables}
          {registratieTable}
        </>
      }
      isError={isError}
      errorAlertContent={errorAlertContent}
      isPartialError={
        hasBBVergunningError ||
        hasLVVRegistratiesError ||
        hasVakantieVerhuurVergunningError
      }
      isLoading={isLoading}
    />
  );
}
