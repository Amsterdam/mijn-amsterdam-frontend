import { Alert, Link, Paragraph } from '@amsterdam/design-system-react';
import classNames from 'classnames';

import { parseHTML } from '../../helpers/html-react-parse.tsx';
import { useServiceAlerts } from '../../hooks/api/useServiceAlerts.ts';
import { PageContentCell } from '../Page/Page.tsx';
import styles from './ServiceAlerts.module.scss';

const DEFAULT_HEADING = 'Onderhoudsbericht';

interface ServiceAlertsProps {
  page?: string;
  themaID?: string;
  fromApiDirectly?: boolean;
  className?: string;
}

export function ServiceAlerts({
  page,
  themaID,
  fromApiDirectly = false,
  className,
}: ServiceAlertsProps) {
  const serviceAlerts = useServiceAlerts(page, themaID, fromApiDirectly);

  if (!serviceAlerts?.length) {
    return null;
  }

  return (
    <PageContentCell startWide={1} spanWide={12}>
      {serviceAlerts.map((serviceAlert, index) => {
        return (
          <Alert
            key={serviceAlert.title + index}
            severity={
              serviceAlert.severity === 'info'
                ? undefined
                : serviceAlert.severity
            }
            heading={serviceAlert.title || DEFAULT_HEADING}
            headingLevel={4}
            className={classNames(styles.ServiceAlert, className)}
          >
            {parseHTML(serviceAlert.description)}
            {(
              serviceAlert.links ??
              (serviceAlert.link ? [serviceAlert.link] : [])
            ).map(({ title, to }, index) => (
              <Paragraph key={`${to}-${index}`}>
                <Link href={to}>{title}</Link>
              </Paragraph>
            ))}
          </Alert>
        );
      })}
    </PageContentCell>
  );
}
