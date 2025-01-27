import { Grid, Heading, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { generatePath, useParams } from 'react-router-dom';

import { AppRoutes } from '../../../../universal/config/routes';
import { Datalist } from '../../../components/Datalist/Datalist';
import { LinkToListPage } from '../../../components/LinkToListPage/LinkToListPage';
import { TableV2 } from '../../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import { useErfpachtV2Data } from '../erfpachtData.hook';
import { ErfpachtDatalistProps } from './DatalistGeneral';
import styles from './ErfpachtDossierDetail.module.scss';
import { WijzigenLink } from './WijzigenLink';
import { PageContentCell } from '../../../components/Page/Page';

export function DataTableFacturen({
  dossier,
  relatieCode,
}: ErfpachtDatalistProps) {
  const { displayPropsAlleFacturen, isLoading } = useErfpachtV2Data();
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
          className: styles.FacturenBetalerDebiteur_Col1,
        },
        {
          label: dossier.facturen.titelDebiteurNummer,
          content: dossier.facturen.debiteurNummer || '-',
          className: styles.FacturenBetalerDebiteur_Col2,
        },
        {
          label: null,
          content: !isBetaler ? (
            <WijzigenLink
              linkVariant="inList"
              debiteurNummer={dossier.facturen?.debiteurNummer}
              relatieCode={relatieCode}
              dossierNummer={dossierNummer}
            />
          ) : (
            ''
          ),
          className: styles.FacturenBetalerDebiteur_Col3,
        },
      ],
    },
  ];

  return (
    <Grid className={styles.FacturenBetaler}>
      <PageContentCell>
        <Heading level={4} size="level-4">
          Factuur naar nieuw adres
        </Heading>
        <Paragraph>
          Wilt u uw facturen voor erfpacht en canon op een nieuw adres
          ontvangen? Stuur een e-mail naar{' '}
          <WijzigenLink
            debiteurNummer={dossier.facturen?.debiteurNummer}
            relatieCode={relatieCode}
            dossierNummer={dossierNummer}
            subject="Adreswijziging facturen erfpacht en canon"
            email="erfpachtadministratie@amsterdam.nl"
            label="erfpachtadministratie@amsterdam.nl"
          />
          . Zet in het onderwerp &apos;Adreswijziging&apos;. Vermeld in de mail
          uw debiteurennummer of het E-dossiernummer en uw nieuwe adresgegevens.
          U krijgt binnen 3 werkdagen een reactie.
        </Paragraph>
      </PageContentCell>
      <PageContentCell>
        <Heading level={4} size="level-4">
          Factuur via e-mail
        </Heading>
        <Paragraph>
          U kunt uw facturen ook per e-mail krijgen. Mail hiervoor uw
          e-mailadres en debiteurennummer naar{' '}
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
      </PageContentCell>
      <PageContentCell>
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
            displayProps={displayPropsAlleFacturen}
          />
        )}
        {!!dossier.facturen?.facturen?.length &&
          dossier.facturen.facturen.length > MAX_TABLE_ROWS_ON_THEMA_PAGINA && (
            <LinkToListPage
              count={dossier.facturen.facturen.length}
              route={generatePath(AppRoutes['ERFPACHTv2/ALLE_FACTUREN'], {
                dossierNummerUrlParam,
              })}
            />
          )}
        {!isLoading && !dossier.facturen?.facturen?.length && (
          <Paragraph>U heeft geen facturen.</Paragraph>
        )}
      </PageContentCell>
    </Grid>
  );
}
