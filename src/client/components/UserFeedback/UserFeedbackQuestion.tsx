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
  value?: string;
};

function UserFeedbackFormTextarea({
  question,
  value,
}: UserFeedbackQuestionProps) {
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
        value={value}
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

function UserFeedbackFormEmail({ question, value }: UserFeedbackQuestionProps) {
  return (
    <>
      <TextInput
        type="email"
        aria-describedby={`question-desc-${question?.id}`}
        id={`question-${question?.id}`}
        name={`${question?.id}`}
        value={value}
      />
      {!question?.required && (
        <Paragraph size="small">
          Als het nodig is kunnen we contact met u opnemen.
        </Paragraph>
      )}
    </>
  );
}

function UserFeedbackFormInput({ question, value }: UserFeedbackQuestionProps) {
  switch (question?.questionType) {
    // Currently only 'textarea' and 'email' are implemented
    case 'email':
      return <UserFeedbackFormEmail question={question} value={value} />;
    case 'textarea':
      return <UserFeedbackFormTextarea question={question} value={value} />;
    default:
      return null;
  }
}

export function UserFeedbackQuestion({
  question,
  value,
}: UserFeedbackQuestionProps) {
  return (
    <Field className="ams-mb-m">
      <Paragraph id={`question-desc-${question?.id}`}>
        {question?.questionText}
      </Paragraph>
      <UserFeedbackFormInput question={question} value={value} />
    </Field>
  );
}
