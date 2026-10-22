import { Button } from '@amsterdam/design-system-react';

import { UserFeedbackQuestion } from './UserFeedbackQuestion.tsx';
import type { SurveyFrontend } from '../../../server/services/user-feedback/user-feedback.types.ts';

type FeedbackFormProps = {
  onSubmit?: (formData: FormData) => void;
  questions?: SurveyFrontend['questions'];
  formData?: FormData;
};

export function FeedbackForm({
  onSubmit,
  questions,
  formData,
}: FeedbackFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (onSubmit) {
          const formData = new FormData(event.currentTarget);
          onSubmit(formData);
        }
      }}
    >
      {questions?.map((question) => (
        <UserFeedbackQuestion
          key={question.id}
          question={question}
          value={(formData?.get(`${question.id}`) as string) ?? undefined}
        />
      ))}

      <Button type="submit" variant="secondary">
        Verstuur feedback
      </Button>
    </form>
  );
}
