import { useEffect, useState, type FormEvent } from 'react';

import {
  Button,
  Field,
  Label,
  Paragraph,
  TextInput,
  Link,
} from '@amsterdam/design-system-react';

import { themaConfig } from './Account-thema-config.ts';
import styles from './Account.module.scss';
import type { AccountData } from '../../../../../server/services/admin/admin-account.types.ts';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import { ThemaPagina } from '../../../../components/Thema/ThemaPagina.tsx';
import { useBffApi } from '../../../../hooks/api/useBffApi.ts';
import { BFFApiUrls } from '../../config/api.ts';

function useAccountApi() {
  const api = useBffApi<AccountData>(BFFApiUrls.ACCOUNT);

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
  const { data, isLoading, isError, saveToken } = useAccountApi();
  const accountData = data?.content ?? null;
  const [jiraApiToken, setJiraApiToken] = useState('');

  useEffect(() => {
    setJiraApiToken(accountData?.jiraApiToken ?? '');
  }, [accountData?.jiraApiToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveToken(jiraApiToken);
  }

  async function handleDeleteToken() {
    setJiraApiToken('');
    await saveToken('');
  }

  const pageContentMain = (
    <PageContentCell>
      <Paragraph className="ams-mb-m">
        Laatste login: {accountData?.lastSignInDate ?? '-'}
      </Paragraph>

      <form onSubmit={handleSubmit}>
        <Field className="ams-mb-m">
          <Label htmlFor="jira-api-token">Jira API token</Label>
          <TextInput
            id="jira-api-token"
            name="jiraApiToken"
            value={jiraApiToken}
            onChange={(event) => {
              setJiraApiToken(event.currentTarget.value);
            }}
            autoComplete="off"
          />
          <Paragraph className="ams-mt-xs">
            <Link
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              rel="noopener noreferrer"
            >
              Maak hier eigen api token aan in Jira
            </Link>
          </Paragraph>
        </Field>

        <div className={styles.AccountActions}>
          <Button type="submit" disabled={isLoading}>
            Opslaan
          </Button>
          <Button
            type="button"
            variant="secondary"
            className={styles.AccountDeleteButton}
            disabled={isLoading}
            onClick={handleDeleteToken}
          >
            Verwijder token
          </Button>
        </div>
      </form>

      {/* {saveState === 'SUCCESS' && (
        <Alert
          className="ams-mt-m"
          heading="Opgeslagen"
          headingLevel={2}
          severity="success"
        >
          Accountgegevens zijn bijgewerkt.
        </Alert>
      )}
      {saveState === 'ERROR' && (
        <Alert
          className="ams-mt-m"
          heading="Opslaan mislukt"
          headingLevel={2}
          severity="error"
        >
          {saveError || 'De accountgegevens konden niet worden bijgewerkt.'}
        </Alert>
      )} */}
    </PageContentCell>
  );

  return (
    <ThemaPagina
      title={themaConfig.title}
      showBreadcrumbs={false}
      isError={isError}
      isLoading={isLoading}
      id="admin-account"
      pageContentTop={null}
      pageContentMain={null}
      pageContentTopSecondary={pageContentMain}
    />
  );
}
