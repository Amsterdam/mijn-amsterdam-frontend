import type { AfisFactuurFrontend } from './Afis-thema-config.ts';
import { useAfisEMandatesApi } from './useAfisEmandatesApi.tsx';
import { CheckStatus } from './useAfisEMandatesSignRequest.tsx';
import type { RowSet } from '../../../components/Datalist/Datalist.tsx';
import { MaRouterLink } from '../../../components/MaLink/MaLink.tsx';

function AfisEmandateFactuurReference({
  eMandateId,
}: {
  eMandateId?: AfisFactuurFrontend['eMandateId'];
}) {
  const { eMandates } = useAfisEMandatesApi();
  const eMandate = eMandates.find(
    (mandate) => mandate.eMandateIdSource === eMandateId
  );

  return eMandate ? (
    <>
      Afdeling {eMandate.detailLinkComponent} met kenmerk{' '}
      <MaRouterLink href={eMandate.link.to}>{eMandateId}</MaRouterLink>.
    </>
  ) : (
    eMandateId
  );
}

function AfisEmandateFactuurStatus({
  eMandateId,
}: {
  eMandateId?: AfisFactuurFrontend['eMandateId'];
}) {
  const { eMandates } = useAfisEMandatesApi();
  const eMandate = eMandates.find(
    (mandate) => mandate.eMandateIdSource === eMandateId
  );

  return eMandate ? (
    <>
      <CheckStatus eMandate={eMandate} />
      {eMandate.status !== '1' &&
        eMandate.dateValidToFormatted &&
        `, gestopt op ${eMandate.dateValidToFormatted}.`}
    </>
  ) : (
    'Niet actief'
  );
}

export function useAfisEmandateFactuurReferenceContent(
  eMandateId?: AfisFactuurFrontend['eMandateId']
): null | RowSet {
  if (!eMandateId) {
    return null;
  }
  return {
    // label: 'E-Mandaat voor automatische incasso',
    rows: [
      {
        label: 'E-Mandaat kenmerk',
        content: eMandateId ? (
          <AfisEmandateFactuurReference eMandateId={eMandateId} />
        ) : null,
      },
      {
        label: 'E-Mandaat status',
        content: eMandateId ? (
          <AfisEmandateFactuurStatus eMandateId={eMandateId} />
        ) : null,
      },
    ],
    isVisible: !!eMandateId,
  };
}
