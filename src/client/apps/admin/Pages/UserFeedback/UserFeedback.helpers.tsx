import type { SurveyOverviewFrontend } from '../../../../../server/services/user-feedback/user-feedback.types.ts';
import { defaultDateTimeFormat } from '../../../../../universal/helpers/date.ts';
import type { Row } from '../../../../components/Datalist/Datalist.tsx';

const NEWLINE_SEPARATOR = encodeURIComponent('\n');

export function getCurrentPage(search: string) {
  const page = Number.parseInt(
    new URLSearchParams(search).get('page') || '1',
    10
  );
  return Number.isNaN(page) || page < 1 ? 1 : page;
}

export function calculateScore(
  entries: SurveyOverviewFrontend['entries'],
  questionIds: string[]
) {
  if (!entries.length || !questionIds.length) {
    return '0.00';
  }

  const firstQuestionId = questionIds[0];

  const { total, count } = entries.reduce(
    (acc, entry) => {
      const rating = Number.parseInt(entry.answers[firstQuestionId] || '', 10);

      if (Number.isNaN(rating)) {
        return acc;
      }

      return {
        total: acc.total + rating,
        count: acc.count + 1,
      };
    },
    { total: 0, count: 0 }
  );

  return (total / (count || 1)).toFixed(2);
}

export function getMoreInfoRows(
  entry: SurveyOverviewFrontend['entries'][number]
): Row[] {
  return [
    {
      label: 'Errors',
      content:
        entry.maErrors.length > 0 ? (
          <ul>
            {entry.maErrors.map((error, index) => (
              <li key={`${entry.id}-${error.name}-${index}`}>
                {error.name} - {error.error}
              </li>
            ))}
          </ul>
        ) : (
          '-'
        ),
    },
    {
      label: "Thema's",
      content:
        entry.maThemas.length > 0 ? (
          <ul>
            {entry.maThemas.map((thema, index) => (
              <li key={`${entry.id}-${thema}-${index}`}>{thema}</li>
            ))}
          </ul>
        ) : (
          '-'
        ),
    },
    {
      label: 'Metadata',
      content: <pre>{JSON.stringify(entry.metadata, null, 2)}</pre>,
    },
  ];
}

export function getScoreColor(score: string | undefined) {
  const scoreNumber = Number.parseFloat(score || '');
  if (Number.isNaN(scoreNumber)) {
    return 'inherit';
  }

  if (scoreNumber >= 4) {
    return 'green';
  }

  if (scoreNumber === 3) {
    return 'orange';
  }

  return 'red';
}

export function getQuestionEntries(
  questions: SurveyOverviewFrontend['survey']['questions']
): [string, string][] {
  return Object.entries(questions).sort(
    ([questionA], [questionB]) => Number(questionA) - Number(questionB)
  );
}

type BuildHandoffMailBodyProps = {
  intro: string;
  signOff: string;
  browserTitle: string;
  dateCreated: string;
  questionAnswers: Array<{ question: string; answer: string }>;
};

export function buildHandoffMailBody({
  intro,
  signOff,
  browserTitle,
  dateCreated,
  questionAnswers,
}: BuildHandoffMailBodyProps) {
  const secondAnswer = questionAnswers[1];

  const lines = [
    intro,
    '',
    `Datum: ${defaultDateTimeFormat(dateCreated)}`,
    `Pagina titel: ${browserTitle || '-'}`,
    '',
    'Inhoud van de vraag/opmerking:',
    `${secondAnswer.answer || '-- geen inhoud --'}`,
    '',
    signOff,
  ];

  return lines.join(NEWLINE_SEPARATOR);
}

type BuildMailtoLinkProps = {
  to: string;
  cc: string | null;
  subject: string;
  body: string;
};

export function buildMailtoLink({
  to,
  cc,
  subject,
  body,
}: BuildMailtoLinkProps) {
  const queryParts = [`subject=${encodeURIComponent(subject)}`, `body=${body}`];

  if (cc) {
    queryParts.push(`cc=${encodeURIComponent(cc)}`);
  }

  return `mailto:${to}?${queryParts.join('&')}`;
}
