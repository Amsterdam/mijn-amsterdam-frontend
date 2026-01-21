import { useState } from 'react';

import {
  Field,
  Paragraph,
  TextArea,
  CharacterCount,
  TextInput,
} from '@amsterdam/design-system-react';

import type { SurveyFrontend } from '../../../server/services/user-feedback/user-feedback.types';

type UserFeedbackQuestionProps = {
  question?: SurveyFrontend['questions'][number];
};

function UserFeedbackFormTextarea({ question }: UserFeedbackQuestionProps) {
  const [characterCount, setCharacterCount] = useState(0);
  return (
    <>
      <TextArea
        aria-describedby={`question-desc-${question?.id}`}
        id={`question-${question?.id}`}
        onChange={(e) => {
          e.stopPropagation();
          setCharacterCount(e.currentTarget.value.length);
        }}
        maxLength={question?.maxCharacters}
        name={`${question?.id}`}
      />
      {!!question?.maxCharacters && (
        <CharacterCount
          length={characterCount}
          maxLength={question?.maxCharacters}
        />
      )}
    </>
  );
}

function UserFeedbackFormEmail({ question }: UserFeedbackQuestionProps) {
  return (
    <>
      <TextInput
        type="email"
        aria-describedby={`question-desc-${question?.id}`}
        id={`question-${question?.id}`}
        name={`${question?.id}`}
      />
      {!question?.required && (
        <Paragraph size="small">
          Als het nodig is kunnen we contact met u opnemen.
        </Paragraph>
      )}
    </>
  );
}

function UserFeedbackFormInput({ question }: UserFeedbackQuestionProps) {
  switch (question?.questionType) {
    // Currently only 'textarea' and 'email' are implemented
    case 'email':
      return <UserFeedbackFormEmail question={question} />;
    case 'textarea':
      return <UserFeedbackFormTextarea question={question} />;
    default:
      return null;
  }
}

export function UserFeedbackQuestion({ question }: UserFeedbackQuestionProps) {
  return (
    <Field className="ams-mb-m">
      <Paragraph id={`question-desc-${question?.id}`}>
        {question?.questionText}
      </Paragraph>
      <UserFeedbackFormInput question={question} />
    </Field>
  );
}
