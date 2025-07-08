import { Alert, Icon, Paragraph } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import { useParkerenData } from './useParkerenData.hook.tsx';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types.ts';
import { MaButtonLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { ParagaphSuppressed } from '../../../components/ParagraphSuppressed/ParagraphSuppressed.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import { useProfileTypeValue } from '../../../hooks/useProfileType.ts';

export function ParkerenThema() {
  const {
    title,
    tableConfig,
    vergunningen,
    hasMijnParkerenVergunningen,
    isLoading,
    isError,
    parkerenUrlSSO,
    linkListItems,
    routeConfig,
  } = useParkerenData();

  useHTMLDocumentTitle(routeConfig.themaPage);

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, sort, listPageRoute, maxItems },
    ]) => {
      return (
        <ThemaPaginaTable<VergunningFrontend>
          key={kind}
          title={title}
          zaken={vergunningen.filter(filter).sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
          maxItems={maxItems}
        />
      );
    }
  );

  const pageContentTop = determinePageContentTop(
    hasMijnParkerenVergunningen,
    parkerenUrlSSO
  );

  const hasActualGPK = vergunningen.find(
    (vergunning) => !vergunning.processed && vergunning.caseType === 'GPK'
  );

  const pageContentBottom = hasActualGPK && (
    <PageContentCell startWide={3} spanWide={7}>
      <ParagaphSuppressed>
        Hebt u naast een Europese gehandicaptenparkeerkaart (GPK) ook een vaste
        parkeerplaats voor gehandicapten (GPP) aangevraagd? Dan ziet u hier in
        Mijn Amsterdam alleen de aanvraag voor een GPK staan. Zodra de GPK is
        gegeven, ziet u ook uw aanvraag voor uw GPP in Mijn Amsterdam.
      </ParagaphSuppressed>
    </PageContentCell>
  );

  return (
    <ThemaPagina
      title={title}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      linkListItems={linkListItems}
      pageContentMain={tables}
      pageContentBottom={pageContentBottom}
    />
  );
}

function determinePageContentTop(
  hasMijnParkerenVergunningen: boolean,
  parkerenUrlSSO: string
) {
  if (hasMijnParkerenVergunningen) {
    const profileType = useProfileTypeValue();

    const profileTypeLabel =
      profileType === 'commercial' ? 'bedrijven' : 'bewoners';

    return (
      <PageContentCell spanWide={8}>
        <Alert
          heading={`Parkeervergunning voor ${profileTypeLabel}`}
          headingLevel={4}
        >
          <Paragraph>
            Het inzien, aanvragen of wijzigen van een parkeervergunning voor{' '}
            {profileTypeLabel} kan via Mijn Parkeren.
          </Paragraph>
          <Paragraph>
            <MaButtonLink href={parkerenUrlSSO}>
              Ga naar Mijn Parkeren&nbsp;
              <Icon svg={ExternalLinkIcon} size="heading-5" />
            </MaButtonLink>
          </Paragraph>
        </Alert>
      </PageContentCell>
    );
  }
  return (
    <Paragraph>Hieronder ziet u een overzicht van uw vergunningen.</Paragraph>
  );
}

export const forTesting = { determinePageContentTop };
