import { useState } from 'react';

import { Button, Heading, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import { FeedbackForm1 } from './FeedbackForm1';
import { Rating } from './Rating';
import styles from './UserFeedback.module.scss';
import type { SurveyFrontend } from '../../../server/services/user-feedback/user-feedback.types';

type UserFeedbackProps = {
  onSubmit: (formData: FormData) => void;
  className?: string;
  onRate?: (rating: number) => void;
  questions: SurveyFrontend['questions'];
};

export function UserFeedback({
  onSubmit,
  onRate,
  className,
  questions,
}: UserFeedbackProps) {
  const [rated, setRated] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const isRated = !!rated;
  const [ratingQuestion, ...otherQuestions] = questions || [];

  function onSubmit_(formData: FormData) {
    formData.append(`${ratingQuestion.id}`, rated.toString());
    onSubmit(formData);
    setIsSubmitted(true);
  }

  function onRate_(rating: number) {
    setRated(rating);
    onRate?.(rating);
  }

  function reset() {
    setIsSubmitted(false);
    setRated(0);
  }

  return (
    <div className={classNames(styles.UserFeedback, className)}>
      {!isSubmitted && (
        <Rating
          current={rated}
          onRate={onRate_}
          max={ratingQuestion.maxCharacters}
          disabled={isSubmitted}
          label={ratingQuestion.questionText}
        />
      )}
      {isSubmitted ? (
        <>
          <Heading level={4}>Hartelijk dank!</Heading>
          <Paragraph>
            Wij ontwikkelen Mijn Amsterdam voor én met de Amsterdammer. Wij zijn
            daarom erg blij met uw feedback.
          </Paragraph>{' '}
          <Button variant="secondary" onClick={() => reset()}>
            Sluiten
          </Button>
        </>
      ) : (
        isRated && (
          <FeedbackForm1 onSubmit={onSubmit_} questions={otherQuestions} />
        )
      )}
    </div>
  );
}
