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

import { CONTENT_EMPTY } from './helper';
import { useVarenThemaData } from './useVarenThemaData.hook';
import { listPageParamKind, rederRegistratieLink } from './Varen-thema-config';
import styles from './Varen.module.scss';
import type {
  VarenRegistratieRederFrontend,
  VarenVergunningFrontend,
  VarenZakenFrontend,
} from '../../../../server/services/varen/config-and-types';
import { Datalist, RowSet } from '../../../components/Datalist/Datalist';
import { MaButtonLink } from '../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

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
          content: registratie.company || CONTENT_EMPTY,
        },
        {
          label: 'Telefoonnummer',
          content: registratie.phone || CONTENT_EMPTY,
        },
        {
          label: 'KvK nummer',
          content: registratie.bsnkvk || CONTENT_EMPTY,
        },
      ],
    },
    {
      rows: [
        {
          label: registratie.correspondenceAddress
            ? 'Correspondentieadres'
            : 'Adres',
          content:
            registratie.correspondenceAddress ||
            [registratie.address, registratie.postalCode, registratie.city]
              .filter((x) => !!x)
              .join(', ') ||
            CONTENT_EMPTY,
        },
        {
          label: 'E-mailadres',
          content: registratie.email || CONTENT_EMPTY,
        },
        {
          label: 'Datum registratie',
          content: registratie.dateRequestFormatted || CONTENT_EMPTY,
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
    varenVergunningen,
    tableConfig,
    isLoading,
    isError,
    linkListItems,
    buttonItems,
    id,
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

  const zakenTableconfig = tableConfig[listPageParamKind.inProgress];
  const zakenTable = (
    <ThemaPaginaTable<VarenZakenFrontend>
      key={listPageParamKind.inProgress}
      title={zakenTableconfig.title}
      zaken={varenZaken
        .filter(zakenTableconfig.filter)
        .sort(zakenTableconfig.sort)}
      displayProps={zakenTableconfig.displayProps}
      className={styles.VarenTableThemaPagina}
      listPageRoute={zakenTableconfig.listPageRoute}
      listPageLinkLabel={`Alle ${zakenTableconfig.title.toLowerCase()}`}
      maxItems={zakenTableconfig.maxItems}
    />
  );
  const vergunningenTableconfig = tableConfig[listPageParamKind.actief];
  const vergunningenTable = (
    <ThemaPaginaTable<VarenVergunningFrontend>
      key={listPageParamKind.actief}
      title={vergunningenTableconfig.title}
      zaken={varenVergunningen
        .filter(vergunningenTableconfig.filter)
        .sort(vergunningenTableconfig.sort)}
      displayProps={vergunningenTableconfig.displayProps}
      className={styles.VarenTableThemaPagina}
      listPageRoute={vergunningenTableconfig.listPageRoute}
      listPageLinkLabel={`Alle ${vergunningenTableconfig.title.toLowerCase()}`}
      maxItems={vergunningenTableconfig.maxItems}
    />
  );

  const gegevensRegistratieReder = varenRederRegistratie ? (
    <VarenPageContentRederRegistratie registratie={varenRederRegistratie} />
  ) : (
    VarenDisclaimerRederNotRegistered
  );

  return (
    <ThemaPagina
      id={id}
      title={title}
      isLoading={isLoading}
      isError={isError}
      pageContentTop={pageContentTop}
      pageContentTopSecondary={actionButtons}
      pageContentMain={
        <>
          {gegevensRegistratieReder}
          {zakenTable}
          {vergunningenTable}
        </>
      }
      isPartialError={false}
      linkListItems={linkListItems}
    />
  );
}
