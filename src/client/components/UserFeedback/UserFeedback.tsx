import { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  Heading,
  Paragraph,
} from '@amsterdam/design-system-react';
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
  notSent?: boolean;
};

export function UserFeedback({
  onSubmit,
  onRate,
  className,
  questions,
  notSent,
}: UserFeedbackProps) {
  const [rated, setRated] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const isRated = !!rated;
  const [ratingQuestion, ...otherQuestions] = questions || [];
  const [formData, setFormData] = useState<FormData>(new FormData());

  useEffect(() => {
    if (notSent) {
      setIsSubmitted(false);
    }
  }, [notSent]);

  function onSubmit_(formData: FormData) {
    formData.append(`${ratingQuestion.id}`, rated.toString());
    setFormData(formData);
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
    setFormData(new FormData());
  }

  return (
    <div className={classNames(styles.UserFeedback, className)}>
      {notSent && (
        <Alert
          severity="warning"
          className="ams-mb-m"
          heading="Verzenden mislukt"
          headingLevel={2}
        >
          <Paragraph className="ams-text-danger ams-mb-m">
            Er is iets misgegaan bij het verzenden van uw feedback. Probeer het
            later nog een keer.
          </Paragraph>
        </Alert>
      )}
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
          <FeedbackForm1
            onSubmit={onSubmit_}
            questions={otherQuestions}
            formData={formData}
          />
        )
      )}
    </div>
  );
}
