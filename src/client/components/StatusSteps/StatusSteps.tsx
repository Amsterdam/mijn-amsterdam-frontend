import { ReactNode } from 'react';

import {
  ActionGroup,
  Heading,
  Icon,
  OrderedList,
} from '@amsterdam/design-system-react';
import {
  CheckmarkIcon,
  ExternalLinkIcon,
} from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';

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

type StatusIndicationProps = {
  step: StatusLineItem;
};

function StatusIndication({ step }: StatusIndicationProps) {
  let content: ReactNode = '';
  let ariaLabel: string = 'Toekomstige status';

  if (step.isChecked && !step.isActive) {
    ariaLabel = 'Status Afgerond';
    content = (
      <Icon
        size="heading-6"
        className={styles.StatusIndicationCheckmark}
        aria-label="Status Afgerond"
        svg={CheckmarkIcon}
      />
    );
  } else if (step.isActive) {
    ariaLabel = 'Huidige status';
  }

  return (
    <span aria-label={ariaLabel} className={styles.StepStatusIndication}>
      {content}
    </span>
  );
}

type StepsProps = {
  steps: StatusLineItem[];
  title?: string;
};

export function Steps({ steps, title }: StepsProps) {
  return (
    <div className={styles.Steps}>
      {title && (
        <Heading size="level-2" level={3} className="ams-mb-m">
          {title}
        </Heading>
      )}
      <OrderedList className={styles.StepsList} markers={false}>
        {steps.map((item) => (
          <OrderedList.Item
            className={classNames(
              styles.Step,
              item.isChecked && !item.isActive && styles['Step--checked'],
              item.isActive && styles['Step--active']
            )}
            key={item.id + item.datePublished}
          >
            <Heading className={styles.StepStatus} level={4}>
              <StatusIndication step={item} />
              {item.status}
            </Heading>
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
                        <Icon svg={ExternalLinkIcon} size="heading-5" />
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
          </OrderedList.Item>
        ))}
      </OrderedList>
    </div>
  );
}
