import {
  ActionGroup,
  Grid,
  Icon,
  Paragraph,
} from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import { useVarenThemaData } from './useVarenThemaData.hook';
import styles from './Varen.module.scss';
import {
  VarenFrontend,
  VarenRegistratieRederType,
  VarenVergunningFrontend,
} from '../../../server/services/varen/config-and-types';
import { Datalist, RowSet } from '../../components/Datalist/Datalist';
import { MaButtonLink } from '../../components/MaLink/MaLink';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <Paragraph>
    De passagiersvaart in Amsterdam is erg populair bij bezoekers.
    Rondvaartboten en salonboten zijn een vorm van passagiersvaart. Ook gehuurde
    boten, met of zonder schipper, vallen onder de passagiersvaart.
  </Paragraph>
);

type VarenPageContentRederRegistratieProps = {
  registratie: VarenFrontend<VarenRegistratieRederType>;
};

export function VarenPageContentRederRegistratie({
  registratie,
}: VarenPageContentRederRegistratieProps) {
  const rows: RowSet[] = [
    {
      rows: [
        {
          label: 'Naam aanvrager',
          content: registratie.company,
          span: 4,
        },
        {
          label: 'Telefoonnummer',
          content: registratie.phone,
          span: 4,
        },
        {
          label: 'KvK nummer',
          content: registratie.bsnkvk,
          span: 4,
        },
      ],
    },
    {
      rows: [
        {
          label: 'Adres',
          content: `${registratie.address}${registratie.postalCode ? ` ${registratie.postalCode}` : ''}`,
          span: 4,
        },
        {
          label: 'E-mailadres',
          content: registratie.email,
          span: 4,
        },
        {
          label: 'Datum registratie',
          content: registratie.dateDecisionFormatted,
          span: 4,
        },
      ],
    },
  ];

  return (
    <Grid.Cell span="all">
      <Datalist rows={rows} className={styles.VarenGridWithoutRowGap} />
    </Grid.Cell>
  );
}

export function Varen() {
  const {
    varenRederRegistratie,
    varenVergunningen,
    tableConfig,
    isLoading,
    isError,
    linkListItems,
    buttonItems,
  } = useVarenThemaData();

  const pageContentTopSecondary = buttonItems.length ? (
    <ActionGroup>
      {buttonItems.map(({ to, title }) => (
        <MaButtonLink
          key={to}
          href={to}
          variant="secondary"
          className={styles.VarenButton}
        >
          {title}
          <Icon svg={ExternalLinkIcon} size="level-5" />
        </MaButtonLink>
      ))}
    </ActionGroup>
  ) : null;

  const vergunningenTables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort }]) => {
      return (
        <ThemaPaginaTable<VarenVergunningFrontend>
          key={kind}
          title={title}
          zaken={varenVergunningen.filter(filter).sort(sort)}
          displayProps={displayProps}
          className={styles.VarenTableThemaPagina}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={ThemaTitles.VAREN}
      isLoading={isLoading}
      isError={isError}
      pageContentTop={pageContentTop}
      pageContentTopSecondary={pageContentTopSecondary}
      pageContentMain={
        <>
          {varenRederRegistratie && (
            <VarenPageContentRederRegistratie
              registratie={varenRederRegistratie}
            />
          )}
          {vergunningenTables}
        </>
      }
      isPartialError={false}
      linkListItems={linkListItems}
    />
  );
}
