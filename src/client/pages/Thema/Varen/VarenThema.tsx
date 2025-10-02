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
import { rederRegistratieLink } from './Varen-thema-config';
import styles from './Varen.module.scss';
import type { VarenRegistratieRederFrontend } from '../../../../server/services/varen/config-and-types';
import { entries } from '../../../../universal/helpers/utils';
import { Datalist, RowSet } from '../../../components/Datalist/Datalist';
import { MaButtonLink } from '../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../components/Page/Page';
import { ParagaphSuppressed } from '../../../components/ParagraphSuppressed/ParagraphSuppressed';
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

const VarenOnlyShowAanvragenAfterDateDisclaimer = (
  <PageContentCell spanWide={8}>
    <ParagaphSuppressed className="ams-mb-m">
      Er worden alleen aanvragen getoond die na 16 juli 2025 zijn ingediend.
    </ParagaphSuppressed>
  </PageContentCell>
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

  const tables = entries(tableConfig).map(([kind, config]) => {
    const varenItems =
      kind === 'actieve-vergunningen' ? varenVergunningen : varenZaken;
    const items = varenItems.filter(config.filter).sort(config.sort);
    return (
      <ThemaPaginaTable
        key={kind}
        title={config.title}
        zaken={items}
        displayProps={config.displayProps}
        className={styles.VarenTableThemaPagina}
        listPageRoute={config.listPageRoute}
        listPageLinkLabel={`Alle ${config.title.toLowerCase()}`}
        maxItems={config.maxItems}
      />
    );
  });

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
          {tables}
          {VarenOnlyShowAanvragenAfterDateDisclaimer}
        </>
      }
      isPartialError={false}
      linkListItems={linkListItems}
    />
  );
}
