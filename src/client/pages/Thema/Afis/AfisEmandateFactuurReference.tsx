import { Alert, Paragraph } from '@amsterdam/design-system-react';

import {
  EMANDATE_STATUS_ACTIVE,
  type AfisFactuurFrontend,
} from './Afis-thema-config.ts';
import { useAfisEMandatesApi } from './useAfisEmandatesApi.tsx';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types.ts';
import type { Row, RowSet } from '../../../components/Datalist/Datalist.tsx';
import { MaRouterLink } from '../../../components/MaLink/MaLink.tsx';

export function AfisEmandateFactuurReference({
  eMandate,
}: {
  eMandate: AfisEMandateFrontend;
}) {
  return (
    <MaRouterLink
      href={`${eMandate.link.to}${eMandate.status !== EMANDATE_STATUS_ACTIVE ? '#eerdere-emandaten' : ''}`}
    >
      {eMandate.eMandateIdSource}
    </MaRouterLink>
  );
}

function AfisEmandateFactuurStatus({
  eMandate,
}: {
  eMandate: AfisEMandateFrontend;
}) {
  return eMandate.status !== EMANDATE_STATUS_ACTIVE &&
    eMandate.dateValidToFormatted
    ? `Niet actief - gestopt op ${eMandate.dateValidToFormatted}.`
    : `Actief sinds ${eMandate.dateValidFromFormatted}.`;
}

export function useAfisEmandateFactuurReferenceContent(
  eMandateId?: AfisFactuurFrontend['eMandateId'],
  factuur?: AfisFactuurFrontend
): null | Array<RowSet | Row> {
  const { eMandates } = useAfisEMandatesApi();
  if (!eMandateId || !factuur) {
    return null;
  }
  let eMandate: AfisEMandateFrontend | null =
    eMandates.find(
      (mandate) =>
        mandate.eMandateIdSource === eMandateId ||
        mandate.history.some(
          (historyItem) => historyItem.eMandateIdSource === eMandateId
        )
    ) ?? null;

  if (eMandate !== null && eMandate?.eMandateIdSource !== eMandateId) {
    const eMandateHistoric = eMandate.history.find(
      (historyItem) => historyItem.eMandateIdSource === eMandateId
    );
    eMandate = {
      ...eMandate,
      ...eMandateHistoric,
    };
  }
  return [
    {
      rows: [
        {
          label: 'Incassomachtiging kenmerk',
          content: eMandate ? (
            <AfisEmandateFactuurReference eMandate={eMandate} />
          ) : (
            eMandateId
          ),
        },
        {
          label: 'Incassomachtiging status',
          content: eMandate ? (
            <AfisEmandateFactuurStatus eMandate={eMandate} />
          ) : (
            'Niet meer actief'
          ),
        },
      ],
      isVisible: !!eMandateId,
    },
    {
      isVisible: !eMandate || eMandate?.status !== EMANDATE_STATUS_ACTIVE,
      label: <span className="ams-visually-hidden">Betalingswijze</span>,
      content: (
        <Alert heading="Handmatig betalen" headingLevel={4} severity="warning">
          <Paragraph>
            De incassomachtiging voor deze factuur is niet meer actief.
            <br />
            Maak het bedrag van {factuur.amountOriginalFormatted} over onder
            vermelding van de gegevens op uw factuur.
          </Paragraph>
        </Alert>
      ),
    },
  ];
}
