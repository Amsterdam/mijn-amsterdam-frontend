import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { Alert, Button, Paragraph } from '@amsterdam/design-system-react';
import { useNavigate, useParams } from 'react-router';

import type {
  AfisAccount,
  AfisFacturenOverviewResponse,
} from '../../../../../../server/services/afis/afis-types.ts';
import { LoadingContent } from '../../../../../components/LoadingContent/LoadingContent.tsx';
import { MaRouterLink } from '../../../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../../../components/Page/Page.tsx';
import { TableV2 } from '../../../../../components/Table/TableV2.tsx';
import type { DisplayProps } from '../../../../../components/Table/TableV2.types.ts';
import {
  useBffApi,
  useBffApiStateStore,
} from '../../../../../hooks/api/useBffApi.ts';
import { useSessionStorage } from '../../../../../hooks/storage.hook.ts';
import { useAppStateStore } from '../../../../../hooks/useAppStateStore.ts';
import { generateApiUrl } from './Afis-helpers.ts';
import { getAfisAccountRoutePath, themaConfig } from './Afis-thema-config.ts';

type AfisAccountTableRow = {
  id: string;
  vestiging: ReactNode;
  aantalOpenstaandeFacturen: ReactNode;
};

const afisAccountDisplayProps: DisplayProps<AfisAccountTableRow> = {
  props: {
    vestiging: 'Vestiging',
    aantalOpenstaandeFacturen: 'Aantal openstaande facturen',
  },
};

export function getAfisAccountLabel(account: AfisAccount) {
  const name =
    account.name || (account.vestigingsnummer ? 'Vestiging' : 'Algemeen');
  return account.vestigingsnummer
    ? `${name} - ${account.vestigingsnummer}`
    : name;
}

export function useAfisAccount({
  accountFromUrl = false,
}: {
  accountFromUrl?: boolean;
} = {}) {
  const AFIS = useAppStateStore((state) => state.AFIS);
  const accounts = AFIS.content?.accounts ?? [];
  const { zakenpartnernummer } = useParams<{ zakenpartnernummer?: string }>();
  const [storedId] = useSessionStorage<string | null>(
    `afis-account:${AFIS.content?.selectionKey ?? 'legacy'}`,
    null
  );
  const isAccountRoute =
    accountFromUrl && (accounts.length > 0 || !!zakenpartnernummer);
  const accountOnUrl = accounts.find(
    (option) => option.id === zakenpartnernummer
  );
  const account = isAccountRoute
    ? (accountOnUrl ??
      (!zakenpartnernummer && accounts.length === 1 ? accounts[0] : undefined))
    : (accounts.find((option) => option.id === storedId) ??
      accounts.find(
        (option) =>
          option.businessPartnerIdEncrypted ===
          AFIS.content?.businessPartnerIdEncrypted
      ));

  const businessPartnerIdEncrypted =
    account?.businessPartnerIdEncrypted ??
    (isAccountRoute ? null : AFIS.content?.businessPartnerIdEncrypted) ??
    null;
  const isDefault = isAccountRoute
    ? !!account &&
      businessPartnerIdEncrypted === AFIS.content?.businessPartnerIdEncrypted
    : businessPartnerIdEncrypted === AFIS.content?.businessPartnerIdEncrypted;
  const url = !isDefault
    ? generateApiUrl(businessPartnerIdEncrypted, 'AFIS_FACTUREN_OVERVIEW')
    : null;
  const api = useBffApi<AfisFacturenOverviewResponse>(url, {
    fetchImmediately: false,
  });
  const fetchOverview = api.fetch;

  useEffect(() => {
    if (url) {
      const state = useBffApiStateStore.getState().get(url);
      if (!state?.isDirty && !state?.isLoading) {
        fetchOverview();
      }
    }
  }, [url, fetchOverview]);

  return {
    AFIS,
    account,
    accounts,
    businessPartnerIdEncrypted,
    facturen: isDefault
      ? (AFIS.content?.facturen ?? null)
      : (api.data?.content ?? null),
    isLoading: !!account && !isDefault && (api.isLoading || api.isPristine),
    isError:
      (!!account && !isDefault && api.isError) ||
      (!!zakenpartnernummer &&
        isAccountRoute &&
        !!AFIS.content &&
        !accountOnUrl),
    retry: () => api.fetch(),
    response: isDefault ? AFIS : api.data,
    isAccountSelected: !isAccountRoute || !!account,
    isAccountRoute,
    zakenpartnernummer,
    isAccountInvalid:
      !!zakenpartnernummer && isAccountRoute && !!AFIS.content && !accountOnUrl,
  };
}

