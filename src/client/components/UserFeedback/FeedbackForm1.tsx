import { Button } from '@amsterdam/design-system-react';

import { UserFeedbackQuestion } from './UserFeedbackQuestion.tsx';
import type { SurveyFrontend } from '../../../server/services/user-feedback/user-feedback.types.ts';

type FeedbackForm1Props = {
  onSubmit?: (formData: FormData) => void;
  questions?: SurveyFrontend['questions'];
  formData?: FormData;
};

export function FeedbackForm1({
  onSubmit,
  questions,
  formData,
}: FeedbackForm1Props) {
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
