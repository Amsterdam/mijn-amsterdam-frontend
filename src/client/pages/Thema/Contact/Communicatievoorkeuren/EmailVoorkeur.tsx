import { useCallback, useState, type ChangeEventHandler } from 'react';

import {
  Button,
  ErrorMessage,
  Field,
  Label,
  Paragraph,
  Select,
  TextInput,
} from '@amsterdam/design-system-react';
import OtpInput from 'react-otp-input';

import { VERIFICATION_CODE_LENGTH } from './CommunicatieVoorkeuren-config';
import styles from './EmailVoorkeur.module.scss';
import type {
  CommunicatieMedium,
  Communicatievoorkeur,
} from '../../../../../server/services/contact/contact.types';
import { MaButtonInline } from '../../../../components/MaLink/MaLink';
import { Spinner } from '../../../../components/Spinner/Spinner';

function validateCodeFormat(code: string) {
  return code.split('').filter(Boolean).length === VERIFICATION_CODE_LENGTH;
}

type EmailOTPProps = {
  medium: CommunicatieMedium;
  onSubmit: (formData: { otp: string }) => void;
};

export function EmailOTP({ medium, onSubmit }: EmailOTPProps) {
  const [otp, setOtp] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const handlePaste: React.ClipboardEventHandler = (event) => {
  //   // NOTE: This method has been added in 2022 and is supported by most browsers. See also: https://caniuse.com/?search=requestSubmit
  //   formRef.current?.requestSubmit();
  // };
  const submit = useCallback(
    (otp: string) => {
      const isValid = validateCodeFormat(otp);
      if (isValid) {
        setIsSubmitting(true);
        // TODO: Make api call
        setTimeout(() => {
          setIsSubmitting(false);
          onSubmit({ otp });
        }, 1000);
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
          naar <strong>{medium.value}</strong>. Vul deze code hieronder in.
        </Paragraph>
        {isInvalid && (
          <ErrorMessage id="error">De code is niet correct.</ErrorMessage>
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

export function EmailInput({
  value,
  onChange,
  isInvalid = false,
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
      <TextInput
        aria-describedby="description2 error2"
        aria-required
        id="input3"
        invalid={isInvalid}
        size={30}
        value={value}
        placeholder="naam@domein.nl"
        onChange={onChange}
        type="text"
        name="emailToVerify"
      />
    </Field>
  );
}

type EmailSelectProps = {
  emails: string[];
  value: string;
  onChange: (email: string) => void;
};

export function EmailSelect({ emails, value, onChange }: EmailSelectProps) {
  return (
    <Select
      name="emailExisting"
      onChange={(e) => onChange(e.target.value)}
      defaultValue={value || ''}
    >
      <Select.Option value="">Kies een bestaand e-mailadres</Select.Option>
      {emails.map((email) => (
        <Select.Option key={email} value={email}>
          {email}
        </Select.Option>
      ))}
    </Select>
  );
}

type EmailFormProps = {
  medium: CommunicatieMedium;
  voorkeur: Communicatievoorkeur;
  onSubmit: (formData: { email: string; isVerified: boolean }) => void;
  emails: string[];
};

export function EmailForm({
  medium,
  voorkeur,
  onSubmit,
  emails,
}: EmailFormProps) {
  const emailValue = medium.value || '';
  const [emailToVerify, setEmailToVerify] = useState<string>('');
  const [isInvalid, setIsInvalid] = useState(false);
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

    onSubmit({ email: emailToVerify, isVerified: !isEmailToVerify });
  };

  const hasMultipleEmails =
    (!!emails.length && emails.length > 1) ||
    (emails.length === 1 && emails[0] !== emailValue);

  return (
    <>
      <Paragraph className="ams-mb-m">
        Hier kunt u uw e-mailadres doorgeven. U krijgt dan e-mails van{' '}
        {voorkeur.stakeholder} over{' '}
        {medium.description ?? 'producten en diensten'}.
      </Paragraph>
      <form onSubmit={submitForm} name="email-adjust-form">
        {hasMultipleEmails && (
          <Field className="ams-mb-m">
            <Label>Kies een bestaand e-mailadres</Label>
            <EmailSelect
              value={emailValue}
              emails={emails}
              onChange={(email) => {
                if (email) {
                  onSubmit({ email, isVerified: true });
                }
              }}
            />
          </Field>
        )}
        <Field>
          {hasMultipleEmails && <Label>Of kies een nieuw e-mailadres</Label>}
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
    </>
  );
}

type EmailValueProps = {
  medium: CommunicatieMedium;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

export function EmailValue({ medium, onClick }: EmailValueProps) {
  return (
    <>
      {medium.value ? medium.value : <em>nog niet opgegeven</em>}{' '}
      <MaButtonInline onClick={onClick}>
        {medium.isActive && medium.value ? 'Wijzigen' : 'Instellen'}
      </MaButtonInline>
    </>
  );
}