function AfisAccountOpenFacturenCount({
  account,
  defaultAccountReference,
  defaultFacturen,
}: {
  account: AfisAccount;
  defaultAccountReference: string | null | undefined;
  defaultFacturen: AfisFacturenOverviewResponse | null | undefined;
}) {
  const isDefaultAccount =
    account.businessPartnerIdEncrypted === defaultAccountReference;
  const defaultCount = defaultFacturen?.open?.count;
  const hasDefaultCount = typeof defaultCount === 'number';
  const useDefaultCount = isDefaultAccount && hasDefaultCount;
  const url = useDefaultCount
    ? null
    : generateApiUrl(
        account.businessPartnerIdEncrypted,
        'AFIS_FACTUREN_OVERVIEW'
      );
  const api = useBffApi<AfisFacturenOverviewResponse>(url, {
    fetchImmediately: false,
  });
  const fetchOverview = api.fetch;

  useEffect(() => {
    if (url) {
      const state = useBffApiStateStore.getState().get(url);
      if (!state?.isDirty && !state?.isLoading) {
        fetchOverview();
      }
    }
  }, [url, fetchOverview]);

  if (useDefaultCount) {
    return defaultCount;
  }
  if (api.isError) {
    return 'Niet beschikbaar';
  }
  if (api.isLoading || api.isPristine) {
    return <span aria-live="polite">Laden...</span>;
  }

  return api.data?.content?.open?.count ?? 'Niet beschikbaar';
}

export function AfisAccountSelector() {
  const navigate = useNavigate();
  const {
    AFIS,
    accounts,
    isLoading,
    isError,
    retry,
    isAccountRoute,
    zakenpartnernummer,
  } = useAfisAccount({ accountFromUrl: true });

  useEffect(() => {
    if (isAccountRoute && accounts.length === 1 && !zakenpartnernummer) {
      navigate(
        getAfisAccountRoutePath(themaConfig.route.path, accounts[0].id),
        { replace: true }
      );
    }
  }, [accounts, isAccountRoute, navigate, zakenpartnernummer]);

  const showAccountTable = accounts.length > 1 && !zakenpartnernummer;
  if (!showAccountTable && !isLoading && !isError) {
    return null;
  }

  const rows: AfisAccountTableRow[] = accounts.map((option) => ({
    id: option.id,
    vestiging: (
      <MaRouterLink
        maVariant="fatNoUnderline"
        title={`Bekijk facturen van ${getAfisAccountLabel(option)}`}
        href={getAfisAccountRoutePath(themaConfig.route.path, option.id)}
      >
        {getAfisAccountLabel(option)}
      </MaRouterLink>
    ),
    aantalOpenstaandeFacturen: (
      <AfisAccountOpenFacturenCount
        account={option}
        defaultAccountReference={AFIS.content?.businessPartnerIdEncrypted}
        defaultFacturen={AFIS.content?.facturen}
      />
    ),
  }));

  return (
    <PageContentCell>
      <div className="ams-mb-m">
        {showAccountTable && (
          <TableV2
            caption="Kies een vestiging"
            items={rows}
            displayProps={afisAccountDisplayProps}
          />
        )}
        {isLoading && <LoadingContent />}
        {isError && (
          <Alert
            severity="warning"
            heading="Gegevens niet beschikbaar"
            headingLevel={2}
          >
            <Paragraph>
              Wij kunnen de gegevens van deze vestiging nu niet tonen.
            </Paragraph>
            <Button variant="secondary" onClick={retry}>
              Opnieuw proberen
            </Button>
          </Alert>
        )}
      </div>
    </PageContentCell>
  );
}
