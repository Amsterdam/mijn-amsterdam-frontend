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
  question_type: 'text' | 'radio' | 'select' | 'checkbox';
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
export type SaveUserFeedbackResponse = { success: boolean };
export type SurveyAnswer = {
  question: number;
  answer: string;
};
export type SurveyEntry = {
  answers: SurveyAnswer[];
  entry_point: string;
  metadata: string;
};

export const userFeedbackInput = z.object({
  answers: z.string(),
  'browser.path': z.string(),
  'browser.title': z.string(),
  'browser.userAgent': z.string(),
  'browser.language': z.string(),
  'browser.screenResolution': z.string(),
  'browser.windowInnerSize': z.string(),
  'browser.timezone': z.string(),
  'ma.themas': z.string(),
  'ma.errors': z.string(),
  'ma.profileType': z.string(),
  'thema.id': z.string(),
  'thema.title': z.string(),
  'thema.details': z.string(),
});

export type UserFeedbackInput = z.infer<typeof userFeedbackInput>;

export type UserFeedback = Omit<UserFeedbackInput, 'answers'> & {
  answers: SurveyAnswer[];
};
