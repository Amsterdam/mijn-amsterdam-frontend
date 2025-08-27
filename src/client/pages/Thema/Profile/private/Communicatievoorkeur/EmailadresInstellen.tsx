import { useState } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';

import { EmailForm, EmailVerify } from './EmailInputAndValidation';
import { useSessionStorage } from '../../../../../hooks/storage.hook';

type MediumInstellenProps = {
  email: string;
  updateEmailValue: (email: string) => void;
};

export function EmailadresInstellen({
  email,
  updateEmailValue,
}: MediumInstellenProps) {
  const [emailLocal, setEmailLocal] = useSessionStorage(
    `emailadres`,
    email ?? ''
  );

  const [step, setStep] = useState('1');

  return (
    <>
      {step === '1' && (
        <EmailForm
          onSubmit={({ email }) => {
            setEmailLocal(email);
            setStep('2');
          }}
          email={emailLocal}
        />
      )}
      {step === '2' && (
        <EmailVerify
          email={emailLocal}
          onValidated={({ otp, email }) => {
            updateEmailValue(email);
            setEmailLocal('');
            setStep('3');
          }}
        />
      )}
      {step === '3' && <Paragraph>Klaar!</Paragraph>}
    </>
  );
}
