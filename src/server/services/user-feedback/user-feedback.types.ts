import type { CamelCasedPropertiesDeep } from 'type-fest';
import z from 'zod';

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
    | 'number';
  required: boolean;
  conditions_type: 'and' | 'or';
  default: string;
  orientation: 'horizontal' | 'vertical';
  min_characters: number;
  max_characters: number;
};

export type Survey = {
  questions: SurveyQuestion[];
  version: number;
  created_at: string;
  active_from: string;
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
export type SurveyEntry = {
  answers: SurveyAnswer[];
  entry_point: string;
  metadata: object;
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
  maErrors: z.string().optional(),
  maProfileType: z.string(),
  pageTitle: z.string(),
  pageDetails: z.string().optional(),
});

export type UserFeedbackInput = z.infer<typeof userFeedbackInput>;

export type UserFeedback = Omit<UserFeedbackInput, 'answers'> & {
  answers: SurveyAnswer[];
};
