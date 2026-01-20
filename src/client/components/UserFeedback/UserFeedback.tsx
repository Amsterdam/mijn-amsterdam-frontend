import { useState } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import { FeedbackForm1 } from './FeedbackForm1';
import { Rating } from './Rating';
import styles from './UserFeedback.module.scss';

type UserFeedbackProps = {
  onSubmit: (formData: FormData) => void;
  className?: string;
};

export function UserFeedback({ onSubmit, className }: UserFeedbackProps) {
  const [rated, onRate] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const isRated = !!rated;

  function onSubmit_(formData: FormData) {
    formData.append('rating', rated.toString());
    onSubmit(formData);
    setIsSubmitted(true);
  }

  return (
    <div className={classNames(styles.UserFeedback, className)}>
      {!isSubmitted && (
        <Rating
          current={rated}
          onRate={onRate}
          max={5}
          disabled={isSubmitted}
          label="Wat vindt u van deze pagina?"
        />
      )}
      {isSubmitted ? (
        <>
          <Heading level={4}>Hartelijk dank!</Heading>
          <Paragraph>
            Wij ontwikkelen Mijn Amsterdam voor én met de Amsterdammer. Wij zijn
            daarom erg blij met uw feedback.
          </Paragraph>
        </>
      ) : (
        isRated && <FeedbackForm1 onSubmit={onSubmit_} />
      )}
    </div>
  );
}
