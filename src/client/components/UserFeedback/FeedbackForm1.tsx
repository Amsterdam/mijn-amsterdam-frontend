import { Button } from '@amsterdam/design-system-react';

import { UserFeedbackQuestion } from './UserFeedbackQuestion';
import type { SurveyFrontend } from '../../../server/services/user-feedback/user-feedback.types';

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
          value={formData?.get(`${question.id}`) as string}
        />
      ))}

      <Button type="submit" variant="secondary">
        Verstuur feedback
      </Button>
    </form>
  );
}
