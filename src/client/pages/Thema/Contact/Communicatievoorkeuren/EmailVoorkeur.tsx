import { useCallback, useState } from 'react';

import {
  Button,
  ErrorMessage,
  Field,
  Label,
  Paragraph,
  TextInput,
} from '@amsterdam/design-system-react';
import OtpInput from 'react-otp-input';

import styles from './EmailVoorkeur.module.scss';
import type {
  CommunicatieMedium,
  Communicatievoorkeur,
} from '../../../../../server/services/contact/contact.types';
import { MaButtonInline } from '../../../../components/MaLink/MaLink';
import { Spinner } from '../../../../components/Spinner/Spinner';

function validateCodeFormat(code: string) {
  return code.split('').filter(Boolean).length === 4;
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
          Wij hebben een code met 4 cijfers gestuurd naar{' '}
          <strong>{medium.value}</strong>. Vul deze code hieronder in.
        </Paragraph>
        {isInvalid && (
          <ErrorMessage id="error">De code is niet correct.</ErrorMessage>
        )}
        <OtpInput
          value={otp}
          onChange={(x) => {
            setOtp(x);
            setIsInvalid(false);
            const isValid = validateCodeFormat(x);
            if (isValid) {
              submit(x);
            }
          }}
          numInputs={4}
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
  medium: CommunicatieMedium;
  voorkeur: Communicatievoorkeur;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
};

export function EmailInput({ medium, voorkeur, onSubmit }: EmailInputProps) {
  const [email, setEmail] = useState<string>(medium.value || '');
  const [isInvalid, setIsInvalid] = useState(false);
  // Onsubmit, send to backend and setStep to 2 OTP validation
  const submitForm: React.FormEventHandler<HTMLFormElement> = (event) => {
    if (!email || !email.includes('@')) {
      event.preventDefault();
      setIsInvalid(true);
      return;
    }
    onSubmit(event);
  };
  return (
    <>
      <Paragraph className="ams-mb-m">
        Hier kunt u uw e-mailadres doorgeven. U krijgt dan E-mails van{' '}
        {voorkeur.stakeholder} over{' '}
        {medium.description ?? 'producten en diensten'}. - {medium.value} -
      </Paragraph>
      <form onSubmit={submitForm} name="email-adjust-form">
        <Field invalid={isInvalid} className="ams-mb-m">
          <Paragraph id="description2" size="small">
            Zorg ervoor dat u een geldig e-mailadres invult. U ontvangt een code
            op dit e-mailadres. De code moet u straks invullen.
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
            value={email}
            placeholder="naam@domein.nl"
            onChange={(e) => {
              setEmail(e.target.value);
              setIsInvalid(false);
            }}
            type="text"
            name="email"
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
