import type { CamelCasedPropertiesDeep } from 'type-fest';
import z from 'zod';

export type UserFeedbackMetaRow = {
  id: number;
  entryId: number;
  dateCreated: Date;
  dateModified: Date;
  jiraTicketNumber: string | null;
  departmentName: string | null;
  departmentEmail: string | null;
};

type SurveyQuestionChoice = {
  text: string;
  label: string;
  show_textfield: boolean;
};
type SurveyQuestionCondition = {
  value: string;
  type: 'equal' | 'not_equal' | 'contains' | 'not_contains';
  reference_question: number;
};
type SurveyQuestion = {
  id: number;
  choices: SurveyQuestionChoice[];
  conditions: SurveyQuestionCondition[];
  question_text: string;
  description: string;
  question_type:
    | 'text'
    | 'radio'
    | 'select'
    | 'checkbox'
    | 'textarea'
    | 'email'
    | 'numeric'
    | 'number';
  required: boolean;
  conditions_type: 'and' | 'or';
  default: string;
  orientation: 'horizontal' | 'vertical';
  min_characters: number;
  max_characters: number;
};

export type Survey = {
  id: string;
  questions?: SurveyQuestion[];
  version: number;
  created_at: string;
  active_from: string;
  unique_code: string;
  title: string;
  description: string;
};
export type SurveyFrontend = Prettify<
  Omit<CamelCasedPropertiesDeep<Survey>, 'questions'>
> & {
  questions: CamelCasedPropertiesDeep<
    Pick<
      SurveyQuestion,
      | 'id'
      | 'max_characters'
      | 'question_text'
      | 'question_type'
      | 'required'
      | 'description'
    >
  >[];
};
export type SaveUserFeedbackResponse = { success: boolean };
export type SurveyAnswer = {
  question: number;
  answer: string;
};
export type SurveyEntryPayload = {
  answers: SurveyAnswer[];
  entry_point: string;
  metadata: Record<string, unknown>;
};

export const userFeedbackInput = z.object({
  answers: z.string(),
  browserPath: z.string(),
  browserTitle: z.string(),
  browserUserAgent: z.string(),
  browserLanguage: z.string(),
  browserScreenResolution: z.string(),
  browserWindowInnerSize: z.string(),
  browserTimezone: z.string(),
  maThemas: z.string(),
  maMokum: z.string().optional(),
  maErrors: z.string().optional(),
  maProfileType: z.string(),
  pageTitle: z.string(),
  pageDetails: z.string().optional(),
});

export type UserFeedbackInput = z.infer<typeof userFeedbackInput>;

export type UserFeedback = Omit<UserFeedbackInput, 'answers'> & {
  answers: SurveyAnswer[];
};

export type SurveyEntry = SurveyEntryPayload & {
  id: number;
  survey_unique_code: string;
  created_at: string;
  survey_version: 1;
};

export type SurveyEntriesResponse = {
  results: SurveyEntry[];
  count: number;
  next: string | null;
  previous: string | null;
};

export type SurveyAnswerFrontend = {
  question: string;
  answer: string;
};

export type UserFeedbackAdministrationMeta = Omit<
  UserFeedbackMetaRow,
  'dateCreated' | 'dateModified'
> & {
  dateCreated: string;
  dateModified: string;
  jiraTicketUrl: string | null;
};

export type SurveyEntryFrontend = {
  id: number;
  answers: Record<
    SurveyAnswerFrontend['question'],
    SurveyAnswerFrontend['answer']
  >;
  dateCreated: string;
  dateCreatedFormatted: string;
  maErrors: {
    name: string;
    error: string;
  }[];
  maThemas: string[];
  browserTitle: string;
  metadata: Record<string, unknown>;
  entryPoint: string;
  administrationMeta: UserFeedbackAdministrationMeta | null;
};

export type FeedbackSurveyEntries = {
  entries: SurveyEntryFrontend[];
  pageCount: number;
  total: number;
};

export type SurveyOverviewFrontend = FeedbackSurveyEntries & {
  survey: {
    title: SurveyFrontend['title'];
    questions: Record<SurveyQuestion['id'], SurveyQuestion['question_text']>;
  };
};

const MAX_TICKET_BODY_FIELD_LENGTH = 1000;

export const createJiraTicketInput = z
  .object({
    entryId: z.number().int().positive(),
    surveyTitle: z.string().max(MAX_TICKET_BODY_FIELD_LENGTH),
    entryPoint: z.string().max(MAX_TICKET_BODY_FIELD_LENGTH),
    dateCreated: z.string().max(MAX_TICKET_BODY_FIELD_LENGTH),
    questionAnswers: z
      .array(
        z
          .object({
            question: z.string().max(MAX_TICKET_BODY_FIELD_LENGTH),
            answer: z.string().max(MAX_TICKET_BODY_FIELD_LENGTH),
          })
          .strict()
      )
      .min(1),
  })
  .strict();

export type CreateJiraTicketInput = z.infer<typeof createJiraTicketInput>;

export const handoffDepartmentInput = z
  .object({
    entryId: z.number().int().positive(),
    departmentName: z
      .string()
      .max(MAX_TICKET_BODY_FIELD_LENGTH)
      .nullable()
      .optional(),
    departmentEmail: z
      .string()
      .email()
      .max(MAX_TICKET_BODY_FIELD_LENGTH)
      .nullable()
      .optional(),
  })
  .strict();

export type HandoffDepartmentInput = z.infer<typeof handoffDepartmentInput>;

export type UserFeedbackHandoffDepartment = {
  name: string;
  email: string;
};

export type UserFeedbackHandoffConfigResponse = {
  departments: UserFeedbackHandoffDepartment[];
  ccEmail: string;
  emailIntro: string;
  emailSignOff: string;
  issuesOverviewLink: string;
};
