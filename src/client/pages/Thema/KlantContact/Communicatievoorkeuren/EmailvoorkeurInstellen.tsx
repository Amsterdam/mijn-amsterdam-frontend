import { generatePath, useNavigate, useParams } from 'react-router';

import { ContactgegevenType } from './CommunicatieVoorkeuren-config.ts';
import { EmailForm, EmailVerify } from './EmailInputAndValidation.tsx';
import { useSessionStorage } from '../../../../hooks/storage.hook.ts';
import { themaConfig } from '../KlantContact-thema-config.ts';

type EmailInstellenProps = {
  onFinished: (email: string) => void;
};

export function EmailInstellen({ onFinished }: EmailInstellenProps) {
  const navigate = useNavigate();
  const { step = '1' } = useParams<{
    step: string;
  }>();

  // TODO: Deze naar een hook verplaatsen en koppelen aan backend?
  const [emailLocal, setEmailLocal] = useSessionStorage(
    `standaard-email-voorkeur-instellen`,
    ''
  );

  function navigateToStep(step: '1' | '2') {
    const path = themaConfig.detailPageContactgegevenInstellen.route.path;

    navigate(
      generatePath(path, {
        step,
        contactgegeven: ContactgegevenType.Email,
        action: 'instellen',
      })
    );
  }

  return (
    <>
      {step === '1' && (
        <EmailForm
          onSubmit={({ email }, success) => {
            setEmailLocal(email); // If we reload the page after setting the email in session storage, we can prefill the email field with the previously entered value.
            if (success) {
              navigateToStep('2');
            }
          }}
          email={emailLocal}
        />
      )}
      {step === '2' && (
        <EmailVerify
          email={emailLocal}
          onValidated={({ otp, email }) => {
            setEmailLocal('');
            onFinished(email);
          }}
        />
      )}
    </>
  );
}
