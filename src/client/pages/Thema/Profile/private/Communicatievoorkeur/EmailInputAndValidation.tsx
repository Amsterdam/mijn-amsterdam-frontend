import { useCallback, useState, type ChangeEventHandler } from 'react';

import {
  Button,
  ErrorMessage,
  Field,
  Label,
  Paragraph,
  TextInput,
} from '@amsterdam/design-system-react';
import OtpInput from 'react-otp-input';

import styles from './EmailInputAndValidation.module.scss';
import {
  useCreateVerificationRequest,
  useVerifyVerificationRequest,
} from './useEmailVerification';
import { MaRouterLink } from '../../../../../components/MaLink/MaLink';
import { Spinner } from '../../../../../components/Spinner/Spinner';

const VERIFICATION_CODE_LENGTH = 5;

function validateCodeFormat(code: string) {
  return code.split('').filter(Boolean).length === VERIFICATION_CODE_LENGTH;
}

type EmailVerifyProps = {
  email: string;
  onValidated: (formData: { otp: string; email: string }) => void;
};

export function EmailVerify({ email, onValidated }: EmailVerifyProps) {
  const [otp, setOtp] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { send, ...rest } = useVerifyVerificationRequest({
    url: 'http://localhost:5000/api/v1/services/verification-request/verify',
    onSuccess(data) {
      console.log('Verification successful:', data);
      onValidated({ otp, email });
      setIsSubmitting(false);
    },
  });

  console.log('rest', rest);

  const hasApiError = false;

  const submit = useCallback(
    async (code: string) => {
      const isValid = validateCodeFormat(code);
      if (isValid) {
        setIsSubmitting(true);
        send({ email, code });
      } else {
        setIsInvalid(true);
      }
    },
    [otp]
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(otp);
      }}
      name="email-adjust-form"
    >
      <Field invalid={isInvalid} className="ams-mb-m">
        <Label htmlFor="input3">Vul de code in</Label>
        <Paragraph id="description2" size="small">
          Wij hebben een code met {VERIFICATION_CODE_LENGTH} cijfers gestuurd
          naar <strong>{email}</strong>. Vul deze code hieronder in.
        </Paragraph>
        {isInvalid && (
          <ErrorMessage id="error">De code is niet correct.</ErrorMessage>
        )}
        {hasApiError && (
          <ErrorMessage id="error">
            Er is een fout opgetreden bij het checken van de code.
          </ErrorMessage>
        )}
        <OtpInput
          value={otp}
          onChange={(otp) => {
            setOtp(otp);
            setIsInvalid(false);
            const isValid = validateCodeFormat(otp);
            if (isValid) {
              submit(otp);
            }
          }}
          numInputs={VERIFICATION_CODE_LENGTH}
          containerStyle={styles.OTPContainer}
          renderSeparator={<span>-</span>}
          skipDefaultStyles
          renderInput={(props) => (
            <TextInput
              {...props}
              name="otpcode"
              invalid={isInvalid}
              disabled={isSubmitting}
              type="text"
            />
          )}
        />
      </Field>
      {isSubmitting ? (
        <Paragraph>
          <Spinner /> Bezig met controleren van de code...
        </Paragraph>
      ) : (
        <Button type="submit">Versturen</Button>
      )}
    </form>
  );
}

type EmailInputProps = {
  value: string;
  isInvalid: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

function EmailInput({ value, onChange, isInvalid = false }: EmailInputProps) {
  return (
    <Field invalid={isInvalid} className="ams-mb-m">
      <Paragraph id="description2" size="small">
        Zorg ervoor dat u een geldig e-mailadres invult. U ontvangt een code op
        dit e-mailadres. De code moet u straks invullen.
      </Paragraph>
      {isInvalid && (
        <ErrorMessage id="error2">
          Dit lijkt geen valide e-mailadres.
        </ErrorMessage>
      )}
      <TextInput
        aria-describedby="description2 error2"
        aria-required
        id="input3"
        invalid={isInvalid}
        size={26}
        value={value}
        placeholder="naam@domein.nl"
        onChange={onChange}
        type="text"
        name="emailToVerify"
      />
    </Field>
  );
}

type EmailFormProps = {
  email: string;
  onSubmit: (formData: { email: string }) => void;
};

export function EmailForm({ email, onSubmit }: EmailFormProps) {
  const emailValue = email || '';
  const [emailToVerify, setEmailToVerify] = useState<string>('');
  const [isInvalid, setIsInvalid] = useState(false);

  const { send, ...rest } = useCreateVerificationRequest({
    url: 'http://localhost:5000/api/v1/services/verification-request/create',
    onSuccess(data) {
      console.log('Creation successful:', data);
      onSubmit({ email: emailToVerify });
    },
  });

  console.log('rest', rest);

  // Onsubmit, send to backend and setStep to 2 OTP validation
  const submitForm: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);

    const emailToVerify = formData.get('emailToVerify') as string;
    const emailExisting = formData.get('emailExisting') as string;

    const isEmailToVerify = emailToVerify && emailToVerify !== emailValue;

    if (
      (isEmailToVerify && !emailToVerify.includes('@')) ||
      (!emailExisting && !emailToVerify)
    ) {
      setIsInvalid(true);
      return;
    }

    send({ email: emailToVerify });
  };

  return (
    <form onSubmit={submitForm} name="email-adjust-form">
      <Field>
        <EmailInput
          value={emailToVerify}
          isInvalid={isInvalid}
          onChange={(e) => {
            setEmailToVerify(e.target.value);
            setIsInvalid(false);
          }}
        />
      </Field>
      <Button type="submit">Versturen</Button>
    </form>
  );
}

type EmailValueProps = {
  email: string;
  path: string;
};

export function EmailValue({ email, path }: EmailValueProps) {
  return (
    <>
      {email ? email : <em>nog niet opgegeven</em>}{' '}
      <MaRouterLink href={path}>
        {email ? 'Wijzigen' : 'Instellen'}
      </MaRouterLink>
    </>
  );
}
