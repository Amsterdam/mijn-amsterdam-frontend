import { useState } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';

import { EmailForm, EmailOTP } from './EmailInputAndValidation';
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

  const [emailFormActive, setEmailFormActive] = useState(false);
  const [step, setStep] = useState('1');
  return (
    <>
      {step === '1' && (
        <EmailForm
          onSubmit={({ email, isVerified }) => {
            if (!isVerified) {
              setEmailLocal(email);
              setStep('2');
            } else {
              updateEmailValue(email);
            }
          }}
          email={emailLocal}
        />
      )}
      {step === '2' && (
        <EmailOTP
          email={emailLocal}
          onSubmit={({ otp }) => {
            updateEmailValue(emailLocal);
            setEmailLocal('');
            setStep('3');
          }}
        />
      )}
      {step === '3' && <Paragraph>Klaar!</Paragraph>}
    </>
  );
}
