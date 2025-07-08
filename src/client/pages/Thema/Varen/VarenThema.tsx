import {
  ActionGroup,
  Alert,
  Grid,
  Heading,
  Icon,
  Link,
  Paragraph,
} from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import { useVarenThemaData } from './useVarenThemaData.hook.ts';
import { rederRegistratieLink } from './Varen-thema-config.ts';
import styles from './Varen.module.scss';
import type {
  VarenRegistratieRederFrontend,
  VarenZakenFrontend,
} from '../../../../server/services/varen/config-and-types.ts';
import { Datalist, RowSet } from '../../../components/Datalist/Datalist.tsx';
import { MaButtonLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph>
      De passagiersvaart in Amsterdam is erg populair bij bezoekers.
      Rondvaartboten en salonboten zijn een vorm van passagiersvaart. Ook
      gehuurde boten, met of zonder schipper, vallen onder de passagiersvaart.
    </Paragraph>
  </PageContentCell>
);

export const VarenDisclaimerRederNotRegistered = (
  <Grid.Cell span="all">
    <Alert headingLevel={4} heading="Registreer uw onderneming">
      <Paragraph>
        Uw onderneming is nog niet geregistreerd als exploitant passagiersvaart.
        U kunt hierdoor geen exploitatievergunningen wijzigen of een nieuwe
        aanvragen.
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
  registratie: VarenRegistratieRederFrontend;
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
        },
        {
          label: 'Telefoonnummer',
          content: registratie.phone,
        },
        {
          label: 'KvK nummer',
          content: registratie.bsnkvk,
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
        },
        {
          label: 'E-mailadres',
          content: registratie.email,
        },
        {
          label: 'Datum registratie',
          content: registratie.dateRequestFormatted,
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

export function VarenThema() {
  const {
    varenRederRegistratie,
    varenZaken,
    tableConfig,
    isLoading,
    isError,
    linkListItems,
    buttonItems,
    title,
    routeConfig,
  } = useVarenThemaData();
  useHTMLDocumentTitle(routeConfig.themaPage);

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
              <Icon svg={ExternalLinkIcon} size="heading-5" />
            </MaButtonLink>
          ))}
        </ActionGroup>
      </PageContentCell>
    ) : null;

  const vergunningenTables = Object.entries(tableConfig).map(
    ([kind, config]) => {
      const zaken = varenZaken.filter(config.filter).sort(config.sort);
      return (
        <ThemaPaginaTable<VarenZakenFrontend>
          key={kind}
          title={config.title}
          zaken={zaken}
          displayProps={config.displayProps}
          className={styles.VarenTableThemaPagina}
          listPageRoute={config.listPageRoute}
          listPageLinkLabel={`Alle ${config.title.toLowerCase()}`}
          maxItems={config.maxItems}
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
      title={title}
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
