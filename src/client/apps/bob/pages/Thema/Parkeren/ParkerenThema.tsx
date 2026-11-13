import { Alert, Icon, Paragraph } from '@amsterdam/design-system-react';
import { LinkExternalIcon } from '@amsterdam/design-system-react-icons';

import type { DecosZaakFrontend } from '../../../../../../server/services/vergunningen/config-and-types.ts';
import { MaButtonLink } from '../../../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../../../components/Page/Page.tsx';
import { ParagaphSuppressed } from '../../../../../components/ParagraphSuppressed/ParagraphSuppressed.tsx';
import { ThemaPagina } from '../../../../../components/Thema/ThemaPagina.tsx';
import { ThemaPaginaDataView } from '../../../../../components/Thema/ThemaPaginaDataView.tsx';
import { useHTMLDocumentTitle } from '../../../../../hooks/useHTMLDocumentTitle.ts';
import {
  useAuthMethod,
  useProfileTypeValue,
} from '../../../../../hooks/useProfileType.ts';
import { GemachtigdeAlert } from '../../Dashboard/GemachtigdeAlert.tsx';
import { useParkerenData } from './useParkerenData.hook.tsx';

type PageContentTopProps = {
  authMethod: string;
};

function PageContentTop({ authMethod }: PageContentTopProps) {
  if (authMethod === 'digidGemachtigd') {
    return (
      <PageContentCell spanWide={8}>
        <GemachtigdeAlert />
      </PageContentCell>
    );
  }
  return (
    <PageContentCell spanWide={8}>
      <Paragraph>Hieronder ziet u een overzicht van uw vergunningen.</Paragraph>
    </PageContentCell>
  );
}

export function ParkerenThema() {
  const {
    id,
    title,
    tableConfig,
    vergunningen,
    isLoading,
    isError,
    themaConfig,
  } = useParkerenData();
  const { authMethod } = useAuthMethod();

  useHTMLDocumentTitle(themaConfig.route);


  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, sort, listPageRoute, maxItems },
    ]) => {
      return (
        <ThemaPaginaDataView<DecosZaakFrontend>
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

  const pageContentTop = <PageContentTop authMethod={authMethod} />;

  const hasActualGPK = vergunningen.find(
    (vergunning) => !vergunning.processed && vergunning.caseType === 'GPK'
  );

  const pageContentBottom = hasActualGPK && (
    <PageContentCell startWide={3} spanWide={7}>
      <ParagaphSuppressed>
        Heeft u naast een Europese gehandicaptenparkeerkaart (GPK) ook een vaste
        parkeerplaats voor gehandicapten (GPP) aangevraagd? Dan ziet u hier in
        Mijn Amsterdam alleen de aanvraag voor een GPK staan. Zodra de GPK is
        gegeven, ziet u ook uw aanvraag voor uw GPP in Mijn Amsterdam.
      </ParagaphSuppressed>
    </PageContentCell>
  );

  return (
    <ThemaPagina
      id={id}
      title={title}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={pageContentTop}
      pageLinks={themaConfig.pageLinks}
      pageContentMain={tables}
      pageContentBottom={pageContentBottom}
      maintenanceNotificationsPageSlug="parkeren"
    />
  );
}
export const forTesting = { PageContentTop };
