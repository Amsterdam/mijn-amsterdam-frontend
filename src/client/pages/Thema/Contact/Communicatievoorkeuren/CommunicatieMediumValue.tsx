import { generatePath } from 'react-router';

import { EmailValue } from './EmailVoorkeur';
import type {
  CommunicatieMedium,
  MediumType,
} from '../../../../../server/services/contact/contact.types';
import { routeConfig } from '../Contact-thema-config';
import { AdresValue } from './AdresVoorkeur';
import { SMSValue } from './SMSVoorkeur';

type MediumValueProps = {
  medium: CommunicatieMedium;
  mediumsByType: Record<MediumType, CommunicatieMedium[]>;
};

export function MediumValue({ medium, mediumsByType }: MediumValueProps) {
  const hasMultipleEmails = mediumsByType.email.length > 1;

  switch (medium.type) {
    case 'email':
      return hasMultipleEmails ? (
        <>U heeft meerdere e-mailadressen opgegeven.</>
      ) : (
        <EmailValue
          path={generatePath(
            routeConfig.detailPageCommunicatieMediumInstellen.path,
            { medium: medium.type, step: '1' }
          )}
          medium={medium}
        />
      );
    // Add more cases for other communication mediums
    case 'postadres':
      // return <PostalMailSettingModal medium={medium} />;
      return <AdresValue medium={medium} onClick={() => {}} />;
    case 'phone':
      // return <SmsSettingModal medium={medium} />;
      return <SMSValue medium={medium} onClick={() => {}} />;
    default:
      return null;
  }
}

//  {
//    !voorkeur.settings.some((m) => m.isActive) && (
//      <Alert
//        className="ams-mb-m"
//        heading="Geen voorkeuren doorgegeven."
//        severity="warning"
//        headingLevel={4}
//      >
//        <Paragraph>
//          Er zijn op dit moment geen voorkeuren actief voor dit onderwerp.{' '}
//        </Paragraph>
//        <Paragraph>
//          Dit betekent dat wij u geen brieven, e-mails of sms-berichten sturen
//          over dit onderwerp.
//        </Paragraph>
//        <Paragraph>
//          U kunt uw voorkeuren instellen door op de <strong>Actief</strong> knop
//          te klikken.
//        </Paragraph>
//      </Alert>
//    );
//  }
