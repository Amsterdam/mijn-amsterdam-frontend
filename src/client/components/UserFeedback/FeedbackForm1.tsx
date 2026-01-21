import { Button } from '@amsterdam/design-system-react';

import { UserFeedbackQuestion } from './UserFeedbackQuestion';
import type { SurveyFrontend } from '../../../server/services/user-feedback/user-feedback.types';

type FeedbackForm1Props = {
  onSubmit?: (formData: FormData) => void;
  questions?: SurveyFrontend['questions'];
};

export function FeedbackForm1({ onSubmit, questions }: FeedbackForm1Props) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.log('submit feedback form');
        if (onSubmit) {
          const formData = new FormData(event.currentTarget);
          onSubmit(formData);
        }
      }}
    >
      {questions?.map((question) => (
        <UserFeedbackQuestion key={question.id} question={question} />
      ))}

      <Button type="submit" variant="secondary">
        Verstuur feedback
      </Button>
    </form>
  );
}
