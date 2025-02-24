import {
  ActionGroup,
  Alert,
  Grid,
  GridColumnNumber,
  Heading,
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
import { PageContentCell } from '../../components/Page/Page';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <PageContentCell spanWide={6}>
    <Paragraph>
      De passagiersvaart in Amsterdam is erg populair bij bezoekers.
      Rondvaartboten en salonboten zijn een vorm van passagiersvaart. Ook gehuurde
      boten, met of zonder schipper, vallen onder de passagiersvaart.
    </Paragraph>
  </PageContentCell>
);

const VarenDisclaimerRederNotRegistered = (
  <Grid.Cell span="all">
    <Alert severity="info">
      <Paragraph>
        Uw onderneming is nog niet geregistreerd als exploitant passagiersvaart.
        U kunt hierdoor geen exploitatievergunningen wijzigen of een nieuwe
        aanvragen. Registreer uw onderneming via onderstaande link.
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

const DEFAULT_GRID_SPAN: GridColumnNumber = 4;
export function VarenPageContentRederRegistratie({
  registratie,
}: VarenPageContentRederRegistratieProps) {
  const rows: RowSet[] = [
    {
      rows: [
        {
          label: 'Naam aanvrager',
          content: registratie.company,
          span: DEFAULT_GRID_SPAN,
        },
        {
          label: 'Telefoonnummer',
          content: registratie.phone,
          span: DEFAULT_GRID_SPAN,
        },
        {
          label: 'KvK nummer',
          content: registratie.bsnkvk,
          span: DEFAULT_GRID_SPAN,
        },
      ],
    },
    {
      rows: [
        {
          label: 'Adres',
          content:
            registratie.correspondenceAddress ||
            `${registratie.address}${registratie.postalCode ? `, ${registratie.postalCode}` : ''}${registratie.city ? ` ${registratie.city}` : ''}`,
          span: DEFAULT_GRID_SPAN,
        },
        {
          label: 'E-mailadres',
          content: registratie.email,
          span: DEFAULT_GRID_SPAN,
        },
        {
          label: 'Datum registratie',
          content: registratie.dateRequestFormatted,
          span: DEFAULT_GRID_SPAN,
        },
      ],
    },
  ];

  return (
    <Grid.Cell span="all">
      <Heading level={3} size="level-2">
        Gegevens Aanvrager
      </Heading>
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
  <PageContentCell>
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
</PageContentCell>
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
