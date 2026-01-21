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
export type SurveyFrontend = CamelCasedPropertiesDeep<Survey>;
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
  browser_path: z.string(),
  browser_title: z.string(),
  browser_userAgent: z.string(),
  browser_language: z.string(),
  browser_screenResolution: z.string(),
  browser_windowInnerSize: z.string(),
  browser_timezone: z.string(),
  ma_themas: z.string(),
  ma_errors: z.string().optional(),
  ma_profileType: z.string(),
  thema_id: z.string(),
  thema_title: z.string(),
  thema_details: z.string().optional(),
});

export type UserFeedbackInput = z.infer<typeof userFeedbackInput>;

export type UserFeedback = Omit<UserFeedbackInput, 'answers'> & {
  answers: SurveyAnswer[];
};
