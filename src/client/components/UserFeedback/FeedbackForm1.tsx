import { useState } from 'react';

import {
  Button,
  CharacterCount,
  Field,
  Paragraph,
  TextArea,
  TextInput,
} from '@amsterdam/design-system-react';

type FeedbackForm1Props = {
  maxLength?: number;
  onSubmit?: (formData: FormData) => void;
};

export function FeedbackForm1({
  onSubmit,
  maxLength = 300,
}: FeedbackForm1Props) {
  const [characterCount, setCharacterCount] = useState(0);
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
      <Field className="ams-mb-m">
        <Paragraph id="feedbackDesc">
          Heeft u nog een tip of compliment voor ons?
        </Paragraph>
        <TextArea
          aria-describedby="feedbackDesc"
          id="feedback"
          onChange={(e) => {
            e.stopPropagation();

            setCharacterCount(e.currentTarget.value.length);
          }}
          maxLength={maxLength}
          name="feedback"
        />
        <CharacterCount length={characterCount} maxLength={maxLength} />
      </Field>
      <Field className="ams-mb-s">
        <Paragraph id="emailDesc">Uw e-mailadres (niet verplicht)</Paragraph>
        <TextInput
          type="email"
          aria-describedby="emailDesc"
          id="email"
          name="email"
        />
        <Paragraph size="small">
          Als het nodig is kunnen we contact met u opnemen.
        </Paragraph>
      </Field>
      <Button type="submit" variant="secondary">
        Verstuur feedback
      </Button>
    </form>
  );
}
