import { useEffect, useState } from 'react';

import { Checkbox, Field, Paragraph } from '@amsterdam/design-system-react';

import { EmailadresInstellen } from './EmailadresInstellen';
import type { ContactResponse } from '../../../../../../server/services/contact/contact-route-handlers';
import { type ApiResponse_DEPRECATED } from '../../../../../../universal/helpers/api';
import { CollapsiblePanel } from '../../../../../components/CollapsiblePanel/CollapsiblePanel';
import LoadingContent from '../../../../../components/LoadingContent/LoadingContent';
import { MaButtonInline } from '../../../../../components/MaLink/MaLink';
import { useDataApi } from '../../../../../hooks/api/useDataApi';

export function Communicatievoorkeur() {
  const [contactUpdateApi, updateApiEmailValue_] =
    useDataApi<ApiResponse_DEPRECATED<{ ok: boolean }> | null>(
      {
        postpone: true,
        url: 'http://localhost:5000/api/v1/services/contact/update',
        method: 'POST',
        withCredentials: true,
      },
      null
    );

  const [contactApi, refetchContactApi] =
    useDataApi<ApiResponse_DEPRECATED<ContactResponse> | null>(
      {
        url: 'http://localhost:5000/api/v1/services/contact',
        withCredentials: true,
      },
      { content: null, status: 'PRISTINE' }
    );

  const [doVerify, setDoVerify] = useState(false);
  const email = contactApi.data?.content?.email ?? null;
  const hasEmail = !!email;
  const [isChecked, setIsChecked] = useState(hasEmail);

  function updateEmailValue(email: string) {
    // Send to State via Zorgned API
    updateApiEmailValue_({ data: { email } });
  }

  useEffect(() => {
    if (contactUpdateApi.data?.content?.ok === true) {
      setDoVerify(false);
      refetchContactApi();
    }
  }, [contactUpdateApi.data?.content?.ok]);

  useEffect(() => {
    if (email) {
      setIsChecked(true);
      setDoVerify(false);
    }
  }, [email]);

  return (
    <CollapsiblePanel title="Communicatievoorkeur" startCollapsed={true}>
      <>
        <Paragraph className="ams-mb-m">
          Wilt u uw post van de gemeente over uw{' '}
          <strong>WMO voorzieningen</strong> digitaal ontvangen? U ontvangt uw
          post <strong>ook</strong> in papieren vorm.
        </Paragraph>
        {contactApi.isLoading && <LoadingContent />}
        {!contactApi.isLoading && (
          <>
            <Field style={{ flexDirection: 'row' }}>
              <Checkbox
                id="email"
                checked={isChecked}
                onChange={() => {
                  const isChecked_ = !isChecked;
                  setIsChecked(isChecked_);
                  if (isChecked_) {
                    setDoVerify(true);
                  } else {
                    updateEmailValue(''); // Unsubscribe
                  }
                }}
              >
                Ja, ik wil mijn post digitaal ontvangen
              </Checkbox>
            </Field>
            {isChecked && doVerify && (
              <EmailadresInstellen updateEmailValue={updateEmailValue} />
            )}
            {hasEmail && isChecked && !doVerify && (
              <Paragraph className="ams-mb-m">
                Uw e-mailadres is: <strong>{email}</strong>{' '}
                <MaButtonInline
                  onClick={() => {
                    setDoVerify(true);
                  }}
                >
                  Wijzigen
                </MaButtonInline>
              </Paragraph>
            )}
          </>
        )}
      </>
    </CollapsiblePanel>
  );
}
