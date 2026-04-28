import { Paragraph } from '@amsterdam/design-system-react';
import QRCode from 'react-qr-code';
import { useParams } from 'react-router';

import styles from './AppointmentQRCodePage.module.scss';
import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import ErrorAlert from '../../../components/Alert/Alert.tsx';
import { PageContentCell, PageV2 } from '../../../components/Page/Page.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function AppointmentQRCodePage() {
  const { id, themaConfig, data } = useKlantcontactData();
  const routeConfig = themaConfig.appointmentQRCode.route;
  const breadcrumbs = useThemaBreadcrumbs(id);
  useHTMLDocumentTitle(routeConfig);

  const { qrcode } = useParams();

  const a = data?.appointments.find((a) => {
    return a.qrCode === qrcode;
  });

  const stadsloketName = a?.location.name;
  const paragraphMargin = 'ams-mb-m';
  return (
    <>
      <PageV2
        breadcrumbs={breadcrumbs}
        heading={`Uw afspraak bij stadsloket ${stadsloketName}`}
      >
        <PageContentCell>
          {a ? (
            <>
              <Paragraph className={paragraphMargin}>
                {`U heeft een afspraak bij het stadsloket Stadsloket ${stadsloketName}, ${a.location.street}, ${a.location.postalCode} ${a.location.city}.`}
              </Paragraph>
              <Paragraph className={paragraphMargin}>
                <b>{`Datum, ${a.appointmentDateFormatted}, ${a.startTime}-${a.endTime} uur`}</b>
              </Paragraph>
              <Paragraph className={paragraphMargin}>
                Scan deze QR code op het stadsloket zodat de medewerker weet dat
                u op het stadsloket aanwezig bent.
              </Paragraph>
            </>
          ) : (
            <ErrorAlert>
              Er ging iets fout met het opzoeken van uw afspraak, probeer het
              later opnieuw.
            </ErrorAlert>
          )}
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
