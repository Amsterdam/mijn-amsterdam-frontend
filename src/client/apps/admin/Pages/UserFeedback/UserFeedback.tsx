import { useMemo } from 'react';

import {
  Link,
  Pagination,
  Paragraph,
  Table,
} from '@amsterdam/design-system-react';
import { useLocation } from 'react-router';

import { TicketControls } from './TicketControls.tsx';
import { themaConfig } from './UserFeedback-thema-config.ts';
import {
  calculateScore,
  getCurrentPage,
  getMoreInfoRows,
  getQuestionEntries,
  getScoreColor,
} from './UserFeedback.helpers.tsx';
import {
  useAdministrationStateContent,
  useUserFeedbackHandoffConfigApi,
  useUserFeedbackApi,
} from './UserFeedback.hooks.ts';
import styles from './UserFeedback.module.scss';
import type { UserFeedbackHandoffConfigResponse } from '../../../../../server/services/user-feedback/user-feedback.types.ts';
import type { SurveyOverviewFrontend } from '../../../../../server/services/user-feedback/user-feedback.types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';
import { MaRouterLink } from '../../../../components/MaLink/MaLink.tsx';
import { ModalAndButton } from '../../../../components/Modal/Modal.tsx';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import { TextClamp } from '../../../../components/TextClamp/TextClamp.tsx';
import { ThemaPagina } from '../../../../components/Thema/ThemaPagina.tsx';

function UserFeedbackTable({
  overview,
  handoffConfig,
}: {
  overview: SurveyOverviewFrontend;
  handoffConfig: UserFeedbackHandoffConfigResponse;
}) {
  const questions = overview?.survey?.questions ?? {};
  const questionEntries = getQuestionEntries(questions);
  const getAdministrationMeta = useAdministrationStateContent();

  return (
    <Table className={styles.UserFeedbackTable}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>Datum</Table.HeaderCell>
          <Table.HeaderCell>Score</Table.HeaderCell>
          <Table.HeaderCell>Comment</Table.HeaderCell>
          <Table.HeaderCell>Url</Table.HeaderCell>
          <Table.HeaderCell>E-Mail</Table.HeaderCell>
          <Table.HeaderCell>Registratie</Table.HeaderCell>
          <Table.HeaderCell>Details</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {overview.entries.map((entry) => {
          const [scoreQuestion, commentQuestion, emailQuestion] =
            questionEntries.map(([questionId]) => questionId);
          const {
            jiraTicketNumber,
            jiraTicketUrl,
            departmentName,
            departmentEmail,
          } = getAdministrationMeta(entry);
          return (
            <Table.Row key={entry.id}>
              <Table.Cell>
                <Link id={`entry-${entry.id}`} href={`#entry-${entry.id}`}>
                  <strong>{entry.id}</strong>
                </Link>
              </Table.Cell>

              <Table.Cell>{entry.dateCreatedFormatted}</Table.Cell>
              <Table.Cell>
                <strong
                  style={{
                    color: getScoreColor(entry.answers[scoreQuestion]),
                  }}
                >
                  {entry.answers[scoreQuestion] || '-'}
                </strong>
              </Table.Cell>
              <Table.Cell>
                <div className={styles.FreeTextBlock}>
                  <TextClamp tagName="span" minHeight="15px" maxHeight="55px">
                    {entry.answers[commentQuestion] || '-'}
                  </TextClamp>
                </div>
              </Table.Cell>
              <Table.Cell>
                <span className={styles.LimitedText}>{entry.entryPoint}</span>
              </Table.Cell>
              <Table.Cell>{entry.answers[emailQuestion] || '-'}</Table.Cell>
              <Table.Cell>
                {jiraTicketNumber && jiraTicketUrl && (
                  <Link href={jiraTicketUrl}>{jiraTicketNumber}</Link>
                )}
                {departmentName && departmentEmail ? (
                  <span className={styles.DepartmentInfo}>
                    Overgedragen aan: {departmentName} ({departmentEmail})
                  </span>
                ) : (
                  '-'
                )}
              </Table.Cell>
              <Table.Cell>
                <ModalAndButton
                  buttonClassName={styles.MoreInfoButton}
                  buttonLabel="Details"
                  buttonVariant="ma-link-like"
                  modal={{ title: `Details voor inzending ${entry.id}` }}
                >
                  {entry.answers[commentQuestion] && (
                    <TicketControls
                      entry={{
                        ...entry,
                        administrationMeta: getAdministrationMeta(entry),
                      }}
                      survey={overview.survey}
                      handoffConfig={handoffConfig}
                    />
                  )}
                  <Datalist rows={getMoreInfoRows(entry)} />
                </ModalAndButton>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

function UserFeedPageContent({
  overview,
  currentPage,
  handoffConfig,
}: {
  overview: SurveyOverviewFrontend;
  currentPage: number;
  handoffConfig: UserFeedbackHandoffConfigResponse;
}) {
  const entries = overview?.entries ?? [];
  const questionEntries = Object.entries(overview?.survey.questions ?? {}).sort(
    ([questionA], [questionB]) => Number(questionA) - Number(questionB)
  );
  const questionIds = questionEntries.map(([questionId]) => questionId);
  const score = calculateScore(entries, questionIds);

  const totalPages = useMemo(
    () => overview?.pageCount ?? 1,
    [overview?.pageCount]
  );
  return (
    <PageContentCell>
      <Paragraph>Totaal aantal inzendingen: {overview?.total ?? 0}</Paragraph>
      <Paragraph>
        Gemiddeld cijfer van {entries.length} inzendingen op deze pagina:{' '}
        {score}
      </Paragraph>
      <Paragraph>
        Bekijk alle aangemaakte Jira-tickets in{' '}
        <Link href={handoffConfig.issuesOverviewLink}>Jira</Link>
      </Paragraph>

      {totalPages > 1 && (
        <Pagination
          maxVisiblePages={7}
          linkTemplate={(page) => `?page=${page}`}
          linkComponent={MaRouterLink}
          page={currentPage}
          totalPages={totalPages}
        />
      )}
      <UserFeedbackTable overview={overview} handoffConfig={handoffConfig} />
    </PageContentCell>
  );
}

export function UserFeedback() {
  const location = useLocation();
  const currentPage = getCurrentPage(location.search);
  const { isLoading, isError, data } = useUserFeedbackApi(currentPage);
  const handoffConfigApi = useUserFeedbackHandoffConfigApi();
  const overview = data?.content;
  const handoffConfig = handoffConfigApi.data?.content;
  const isPageLoading = isLoading || handoffConfigApi.isLoading;
  const isPageError = isError || handoffConfigApi.isError;

  return (
    <ThemaPagina
      title={themaConfig.title}
      showBreadcrumbs={false}
      isError={isPageError}
      isLoading={isPageLoading}
      id="admin-user-feedback"
      pageContentTop={null}
      pageContentMain={
        overview && handoffConfig ? (
          <UserFeedPageContent
            currentPage={currentPage}
            overview={overview}
            handoffConfig={handoffConfig}
          />
        ) : null
      }
    />
  );
}
