import { useMemo } from 'react';
import type { ReactNode } from 'react';

import {
  Link,
  Pagination,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { useLocation } from 'react-router';

import { TicketControls } from './TicketControls.tsx';
import { themaConfig } from './UserFeedback-thema-config.ts';
import {
  calculateScore,
  getCurrentPage,
  getMoreInfoRows,
  getQuestionIdByType,
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
import { DataView } from '../../../../components/DataView/DataView.tsx';
import { MaRouterLink } from '../../../../components/MaLink/MaLink.tsx';
import { ModalAndButton } from '../../../../components/Modal/Modal.tsx';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import { TextClamp } from '../../../../components/TextClamp/TextClamp.tsx';
import { ThemaPagina } from '../../../../components/Thema/ThemaPagina.tsx';

type UserFeedbackTableRow = {
  title?: string;
  id: number;
  entry: ReactNode;
  date: string;
  score: ReactNode;
  comment: ReactNode;
  url: ReactNode;
  email: ReactNode;
  errors: ReactNode;
  registration: ReactNode;
  details: ReactNode;
};

function UserFeedbackTable({
  overview,
  handoffConfig,
}: {
  overview: SurveyOverviewFrontend;
  handoffConfig: UserFeedbackHandoffConfigResponse;
}) {
  const questionTypes = overview.survey.questionTypes;
  const scoreQuestion = getQuestionIdByType(questionTypes, [
    'numeric',
    'number',
  ]);
  const commentQuestion = getQuestionIdByType(questionTypes, [
    'textarea',
    'text',
  ]);
  const emailQuestion = getQuestionIdByType(questionTypes, ['email']);
  const getAdministrationMeta = useAdministrationStateContent();

  const items: UserFeedbackTableRow[] = overview.entries.map((entry) => {
    const { jiraTicketNumber, jiraTicketUrl, departmentName, departmentEmail } =
      getAdministrationMeta(entry);
    const score = scoreQuestion ? entry.answers[scoreQuestion] : undefined;
    const comment = commentQuestion
      ? entry.answers[commentQuestion]
      : undefined;
    const email = emailQuestion ? entry.answers[emailQuestion] : undefined;

    return {
      id: entry.id,
      entry: entry.id,
      date: entry.dateCreatedFormatted,
      score: (
        <strong
          style={{
            color: getScoreColor(score),
          }}
        >
          {score || '-'}
        </strong>
      ),
      comment: (
        <div className={styles.FreeTextBlock}>
          <TextClamp tagName="span" minHeight="15px" maxHeight="55px">
            {comment || '-'}
          </TextClamp>
        </div>
      ),
      url: <span className={styles.LimitedText}>{entry.entryPoint}</span>,
      email: email || '-',
      errors:
        entry.maErrors.length > 0 ? (
          <UnorderedList id={styles.ErrorList} size="small">
            {entry.maErrors.map((error, index) => (
              <UnorderedList.Item key={`${entry.id}-${error.name}-${index}`}>
                {error.name}: {error.error}
              </UnorderedList.Item>
            ))}
          </UnorderedList>
        ) : (
          '-'
        ),
      registration: (
        <>
          {jiraTicketNumber && jiraTicketUrl && (
            <Link href={jiraTicketUrl}>{jiraTicketNumber}</Link>
          )}
          {departmentName && departmentEmail && (
            <span className={styles.DepartmentInfo}>
              Overgedragen aan: {departmentName} ({departmentEmail})
            </span>
          )}
        </>
      ),
      details: (
        <ModalAndButton
          buttonClassName={styles.MoreInfoButton}
          buttonLabel="Details"
          buttonVariant="ma-link-like"
          modal={{ title: `Details voor inzending ${entry.id}` }}
        >
          {comment && (
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
      ),
    };
  });

  return (
    <DataView<UserFeedbackTableRow>
      className={styles.UserFeedbackTable}
      items={items}
      displayProps={{
        props: {
          entry: 'ID',
          date: 'Datum',
          score: 'Score',
          comment: 'Comment',
          url: 'Url',
          email: 'E-mail',
          errors: 'Errors',
          registration: 'Registratie',
          details: 'Details',
        },
        enableMobileListView: true,
        colWidths: {
          large: ['5%', '9%', '6%', '16%', '14%', '12%', '12%', '18%', '8%'],
          small: ['5%', '9%', '6%', '16%', '14%', '12%', '20%', '18%', '8%'],
        },
      }}
    />
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
  const scoreQuestion = getQuestionIdByType(overview.survey.questionTypes, [
    'numeric',
    'number',
  ]);
  const score = calculateScore(entries, scoreQuestion);

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
      pageLinks={[]}
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
