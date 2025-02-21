import {
  ActionGroup,
  Alert,
  Grid,
  Icon,
  Link,
  Paragraph,
} from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import { useVarenThemaData } from './useVarenThemaData.hook';
import { rederRegistratieLink } from './Varen-thema-config';
import styles from './Varen.module.scss';
import type {
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

const VarenDisclaimerRederNotRegistered = (
  <Grid.Cell span="all">
    <Alert severity="info">
      <Paragraph>
        Uw onderneming is nog niet geregistreerd als exploitant passagiersvaart.
        U kunt hierdoor geen exploitatievergunningen wijzigen of een nieuwe
        aanvraagen. Registreer uw onderneming via onderstaande link.
      </Paragraph>
      <Paragraph>
        <Link rel="noreferrer" href={rederRegistratieLink.to}>
          {rederRegistratieLink.title}
        </Link>
      </Paragraph>
    </Alert>
  </Grid.Cell>
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
          content: `${registratie.address}${registratie.postalCode ? `, ${registratie.postalCode}` : ''}${registratie.city ? ` ${registratie.city}` : ''}`,
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

  const actionButtons =
    varenRederRegistratie && buttonItems.length ? (
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
    ([kind, config]) => {
      const zaken = varenVergunningen.filter(config.filter).sort(config.sort);
      return (
        <ThemaPaginaTable<VarenVergunningFrontend>
          key={kind}
          title={config.title}
          zaken={zaken}
          displayProps={config.displayProps}
          className={styles.VarenTableThemaPagina}
          listPageRoute={config.listPageRoute}
          listPageLinkLabel={`Alle ${config.title.toLowerCase()}`}
          totalItems={zaken.length}
        />
      );
    }
  );

  const gegevensRegistratieReder = varenRederRegistratie ? (
    <VarenPageContentRederRegistratie registratie={varenRederRegistratie} />
  ) : (
    VarenDisclaimerRederNotRegistered
  );

  return (
    <ThemaPagina
      title={ThemaTitles.VAREN}
      isLoading={isLoading}
      isError={isError}
      pageContentTop={pageContentTop}
      pageContentTopSecondary={actionButtons}
      pageContentMain={
        <>
          {gegevensRegistratieReder}
          {vergunningenTables}
        </>
      }
      isPartialError={false}
      linkListItems={linkListItems}
    />
  );
}
