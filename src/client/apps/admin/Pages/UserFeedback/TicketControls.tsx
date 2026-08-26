import { useState } from 'react';

import {
  ActionGroup,
  Button,
  Heading,
  Link,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';

import {
  buildMailtoLink,
  buildHandoffMailBody,
  getQuestionEntries,
} from './UserFeedback.helpers.tsx';
import { useJiraTicketApi } from './UserFeedback.hooks.ts';
import type {
  SurveyOverviewFrontend,
  UserFeedbackHandoffConfigResponse,
} from '../../../../../server/services/user-feedback/user-feedback.types.ts';
import { Spinner } from '../../../../components/Spinner/Spinner.tsx';

type TicketControlsProps = {
  entry: SurveyOverviewFrontend['entries'][number];
  survey: SurveyOverviewFrontend['survey'];
  handoffConfig: UserFeedbackHandoffConfigResponse;
};

export function TicketControls({
  entry,
  survey,
  handoffConfig,
}: TicketControlsProps) {
  const [showDepartments, setShowDepartments] = useState(false);
  const ticketApi = useJiraTicketApi(entry.id);

  const hasHandoffDestination = !!(
    entry.administrationMeta?.departmentName ||
    entry.administrationMeta?.departmentEmail
  );

  function handleDeleteTicket() {
    ticketApi.deleteApi.fetch();
  }

  function handleCreateTicket() {
    const questionAnswers = getQuestionEntries(survey.questions).map(
      ([questionId, question]) => ({
        question,
        answer: entry.answers[questionId] || '-',
      })
    );

    ticketApi.createApi.fetch({
      payload: {
        surveyTitle: survey.title || 'User feedback',
        entryPoint: entry.entryPoint,
        dateCreated: entry.dateCreated,
        questionAnswers,
      },
    });
  }

  function handleHandoffToDepartment(department: {
    name: string;
    email: string;
  }) {
    const questionAnswers = getQuestionEntries(survey.questions).map(
      ([questionId, question]) => ({
        question,
        answer: entry.answers[questionId] || '-',
      })
    );

    const emailBody = buildHandoffMailBody({
      intro: handoffConfig.emailIntro,
      signOff: handoffConfig.emailSignOff,
      browserTitle: entry.browserTitle,
      dateCreated: entry.dateCreated,
      questionAnswers,
    });

    const mailToLink = buildMailtoLink({
      to: department.email,
      cc: handoffConfig.ccEmail,
      subject: `Mijn Amsterdam melding - entry ${entry.id}`,
      body: emailBody,
    });

    ticketApi.handoffDepartmentApi.fetch({
      keepalive: true,
      payload: {
        departmentName: department.name,
        departmentEmail: department.email,
      },
    });

    window.location.href = mailToLink;
    setShowDepartments(false);
  }

  function handleResetHandoff() {
    ticketApi.handoffDepartmentApi.fetch({
      keepalive: true,
      payload: {
        departmentName: null,
        departmentEmail: null,
      },
    });
    setShowDepartments(false);
  }

  const isDeleting = ticketApi.deleteApi.isLoading;
  const isCreating = ticketApi.createApi.isLoading;
  const isHandingOff = ticketApi.handoffDepartmentApi.isLoading;
  const hasErrorDeleting = ticketApi.deleteApi.isError;
  const hasErrorCreating = ticketApi.createApi.isError;
  const hasErrorHandingOff = ticketApi.handoffDepartmentApi.isError;

  return (
    <div>
      <ActionGroup className="ams-mb-l">
        {entry.administrationMeta?.jiraTicketNumber ? (
          <Button
            variant="secondary"
            onClick={handleDeleteTicket}
            disabled={isDeleting}
          >
            Verwijder ticket referentie
          </Button>
        ) : (
          <Button onClick={handleCreateTicket} disabled={isCreating}>
            Maak ticket aan in Jira
          </Button>
        )}
        {hasHandoffDestination ? (
          <Button
            variant="secondary"
            onClick={handleResetHandoff}
            disabled={isHandingOff}
          >
            Verwijder doorstuurreferentie
          </Button>
        ) : (
          <Button
            variant="secondary"
            disabled={isHandingOff}
            onClick={() => {
              setShowDepartments((current) => !current);
            }}
          >
            Stuur door
          </Button>
        )}
      </ActionGroup>
      {showDepartments && (
        <div className="ams-mb-xl">
          <Heading size="level-3" level={3} className="ams-mb-xs">
            Afdeling kiezen
          </Heading>
          <Paragraph className="ams-mb-s">
            Kies een afdeling om de inzending naar door te sturen. Er wordt een
            e-mail geopend in je standaard e-mailprogramma met de gegevens van
            de inzending.
          </Paragraph>
          <UnorderedList className="ams-mb-s">
            {handoffConfig.departments.map((department, index) => (
              <UnorderedList.Item key={`${department.email}-${index}`}>
                <Link
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    handleHandoffToDepartment(department);
                  }}
                  title={department.email}
                >
                  {department.name}
                </Link>{' '}
              </UnorderedList.Item>
            ))}
          </UnorderedList>
        </div>
      )}
      {(isCreating ||
        isDeleting ||
        isHandingOff ||
        hasErrorCreating ||
        hasErrorDeleting ||
        hasErrorHandingOff) && (
        <Paragraph className="ams-mb-s">
          {(isCreating || isDeleting || isHandingOff) && (
            <>
              <Spinner /> Bezig met {isCreating && 'aanmaken'}
              {isDeleting && 'verwijderen'}
              {isHandingOff && 'overdragen'} van ticket...
            </>
          )}
          {hasErrorDeleting && (
            <>
              Fout bij het verwijderen van de ticketreferentie. Probeer het
              opnieuw.
            </>
          )}
          {hasErrorCreating && (
            <>
              Fout bij het aanmaken van de ticketreferentie. Probeer het
              opnieuw.
            </>
          )}
          {hasErrorHandingOff && (
            <>
              Fout bij het doorsturen van de ticketreferentie. Probeer het
              opnieuw.
            </>
          )}
        </Paragraph>
      )}
    </div>
  );
}
