import { Grid, Paragraph } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';
import type { ToeristischeVerhuurRegistratieDetail } from '../../../server/services/toeristische-verhuur/tv-lvv-registratie';
import { BBVergunning } from '../../../server/services/toeristische-verhuur/tv-powerbrowser-bb-vergunning';
import { VakantieverhuurVergunning } from '../../../server/services/toeristische-verhuur/tv-vakantieverhuur-vergunning';
import { LinkProps } from '../../../universal/types/App.types';
import { ErrorAlert, InfoDetail, LinkdInline } from '../../components';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { routes } from './toeristischeVerhuur-thema-config';
import styles from './ToeristischeVerhuur.module.scss';
import {
  BB_VERGUNNING_DISCLAIMER,
  useToeristischeVerhuurThemaData,
} from './useToeristischeVerhuur.hook';

export function ToeristscheVerhuurThema() {
  const {
    dependencyError,
    hasBothPermits,
    hasBothVerleend,
    hasPermits,
    hasRegistrations,
    hasVergunningBB,
    isError,
    isLoading,
    lvvRegistraties,
    tableConfig,
    title,
    vergunningen,
  } = useToeristischeVerhuurThemaData();

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

  if (hasVergunningBB && !hasBothPermits) {
    linkListItems.unshift({
      title: 'Meer informatie over bed &amp; breakfast',
      to: 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/',
    });
  }

  if (!hasVergunningBB) {
    linkListItems.unshift({
      title: 'Meer informatie over particuliere vakantieverhuur',
      to: 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/',
    });
  }

  const vergunningenTables = Object.entries(tableConfig).map(
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
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
          maxItems={maxItems}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={title}
      pageContentTop={pageContentTop}
      linkListItems={linkListItems}
      pageContentTables={
        <>
          {hasBothVerleend && (
            <Grid.Cell span="all">
              <ErrorAlert severity="warning" title="Let op!">
                U heeft een vergunning voor vakantieverhuur &eacute;n bed &amp;
                breakfast. Het is niet toegestaan om op hetzelfde adres zowel
                aan vakantieverhuur als bed &amp; breakfast te doen. U moet
                daarom 1 van deze vergunningen opzeggen.
                <LinkdInline
                  external={true}
                  href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/"
                >
                  Meer informatie over voorwaarden vakantieverhuur
                </LinkdInline>
                .
              </ErrorAlert>
            </Grid.Cell>
          )}
          {!hasRegistrations && hasPermits && (
            <Grid.Cell span="all">
              <ErrorAlert severity="info" title="Let op!">
                U heeft een vergunning voor vakantieverhuur of bed &amp;
                breakfast. U moet daarom ook een landelijk registratienummer
                voor toeristische verhuur aanvragen.
                <LinkdInline
                  external={true}
                  href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/registratienummer-toeristische-verhuur/"
                >
                  Meer informatie over het landelijk registratienummer
                  toeristische verhuur
                </LinkdInline>
                .
              </ErrorAlert>
            </Grid.Cell>
          )}
          {!hasVergunningBB && (
            <p className={styles.DisclaimerCollapseText}>
              {BB_VERGUNNING_DISCLAIMER}
            </p>
          )}
          {vergunningenTables}
        </>
      }
      isError={isError}
      errorAlertContent={dependencyError}
      isPartialError={!!dependencyError}
      isLoading={isLoading}
      pageContentBottom={
        <InfoDetail
          label="Registratienummer toeristische verhuur"
          valueWrapperElement="div"
          value={lvvRegistraties?.map(
            (registrationItem: ToeristischeVerhuurRegistratieDetail) => (
              <article
                key={registrationItem.registrationNumber}
                className={styles.RegistrationNumber}
              >
                <span>{registrationItem.registrationNumber}</span>
                <br />
                {registrationItem.street} {registrationItem.houseNumber}
                {registrationItem.houseLetter}{' '}
                {registrationItem.houseNumberExtension}{' '}
                {registrationItem.postalCode} {registrationItem.city}
              </article>
            )
          )}
        />
      }
    />
  );
}
