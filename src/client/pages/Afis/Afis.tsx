import React from 'react';

import {
  Alert,
  Heading,
  Link,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';

import { AfisFactuurFrontend } from './Afis-thema-config';
import styles from './Afis.module.scss';
import { useAfisThemaData } from './useAfisThemaData.hook';
import { entries } from '../../../universal/helpers/utils';
import { MaButtonRouterLink } from '../../components/MaLink/MaLink';
import { PageContentCell } from '../../components/Page/Page';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

function PageContentTop({
  urlNaarBelastingen,
}: {
  urlNaarBelastingen: string;
}) {
  return (
    <PageContentCell>
      <Paragraph className="ams-mb--sm">
        Hieronder ziet u een overzicht van uw facturen. Mist u een factuur of
        heeft u een vraag over één van uw facturen? Stuur een e-mail naar{' '}
        <Link href="mailto:debiteurenadministratie@amsterdam.nl?subject=Vraag over facturen en betaalvoorkeuren">
          debiteurenadministratie@amsterdam.nl
        </Link>{' '}
        met de details van de factuur, zoals het factuurnummer of andere
        relevante informatie, zodat zij u verder kunnen helpen.
      </Paragraph>
      <Paragraph>
        U ziet hier niet de facturen over Gemeentebelastingen. Deze vindt u
        terug bij{' '}
        <Link rel="noreferrer" href={urlNaarBelastingen}>
          Mijn Belastingen
        </Link>
        .
      </Paragraph>
    </PageContentCell>
  );
}

export function AfisDisclaimer() {
  return (
    <Alert severity="warning">
      <UnorderedList>
        <UnorderedList.Item>
          Het verwerken van uw betaling kan tot 4 werkdagen duren.
        </UnorderedList.Item>
        <UnorderedList.Item>
          Enkel het openstaande bedrag wordt getoond.
        </UnorderedList.Item>
        <UnorderedList.Item>
          Gebruik de betaallink alleen voor het voldoen van het volledige
          factuurbedrag. Indien er sprake is van een betalingsregeling of
          deelbetaling verzoeken we u het resterend bedrag handmatig over te
          maken onder vermelding van de gegevens op uw factuur.
        </UnorderedList.Item>
      </UnorderedList>
    </Alert>
  );
}

export function AfisDisclaimerOvergedragenFacturen() {
  return (
    <Alert>
      <Paragraph>
        Als u niet betaalt, wordt uw factuur door Financiën overgedragen naar de
        afdeling Incasso & Invordering van directie Belastingen. Deze afdeling
        is vanaf dat moment verantwoordelijk voor de invordering van uw factuur
        en daarmee uw aanspreekpunt. De status van uw factuur vindt u terug bij
        Mijn Belastingen - gemeente Amsterdam.
      </Paragraph>
      <Heading level={4} size="level-5">
        Heeft u vragen?
      </Heading>
      <Paragraph>
        Afdeling Incasso & Invordering is van maandag tot en met vrijdag tussen
        08.00 en 18.00 uur bereikbaar op{' '}
        <Link rel="noreferrer" href="tel:0202554800">
          020 255 4800
        </Link>
        . U kunt ook een e-mail sturen naar{' '}
        <Link rel="noreferrer" href="mailto:belastingen@amsterdam.nl">
          belastingen@amsterdam.nl
        </Link>
        . Noem in het onderwerp uw vorderingsnummer en team Incasso.
      </Paragraph>
    </Alert>
  );
}

export function AfisThemaPagina() {
  const {
    dependencyErrors,
    facturenByState,
    facturenTableConfig,
    isThemaPaginaError,
    isThemaPaginaLoading,
    listPageTitle,
    routes,
    linkListItems,
    belastingenLinkListItem,
  } = useAfisThemaData();

  const isPartialError = entries(dependencyErrors).some(
    ([, hasError]) => hasError
  );

  const pageContentSecondary = (
    <PageContentCell spanWide={12}>
      <MaButtonRouterLink
        className="ams-mb--sm"
        variant="secondary"
        href={routes.betaalVoorkeuren}
      >
        Betaalvoorkeuren
      </MaButtonRouterLink>
      <AfisDisclaimer />
    </PageContentCell>
  );

  const pageContentErrorAlert = (
    <>
      We kunnen niet alle gegevens tonen.{' '}
      {entries(dependencyErrors)
        .filter(([, hasError]) => hasError)
        .map(([state]) => (
          <React.Fragment key={state}>
            <br />- {listPageTitle[state]} kunnen nu niet getoond worden.
          </React.Fragment>
        ))}
    </>
  );

  const pageContentTables = entries(facturenTableConfig).map(
    ([
      state,
      {
        title,
        subTitle,
        displayProps,
        maxItems,
        listPageLinkLabel,
        listPageRoute,
        className,
      },
    ]) => {
      const subTitleNode =
        state === 'overgedragen' && !!facturenByState?.[state]?.facturen.length
          ? state === 'overgedragen' && <AfisDisclaimerOvergedragenFacturen />
          : subTitle;
      return (
        <ThemaPaginaTable<AfisFactuurFrontend>
          key={state}
          title={title}
          subTitle={subTitleNode}
          zaken={facturenByState?.[state]?.facturen ?? []}
          displayProps={displayProps}
          maxItems={maxItems}
          totalItems={facturenByState?.[state]?.count}
          listPageLinkLabel={listPageLinkLabel}
          listPageRoute={listPageRoute}
          className={styles[className]}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={ThemaTitles.AFIS}
      isError={isThemaPaginaError}
      isPartialError={isPartialError}
      errorAlertContent={pageContentErrorAlert}
      isLoading={!isThemaPaginaError && isThemaPaginaLoading}
      linkListItems={linkListItems}
      pageContentTop={
        <PageContentTop urlNaarBelastingen={belastingenLinkListItem.to} />
      }
      pageContentMain={
        <>
          {pageContentSecondary}
          {pageContentTables}
        </>
      }
    />
  );
}
