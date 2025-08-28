import {
  useCallback,
  useEffect,
  useState,
  type ChangeEventHandler,
} from 'react';

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
import type { ApiResponse } from '../../../../../../universal/helpers/api';
import { MaRouterLink } from '../../../../../components/MaLink/MaLink';
import { Spinner } from '../../../../../components/Spinner/Spinner';
import { useDataApi } from '../../../../../hooks/api/useDataApi';

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

  const [state, send] = useDataApi<ApiResponse<{ verified: boolean }>>(
    {
      url: 'http://localhost:5000/api/v1/services/verification-request/verify',
      postpone: true,
      method: 'POST',
    },
    null
  );

  useEffect(() => {
    if (
      state.data?.content?.verified === true &&
      state.isDirty &&
      !state.isLoading
    ) {
      onValidated({ otp, email });
    }
  }, [state.isDirty, state.isLoading, state.data]);

  const hasApiError = false;

  const submit = useCallback(
    async (code: string) => {
      const isValid = validateCodeFormat(code);
      if (isValid) {
        send({ data: { email, code } });
      } else {
        setIsInvalid(true);
      }
    },
    [otp, email]
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
              disabled={state.isLoading}
              type="text"
            />
          )}
        />
      </Field>
      {state.isLoading ? (
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
  isError: boolean;
  isLoading: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

function EmailInput({
  value,
  onChange,
  isInvalid = false,
  isError = false,
  isLoading = false,
}: EmailInputProps) {
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
      {isError && (
        <ErrorMessage id="error2">
          Het e-mailadres kan nu niet geverifieerd worden.
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
        disabled={isLoading}
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

  const [state, send] = useDataApi(
    {
      url: 'http://localhost:5000/api/v1/services/verification-request/create',
      postpone: true,
      method: 'POST',
    },
    null
  );

  useEffect(() => {
    if (state.isDirty && !state.isLoading && !state.isError) {
      onSubmit({ email: emailToVerify });
    }
  }, [emailToVerify, state.isDirty, state.isLoading]);

  // Onsubmit, send to backend and setStep to 2 OTP validation
  const submitForm: React.FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();

      const isEmailToVerify = emailToVerify && emailToVerify !== emailValue;

      if (isEmailToVerify && !emailToVerify.includes('@')) {
        setIsInvalid(true);
        return;
      }

      send({ data: { email: emailToVerify } });
    },
    [emailToVerify]
  );

  return (
    <form onSubmit={submitForm} name="email-adjust-form">
      <Field>
        <EmailInput
          value={emailToVerify}
          isInvalid={isInvalid}
          isError={state.isError}
          isLoading={state.isLoading}
          onChange={(e) => {
            setEmailToVerify(e.target.value);
            setIsInvalid(false);
          }}
        />
      </Field>
      {state.isLoading ? (
        <Paragraph>
          <Spinner /> Bezig met versturen...
        </Paragraph>
      ) : (
        <Button type="submit">Versturen</Button>
      )}
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
