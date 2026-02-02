import { ReactNode } from 'react';

import {
  ActionGroup,
  Heading,
  Icon,
  OrderedList,
  ProgressList,
} from '@amsterdam/design-system-react';
import { LinkExternalIcon } from '@amsterdam/design-system-react-icons';

import styles from './StatusSteps.module.scss';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  GenericDocument,
  StatusLineItem,
} from '../../../universal/types/App.types';
import { parseHTML } from '../../helpers/html-react-parse';
import { DocumentLink } from '../DocumentList/DocumentLink';
import { MaButtonLink } from '../MaLink/MaLink';

interface StatusStepDocumentsProps {
  documents?: GenericDocument[];
  altDocumentContent?: ReactNode;
}

export function StatusStepDocuments({
  documents = [],
  altDocumentContent,
}: StatusStepDocumentsProps) {
  return (
    <>
      {!!altDocumentContent && typeof altDocumentContent === 'string'
        ? parseHTML(altDocumentContent)
        : altDocumentContent}
      {!!documents?.length && (
        <OrderedList className={styles.StepDocumentsList} markers={false}>
          {documents.map((document) => (
            <OrderedList.Item key={document.id}>
              <DocumentLink key={document.id} document={document} />
            </OrderedList.Item>
          ))}
        </OrderedList>
      )}
    </>
  );
}

type StepsProps = {
  steps: StatusLineItem[];
  title?: string;
};

export function Steps({ steps, title }: StepsProps) {
  return (
    <section>
      {title && (
        <Heading size="level-2" level={3} className="ams-mb-m">
          {title}
        </Heading>
      )}

      <ProgressList headingLevel={3}>
        {steps.map((item) => (
          <ProgressList.Step
            key={item.id}
            heading={item.status}
            status={
              item.isActive
                ? 'current'
                : item.isChecked
                  ? 'completed'
                  : undefined
            }
            className={styles.Step}
            aria-label={
              item.isChecked && !item.isActive
                ? 'Status Afgerond'
                : item.isActive
                  ? 'Huidige status'
                  : 'Toekomstige status'
            }
          >
            <time
              className={styles.StepStatusDate}
              dateTime={item.datePublished}
            >
              {defaultDateFormat(item.datePublished)}
            </time>
            {item.description && (
              <div>
                {parseHTML(item.description)}
                {!!item.actionButtonItems?.length && (
                  <ActionGroup className={styles.PanelActionGroup}>
                    {item.actionButtonItems.map(({ to, title }) => (
                      <MaButtonLink key={to} href={to} variant="secondary">
                        {title}
                        <Icon svg={LinkExternalIcon} size="heading-5" />
                      </MaButtonLink>
                    ))}
                  </ActionGroup>
                )}
              </div>
            )}
            {!!(item.altDocumentContent || item.documents?.length) && (
              <StatusStepDocuments
                documents={item.documents}
                altDocumentContent={item.altDocumentContent}
              />
            )}
          </ProgressList.Step>
        ))}
      </ProgressList>
    </section>
  );
}
