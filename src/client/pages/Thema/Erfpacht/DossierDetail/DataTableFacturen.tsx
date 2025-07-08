import { Heading, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { generatePath, useParams } from 'react-router';

import { ErfpachtDatalistProps } from './DatalistGeneral.tsx';
import styles from '../ErfpachtDetail.module.scss';
import { WijzigenLink } from './WijzigenLink.tsx';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';
import { LinkToListPage } from '../../../../components/LinkToListPage/LinkToListPage.tsx';
import { TableV2 } from '../../../../components/Table/TableV2.tsx';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../../config/app.ts';
import { DisplayPropsFacturen, routeConfig } from '../Erfpacht-thema-config.ts';

type DataTableFacturenProps = ErfpachtDatalistProps & {
  displayProps: DisplayPropsFacturen;
  isLoading: boolean;
};

export function DataTableFacturen({
  dossier,
  relatieCode,
  displayProps,
  isLoading,
}: DataTableFacturenProps) {
  const { dossierNummerUrlParam } = useParams<{
    dossierNummerUrlParam: string;
  }>();
  const dossierNummer = dossier.dossierNummer;

  const betaler = dossier.relaties?.find((relatie) => relatie.betaler);
  const isBetaler = betaler?.relatieCode === relatieCode;
  const facturenBetalerDebiteurRows = [
    {
      rows: [
        {
          label: dossier.facturen.titelBetaler,
          content: dossier.facturen.betaler || '-',
        },
        {
          label: dossier.facturen.titelDebiteurNummer,
          content: dossier.facturen.debiteurNummer || '-',
        },
        {
          label: null,
          content: !isBetaler ? (
            <WijzigenLink
              debiteurNummer={dossier.facturen?.debiteurNummer}
              relatieCode={relatieCode}
              dossierNummer={dossierNummer}
            />
          ) : (
            ''
          ),
        },
      ],
    },
  ];

  return (
    <>
      <Heading level={4} size="level-4">
        Factuur naar nieuw adres
      </Heading>
      <Paragraph className="ams-mb-m">
        Wilt u uw facturen voor erfpacht en canon op een nieuw adres ontvangen?
        Stuur een e-mail naar{' '}
        <WijzigenLink
          debiteurNummer={dossier.facturen?.debiteurNummer}
          relatieCode={relatieCode}
          dossierNummer={dossierNummer}
          subject="Adreswijziging facturen erfpacht en canon"
          email="erfpachtadministratie@amsterdam.nl"
          label="erfpachtadministratie@amsterdam.nl"
        />
        . Zet in het onderwerp &apos;Adreswijziging&apos;. Vermeld in de mail uw
        debiteurennummer of het E-dossiernummer en uw nieuwe adresgegevens. U
        krijgt binnen 3 werkdagen een reactie.
      </Paragraph>

      <Heading level={4} size="level-4">
        Factuur via e-mail
      </Heading>
      <Paragraph className="ams-mb-l">
        U kunt uw facturen ook per e-mail krijgen. Mail hiervoor uw e-mailadres
        en debiteurennummer naar{' '}
        <WijzigenLink
          debiteurNummer={dossier.facturen?.debiteurNummer}
          relatieCode={relatieCode}
          dossierNummer={dossierNummer}
          subject="Facturen per e-mail ontvangen"
          email="debiteurenadministratie@amsterdam.nl"
          label="debiteurenadministratie@amsterdam.nl"
        />
        .
      </Paragraph>

      <Datalist
        className={styles.FacturenBetalerDebiteur}
        rows={facturenBetalerDebiteurRows}
      />
      {!!dossier.facturen?.facturen?.length && (
        <TableV2
          items={dossier.facturen.facturen.slice(
            0,
            MAX_TABLE_ROWS_ON_THEMA_PAGINA
          )}
          className={classNames(
            styles.FacturenTable,
            styles.DossierDetailFacturenTable
          )}
          displayProps={displayProps}
        />
      )}
      {!!dossier.facturen?.facturen?.length &&
        dossier.facturen.facturen.length > MAX_TABLE_ROWS_ON_THEMA_PAGINA && (
          <LinkToListPage
            count={dossier.facturen.facturen.length}
            route={generatePath(routeConfig.listPageAlleFacturen.path, {
              dossierNummerUrlParam: dossierNummerUrlParam ?? null,
              page: null,
            })}
          />
        )}
      {!isLoading && !dossier.facturen?.facturen?.length && (
        <Paragraph>U heeft geen facturen.</Paragraph>
      )}
    </>
  );
}
