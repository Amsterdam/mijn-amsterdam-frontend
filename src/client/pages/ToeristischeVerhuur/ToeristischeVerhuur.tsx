import { Alert, Link, Paragraph } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';

import { routes } from './toeristischeVerhuur-thema-config';
import {
  BB_VERGUNNING_DISCLAIMER,
  useToeristischeVerhuurThemaData,
} from './useToeristischeVerhuur.hook';
import { BBVergunning } from '../../../server/services/toeristische-verhuur/toeristische-verhuur-powerbrowser-bb-vergunning-types';
import {
  LVVRegistratie,
  VakantieverhuurVergunning,
} from '../../../server/services/toeristische-verhuur/toeristische-verhuur-types';
import { entries } from '../../../universal/helpers/utils';
import { LinkProps } from '../../../universal/types/App.types';
import { PageContentCell } from '../../components/Page/Page';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function ToeristscheVerhuurThema() {
  const {
    hasVergunningenVakantieVerhuur,
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
  } = useToeristischeVerhuurThemaData();

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
    <Paragraph>
      Hieronder vindt u een overzicht van uw vergunningen voor toeristische
      verhuur.
    </Paragraph>
  );

  const linkListItems: LinkProps[] = [
    {
      title: 'Meer over toeristenbelasting',
      to: 'https://www.amsterdam.nl/veelgevraagd/toeristenbelasting-2c7c2',
    },
    {
      title: 'Vakantieverhuur melden of registratienummer aanvragen',
      to: 'https://www.toeristischeverhuur.nl/portaal/login',
    },
  ];

  if (hasVergunningBB && !hasVergunningenVakantieVerhuur) {
    linkListItems.unshift({
      title: 'Meer informatie over bed & breakfast',
      to: 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/',
    });
  }

  if (hasVergunningenVakantieVerhuur) {
    linkListItems.unshift({
      title: 'Meer informatie over particuliere vakantieverhuur',
      to: 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/',
    });
  }

  const vergunningenTables = entries(tableConfigVergunningen).map(
    ([kind, { title, displayProps, filter, sort, maxItems, className }]) => {
      return (
        <ThemaPaginaTable<BBVergunning | VakantieverhuurVergunning>
          key={kind}
          title={title}
          className={className}
          zaken={vergunningen.filter(filter).sort(sort)}
          listPageRoute={generatePath(routes.listPage, {
            kind,
          })}
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
              <Alert severity="info" title="Voorwaarden en regels">
                {hasBothVerleend && (
                  <Paragraph className="ams-mb--sm">
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
            <PageContentCell>
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
