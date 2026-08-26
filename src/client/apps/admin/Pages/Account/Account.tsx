import { useEffect, useState, type FormEvent } from 'react';

import {
  Field,
  Label,
  Paragraph,
  TextInput,
  Link,
  ErrorMessage,
  Icon,
} from '@amsterdam/design-system-react';
import { CheckMarkIcon } from '@amsterdam/design-system-react-icons';

import { themaConfig } from './Account-thema-config.ts';
import type { AccountData } from '../../../../../server/services/admin/admin-account.types.ts';
import { PageContentCell, PageV2 } from '../../../../components/Page/Page.tsx';
import { Spinner } from '../../../../components/Spinner/Spinner.tsx';
import { useBffApi } from '../../../../hooks/api/useBffApi.ts';
import { BFFApiUrls } from '../../config/api.ts';

export function useAccountApi(fetchImmediately: boolean = false) {
  const api = useBffApi<AccountData>(BFFApiUrls.ACCOUNT, { fetchImmediately });

  return {
    ...api,
    saveToken(token: string) {
      return api.fetch({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jiraApiToken: token,
        }),
      });
    },
  };
}

export function Account() {
  const { data, isLoading, isError, isDirty, saveToken } = useAccountApi(false);
  const accountData = data?.content ?? null;
  const [jiraApiToken, setJiraApiToken] = useState('');

  useEffect(() => {
    setJiraApiToken(accountData?.jiraApiToken ?? '');
  }, [accountData?.jiraApiToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveToken(jiraApiToken);
  }

  const pageContentMain = (
    <PageContentCell>
      <Paragraph className="ams-mb-m">
        Laatste login: {accountData?.lastSignInDate ?? '-'}
      </Paragraph>

      <form onSubmit={handleSubmit}>
        <Field className="ams-mb-m">
          <Label htmlFor="jira-api-token">
            Jira API token {isLoading && <Spinner />}{' '}
            {isDirty && !isError && jiraApiToken && (
              <Icon svg={CheckMarkIcon} />
            )}
          </Label>
          <TextInput
            id="jira-api-token"
            name="jiraApiToken"
            value={jiraApiToken}
            onChange={(event) => {
              const tokenFromInput = event.currentTarget.value;
              setJiraApiToken(tokenFromInput);
              saveToken(tokenFromInput);
            }}
            autoComplete="off"
          />
          {isError && (
            <ErrorMessage>Opslaan van het token is mislukt.</ErrorMessage>
          )}
          <Paragraph className="ams-mt-xs">
            <Link
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              rel="noopener noreferrer"
            >
              Maak hier eigen api token aan in Jira
            </Link>
          </Paragraph>
        </Field>
      </form>
    </PageContentCell>
  );

  return (
    <PageV2
      heading={themaConfig.title}
      showBreadcrumbs={false}
      id="admin-account"
    >
      {pageContentMain}
    </PageV2>
  );
}
