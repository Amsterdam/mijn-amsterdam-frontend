import { Alert, Icon, Paragraph } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import { useParkerenData } from './useParkerenData.hook';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { CaseTypeV2 } from '../../../universal/types/decos-zaken';
import { MaButtonLink } from '../../components/MaLink/MaLink';
import { PageContentCell } from '../../components/Page/Page';
import { ParagaphSuppressed } from '../../components/ParagraphSuppressed/ParagraphSuppressed';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function Parkeren() {
  const {
    title,
    tableConfig,
    vergunningen,
    hasMijnParkerenVergunningen,
    isLoading,
    isError,
    parkerenUrlSSO,
    linkListItems,
  } = useParkerenData();

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, sort, listPageRoute, className },
    ]) => {
      return (
        <ThemaPaginaTable<VergunningFrontend>
          key={kind}
          title={title}
          zaken={vergunningen.filter(filter).sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
          className={className}
        />
      );
    }
  );

  const pageContentTop = determinePageContentTop(
    hasMijnParkerenVergunningen,
    parkerenUrlSSO
  );

  const hasActualGPK = vergunningen.find(
    (vergunning) =>
      !vergunning.processed && vergunning.caseType === CaseTypeV2.GPK
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
      <PageContentCell spanWide={6}>
        <Alert
          severity="info"
          heading={`Parkeervergunning voor ${profileTypeLabel}`}
        >
          <Paragraph>
            Het inzien, aanvragen of wijzigen van een parkeervergunning voor{' '}
            {profileTypeLabel} kan via Mijn Parkeren.
          </Paragraph>
          <Paragraph>
            <MaButtonLink href={parkerenUrlSSO}>
              Ga naar Mijn Parkeren&nbsp;
              <Icon svg={ExternalLinkIcon} size="level-5" />
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
