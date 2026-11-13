import { useEffect } from 'react';

import { Alert, Button, Label, Paragraph, Select } from '@amsterdam/design-system-react';

import type { AfisAccount, AfisFacturenOverviewResponse } from '../../../../../../server/services/afis/afis-types.ts';
import { LoadingContent } from '../../../../../components/LoadingContent/LoadingContent.tsx';
import { useBffApi, useBffApiStateStore } from '../../../../../hooks/api/useBffApi.ts';
import { useSessionStorage } from '../../../../../hooks/storage.hook.ts';
import { useAppStateStore } from '../../../../../hooks/useAppStateStore.ts';
import { generateApiUrl } from './Afis-helpers.ts';

export function getAfisAccountLabel(account: AfisAccount) {
  const name = account.name || (account.vestigingsnummer ? 'Vestiging' : 'Algemeen');
  return account.vestigingsnummer ? `${name} - ${account.vestigingsnummer}` : name;
}

export function useAfisAccount() {
  const AFIS = useAppStateStore((state) => state.AFIS);
  const accounts = AFIS.content?.accounts ?? [];
  const [storedId, setStoredId] = useSessionStorage<string | null>(
    `afis-account:${AFIS.content?.selectionKey ?? 'legacy'}`,
    null
  );
  const account = accounts.find((option) => option.id === storedId) ??
    accounts.find((option) => option.businessPartnerIdEncrypted === AFIS.content?.businessPartnerIdEncrypted);
  const businessPartnerIdEncrypted = account?.businessPartnerIdEncrypted ?? AFIS.content?.businessPartnerIdEncrypted ?? null;
  const isDefault = businessPartnerIdEncrypted === AFIS.content?.businessPartnerIdEncrypted;
  const url = !isDefault ? generateApiUrl(businessPartnerIdEncrypted, 'AFIS_FACTUREN_OVERVIEW') : null;
  const api = useBffApi<AfisFacturenOverviewResponse>(url, { fetchImmediately: false });
  const fetchOverview = api.fetch;

  useEffect(() => {
    if (url && !useBffApiStateStore.getState().has(url)) {
      fetchOverview();
    }
  }, [url, fetchOverview]);

  return {
    AFIS,
    account,
    accounts,
    businessPartnerIdEncrypted,
    selectAccount: (id: string) => {
      if (!AFIS.content?.isRestricted && accounts.some((option) => option.id === id)) {
        setStoredId(id);
      }
    },
    facturen: isDefault ? AFIS.content?.facturen ?? null : api.data?.content ?? null,
    isLoading: !isDefault && (api.isLoading || api.isPristine),
    isError: !isDefault && api.isError,
    retry: () => api.fetch(),
    response: isDefault ? AFIS : api.data,
  };
}

export function AfisAccountSelector() {
  const { AFIS, account, accounts, selectAccount, isLoading, isError, retry } = useAfisAccount();
  if (!accounts.length) {
    return null;
  }
  return (
    <div className="ams-mb-m">
      {AFIS.content?.isRestricted ? (
        <Paragraph>{account && getAfisAccountLabel(account)}</Paragraph>
      ) : (
        <>
          <Label htmlFor="afis-account">Vestiging</Label>
          <Select id="afis-account" value={account?.id ?? ''} onChange={(event) => selectAccount(event.target.value)}>
            {accounts.map((option) => <option key={option.id} value={option.id}>{getAfisAccountLabel(option)}</option>)}
          </Select>
        </>
      )}
      {isLoading && <LoadingContent />}
      {isError && (
        <Alert severity="warning" heading="Gegevens niet beschikbaar" headingLevel={2}>
          <Paragraph>Wij kunnen de gegevens van deze vestiging nu niet tonen.</Paragraph>
          <Button variant="secondary" onClick={retry}>Opnieuw proberen</Button>
        </Alert>
      )}
    </div>
  );
}