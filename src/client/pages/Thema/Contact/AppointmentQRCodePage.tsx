import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';
import { PageContentCell, PageV2 } from '../../../components/Page/Page.tsx';
import { Paragraph } from '@amsterdam/design-system-react';

import QRCode from 'react-qr-code';
import ErrorAlert from '../../../components/Alert/Alert.tsx';
import { useParams } from 'react-router';

import styles from './AppointmentQRCodePage.module.scss';

export function AppointmentQRCodePage() {
  const { id, themaConfig } = useKlantcontactData();
  const routeConfig = themaConfig.appointmentQRCode.route;
  useThemaBreadcrumbs(id);
  useHTMLDocumentTitle(routeConfig);

  const { qrcode } = useParams();

  // RP TODO: location data, replace all.
  const stadsloketName = 'PLACEHOLDER';
  const paragraphMargin = 'ams-mb-m';
  return (
    <>
      <PageV2 heading={`Uw afspraak bij stadsloket ${stadsloketName}`}>
        <PageContentCell>
          <Paragraph className={paragraphMargin}>
            {`U heeft een afspraak bij het stadsloket Stadsloket ${stadsloketName} Buikslotermeerplein 2000, 1025 XL Amsterdam.`}
          </Paragraph>
          <Paragraph className={paragraphMargin}>
            <b>{`Datum, 4 augustus 2025, 13-14 uur`}</b>
          </Paragraph>
          <Paragraph className={paragraphMargin}>
            Scan deze QR code op het stadsloket zodat de medewerker weet dat u
            op het stadsloket aanwezig bent.
          </Paragraph>
        </PageContentCell>
        <PageContentCell className={styles['center-elements']}>
          {qrcode ? (
            <QRCode value={qrcode} />
          ) : (
            <ErrorAlert>
              Er ging iets fout met het ophalen van de QRCode, probeer het later
              opnieuw.
            </ErrorAlert>
          )}
        </PageContentCell>
      </PageV2>
    </>
  );
}
