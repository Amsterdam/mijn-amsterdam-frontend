import { useState } from 'react';

import { Checkbox, Field, Paragraph } from '@amsterdam/design-system-react';

import { EmailadresInstellen } from './EmailadresInstellen';
import { CollapsiblePanel } from '../../../../../components/CollapsiblePanel/CollapsiblePanel';
import { MaButtonInline } from '../../../../../components/MaLink/MaLink';

export function Communicatievoorkeur() {
  // Get from API
  const email_ = '';
  const [email, setEmail] = useState(email_);
  const hasEmail = !!email;
  const [isChecked, setIsChecked] = useState(hasEmail);

  function updateEmailValue(email: string) {
    // Send to API
    setEmail(email);
  }

  return (
    <CollapsiblePanel title="Communicatievoorkeur" startCollapsed={true}>
      <>
        <Paragraph className="ams-mb-m">
          Wilt u uw post van de gemeente over uw{' '}
          <strong>WMO voorzieningen</strong> digitaal ontvangen? U ontvangt uw
          post <strong>ook</strong> in papieren vorm.
        </Paragraph>
        <Field style={{ flexDirection: 'row' }}>
          <Checkbox
            id="email"
            checked={isChecked}
            onChange={() => {
              updateEmailValue('');
              setIsChecked(!isChecked);
            }}
          >
            Ja, ik wil mijn post digitaal ontvangen
          </Checkbox>
        </Field>
        {isChecked && !hasEmail && (
          <EmailadresInstellen
            email={email}
            updateEmailValue={updateEmailValue}
          />
        )}
        {hasEmail && isChecked && (
          <Paragraph className="ams-mb-m">
            Uw e-mailadres is: <strong>{email}</strong>{' '}
            <MaButtonInline
              onClick={() => {
                updateEmailValue('');
              }}
            >
              Wijzigen
            </MaButtonInline>
          </Paragraph>
        )}
      </>
    </CollapsiblePanel>
  );
}
