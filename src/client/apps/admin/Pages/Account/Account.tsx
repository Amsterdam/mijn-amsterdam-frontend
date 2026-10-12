import { useState, type FormEvent } from 'react';

import {
  Field,
  Label,
  Paragraph,
  TextInput,
  Link,
  ErrorMessage,
  Icon,
  StandaloneLink,
} from '@amsterdam/design-system-react';
import { CheckMarkIcon } from '@amsterdam/design-system-react-icons';
import { useDebouncedCallback } from 'use-debounce';

import { themaConfig } from './Account-thema-config.ts';
import type { AccountApiData } from '../../../../../server/services/admin/admin-account.types.ts';
import { PageContentCell, PageV2 } from '../../../../components/Page/Page.tsx';
import { Spinner } from '../../../../components/Spinner/Spinner.tsx';
import { useBffApi } from '../../../../hooks/api/useBffApi.ts';
import { BFFApiUrls } from '../../config/api.ts';

export function useAccountApi(fetchImmediately: boolean = false) {
  const api = useBffApi<AccountApiData>(BFFApiUrls.ACCOUNT, {
    fetchImmediately,
  });

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (jiraApiToken) {
      saveToken(jiraApiToken);
    }
  }

  const saveDebounced = useDebouncedCallback(async () => {
    if (jiraApiToken) {
      saveToken(jiraApiToken);
    }
  }, 500);

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
            placeholder={
              accountData?.jiraApiTokenSet
                ? '******'
                : 'Vul hier je Jira API token in'
            }
            onChange={(event) => {
              const tokenFromInput = event.currentTarget.value;
              setJiraApiToken(tokenFromInput);
              saveDebounced();
            }}
            autoComplete="off"
          />
          {accountData?.jiraApiTokenSet && (
            <>
              <Paragraph className="ams-mt-xs">
                Er is een token ingesteld. Vul een nieuw token in om dit te
                vervangen.
              </Paragraph>
              <StandaloneLink
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                rel="noopener noreferrer"
              >
                Maak hier eigen api token aan in Jira
              </StandaloneLink>
            </>
          )}
          {isError && (
            <ErrorMessage>Opslaan van het token is mislukt.</ErrorMessage>
          )}
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
