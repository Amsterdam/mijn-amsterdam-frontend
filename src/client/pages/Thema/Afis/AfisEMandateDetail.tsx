import { useParams } from 'react-router';

import {
  routeConfig,
  themaId,
  type WithActionButtons,
} from './Afis-thema-config';
import {
  useAfisBetaalVoorkeurenData,
  useAfisThemaData,
} from './useAfisThemaData.hook';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import { MaLink } from '../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

type EMandateProps = {
  eMandate: WithActionButtons<AfisEMandateFrontend>;
};

function EMandate({ eMandate }: EMandateProps) {
  return (
    <PageContentCell>
      <Datalist
        rows={[
          {
            rows: [
              {
                label: 'Afdeling gemeente',
                content: eMandate.acceptant,
              },
              {
                label: 'IBAN gemeente',
                content: eMandate.acceptantIBAN,
              },
            ],
          },
          {
            rows: [
              {
                label: 'Status',
                content: eMandate.displayStatus,
              },
              {
                label: 'Einddatum',
                isVisible: !!eMandate.senderName,
                content: (
                  <>
                    doorlopend &nbsp;
                    <MaLink href="/">einddatum aanpassen</MaLink>
                  </>
                ),
              },
            ],
          },
          ...(eMandate.senderName
            ? [
                {
                  rows: [
                    {
                      label: 'Naam rekeninghouder',
                      content: eMandate.senderName ?? '-',
                    },
                    {
                      label: 'IBAN rekeninghouder',
                      content: eMandate.senderIBAN ?? '-',
                    },
                  ],
                },
              ]
            : []),
          {
            label: '',
            content: eMandate.action,
          },
        ]}
      />
    </PageContentCell>
  );
}

export function AfisEMandateDetail() {
  useHTMLDocumentTitle(routeConfig.detailPageEMandate);
  const { businessPartnerIdEncrypted } = useAfisThemaData();
  const { eMandates } = useAfisBetaalVoorkeurenData(businessPartnerIdEncrypted);

  const title = 'E-Mandaat';
  const isError = false;
  const isLoading = false;
  const breadcrumbs = useThemaBreadcrumbs(themaId);
  const { id } = useParams<{ id: AfisEMandateFrontend['id'] }>();
  const eMandate = eMandates.find((mandate) => mandate.id === id);

  return (
    <ThemaDetailPagina
      title={title}
      zaak={eMandate}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={!!eMandate && <EMandate eMandate={eMandate} />}
      breadcrumbs={breadcrumbs}
    />
  );
}
