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
import OTPInput from 'react-otp-input';

import styles from './EmailInputAndValidation.module.scss';
import type {
  ContactgegevenSource,
  VerifyVerificationRequestResponse,
} from '../../../../../server/services/klantcontact/klantcontact-profieldienst-types.ts';
import { Spinner } from '../../../../components/Spinner/Spinner.tsx';
import { BFFApiUrls } from '../../../../config/api.ts';
import {
  sendFormPostRequest,
  useBffApi,
} from '../../../../hooks/api/useBffApi.ts';

const VERIFICATION_CODE_LENGTH = 6;

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

  const { fetch, isLoading, isError } =
    useBffApi<VerifyVerificationRequestResponse>(
      BFFApiUrls.KLANTCONTACT_CONTACTGEGEVEN_VERIFY,
      {
        fetchImmediately: false,
        sendRequest: async (url, init) => {
          return sendFormPostRequest<VerifyVerificationRequestResponse>(
            url,
            init
          ).then((response) => {
            onValidated({ otp, email });
            return response;
          });
        },
      }
    );

  const hasApiError = !isLoading && isError;

  const submit = useCallback(
    async (code: string) => {
      const isValid = validateCodeFormat(code);
      if (isValid) {
        fetch({ payload: { email, code } });
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
        <OTPInput
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
              disabled={isLoading}
              type="text"
            />
          )}
        />
      </Field>
      {isLoading ? (
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
      <Paragraph id="description2">
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
  onSubmit: (formData: { email: string }, success: boolean) => void;
};

export function EmailForm({ email, onSubmit }: EmailFormProps) {
  const [emailToVerify, setEmailToVerify] = useState<string>(email);
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    setEmailToVerify(email);
  }, [email]);

  const { fetch, isLoading, isError } = useBffApi<ContactgegevenSource>(
    BFFApiUrls.KLANTCONTACT_CONTACTGEGEVEN_CREATE,
    {
      fetchImmediately: false,
      sendRequest: async (url, init) => {
        return sendFormPostRequest<ContactgegevenSource>(url, init).then(
          (response) => {
            onSubmit(
              {
                email: emailToVerify,
              },
              !!response.content?.id
            );
            return response;
          }
        );
      },
    }
  );

  // Onsubmit, send to backend and setStep to 2 OTP validation
  const submitForm: React.FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();

      if (!emailToVerify.includes('@')) {
        setIsInvalid(true);
        return;
      }

      setEmailToVerify(emailToVerify);
      fetch({ payload: { type: 'email', value: emailToVerify } });
    },
    [emailToVerify]
  );

  return (
    <form onSubmit={submitForm} name="email-adjust-form">
      <Field>
        <EmailInput
          value={emailToVerify}
          isInvalid={isInvalid}
          isError={isError}
          isLoading={isLoading}
          onChange={(e) => {
            setEmailToVerify(e.target.value);
            setIsInvalid(false);
          }}
        />
      </Field>
      {isLoading ? (
        <Paragraph>
          <Spinner /> Bezig met versturen...
        </Paragraph>
      ) : (
        <Button type="submit">Versturen</Button>
      )}
    </form>
  );
}
