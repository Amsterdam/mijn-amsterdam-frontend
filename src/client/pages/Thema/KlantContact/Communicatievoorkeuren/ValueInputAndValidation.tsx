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

import {
  ContactgegevenByTypeLabels,
  ContactgegevenTypeEnum,
} from './CommunicatieVoorkeuren-config.ts';
import {
  useSetCommunicatievoorkeur,
  useVerifyCommunicatievoorkeur,
} from './useCommunicatieVoorkeuren.ts';
import styles from './ValueInputAndValidation.module.scss';
import { type ContactgegevenType } from '../../../../../server/services/klantcontact/klantcontact-profieldienst-types.ts';
import { Spinner } from '../../../../components/Spinner/Spinner.tsx';

const VERIFICATION_CODE_LENGTH = 6;

function validateCodeFormat(code: string) {
  return code.split('').filter(Boolean).length === VERIFICATION_CODE_LENGTH;
}

type ContactgegevenVerifyProps<V = string, T = ContactgegevenType> = {
  value: V;
  type: T;
  onVerified: (formData: { otp: string; value: V; type: T }) => void;
};

export function ContactgegevenVerify({
  value,
  type,
  onVerified,
}: ContactgegevenVerifyProps) {
  const [otp, setOtp] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);

  const { fetch, isLoading, isError } = useVerifyCommunicatievoorkeur(
    (isVerified) => {
      if (isVerified) {
        onVerified({ otp, value, type });
      }
    }
  );

  const hasApiError = !isLoading && isError;

  const submit = useCallback(
    async (code: string) => {
      const isValid = validateCodeFormat(code);
      if (isValid) {
        fetch({ payload: { value, type, code } });
      } else {
        setIsInvalid(true);
      }
    },
    [value, type, fetch]
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(otp);
      }}
      name="contactgegeven-value-form"
    >
      <Field invalid={isInvalid} className="ams-mb-m">
        <Label htmlFor="otpcode">Vul de code in</Label>
        <Paragraph id="description2" size="small">
          Wij hebben een code met {VERIFICATION_CODE_LENGTH} cijfers gestuurd
          naar <strong>{value}</strong>. Vul deze code hieronder in.
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

type ValueInputProps = {
  value: string;
  type: ContactgegevenType;
  isInvalid: boolean;
  isError: boolean;
  isLoading: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

function ValueInput({
  value,
  type,
  onChange,
  isInvalid = false,
  isError = false,
  isLoading = false,
}: ValueInputProps) {
  const typeLabel = ContactgegevenByTypeLabels[type];
  return (
    <Field invalid={isInvalid} className="ams-mb-m">
      <Paragraph id="description2">
        Zorg ervoor dat u een geldig {typeLabel} invult. U ontvangt een code op
        dit {typeLabel}. De code moet u straks invullen.
      </Paragraph>
      {isInvalid && (
        <ErrorMessage id="error2">
          Dit lijkt geen valide {typeLabel}.
        </ErrorMessage>
      )}
      {isError && (
        <ErrorMessage id="error3">
          Het {typeLabel} kan nu niet geverifieerd worden.
        </ErrorMessage>
      )}
      <TextInput
        aria-describedby="description2 error2 error3"
        aria-required
        id="input3"
        invalid={isInvalid}
        size={26}
        value={value}
        placeholder={`Vul hier uw ${typeLabel} in`}
        onChange={onChange}
        type="text"
        name="valueToVerify"
        disabled={isLoading}
      />
    </Field>
  );
}

type ContactgegevenProps<V = string, T = ContactgegevenType> = {
  value: V;
  type: T;
  onCallback: (formData: { value: V; type: T }, success: boolean) => void;
};

export function ContactgegevenForm({
  value,
  type,
  onCallback,
}: ContactgegevenProps) {
  const [valueToVerify, setValueToVerify] = useState<string>(value);
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    setValueToVerify(value);
  }, [value]);

  const { fetch, isLoading, isError } = useSetCommunicatievoorkeur(
    (_contactgegeven, success) => {
      onCallback({ value: valueToVerify, type }, success);
    }
  );

  // Onsubmit, send to backend and setStep to 2 OTP validation
  const submitForm: React.FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault();

      if (
        type === ContactgegevenTypeEnum.Email &&
        !valueToVerify.includes('@')
      ) {
        setIsInvalid(true);
        return;
      }

      setValueToVerify(valueToVerify);
      fetch({ payload: { type, value: valueToVerify } });
    },
    [valueToVerify, type]
  );

  return (
    <form onSubmit={submitForm} name="contactgegeven-value-form">
      <Field>
        <ValueInput
          value={valueToVerify}
          type={type}
          isInvalid={isInvalid}
          isError={isError}
          isLoading={isLoading}
          onChange={(e) => {
            setValueToVerify(e.target.value);
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
