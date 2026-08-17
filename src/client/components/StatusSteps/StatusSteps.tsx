import type { ReactNode } from 'react';

import {
  ActionGroup,
  Heading,
  Icon,
  OrderedList,
  ProgressList,
} from '@amsterdam/design-system-react';
import { LinkExternalIcon } from '@amsterdam/design-system-react-icons';

import styles from './StatusSteps.module.scss';
import { defaultDateFormat } from '../../../universal/helpers/date.ts';
import type {
  GenericDocument,
  StatusLineItem,
} from '../../../universal/types/App.types.ts';
import { parseHTML } from '../../helpers/html-react-parse.tsx';
import { DocumentLink } from '../DocumentList/DocumentLink.tsx';
import { MaButtonLink } from '../MaLink/MaLink.tsx';

interface StatusStepDocumentsProps {
  documents?: GenericDocument[];
  altDocumentContent?: ReactNode;
}

function getStepAriaLabel(item: StatusLineItem): string {
  if (item.isChecked && !item.isActive) {
    return 'Status Afgerond';
  }

  if (item.isActive) {
    return 'Huidige status';
  }

  return 'Toekomstige status';
}

function getStepStatus(
  item: StatusLineItem
): 'current' | 'completed' | undefined {
  if (item.isActive) {
    return 'current';
  }

  if (item.isChecked) {
    return 'completed';
  }

  return undefined;
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

function Step({
  step: item,
  isSubstep,
  showSubstepHeading = true,
  children,
}: {
  step: StatusLineItem;
  isSubstep?: boolean;
  children?: ReactNode;
  showSubstepHeading?: boolean;
}) {
  const StepComponent = isSubstep ? ProgressList.Substep : ProgressList.Step;
  return (
    <StepComponent
      key={item.id}
      heading={item.status} // Not used in substeps.
      status={getStepStatus(item)}
      className={styles.Step}
      aria-label={getStepAriaLabel(item)}
      hasSubsteps={!!item.substeps?.length}
    >
      {isSubstep && showSubstepHeading && (
        <>
          <Heading
            level={4}
            size="level-4"
            className={styles.StepSubstepStatus}
          >
            {item.status}
          </Heading>
        </>
      )}
      <time className={styles.StepStatusDate} dateTime={item.datePublished}>
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
      {children}
    </StepComponent>
  );
}

type StepsProps = {
  steps: StatusLineItem[];
  title?: string;
  showSubstepHeading?: boolean;
};

export function Steps({ steps, title, showSubstepHeading = true }: StepsProps) {
  return (
    <section>
      {title && (
        <Heading size="level-2" level={3} className="ams-mb-m">
          {title}
        </Heading>
      )}
      <ProgressList headingLevel={3} collapsible={false}>
        {steps
          .filter((step) => step.isVisible !== false)
          .map((item) => (
            <Step key={item.id} step={item}>
              {!!item.substeps?.length && (
                <ProgressList.Substeps>
                  {item.substeps
                    ?.filter((step) => step.isVisible !== false)
                    .map((substep) => (
                      <Step
                        key={substep.id}
                        step={substep}
                        isSubstep
                        showSubstepHeading={showSubstepHeading}
                      />
                    ))}
                </ProgressList.Substeps>
              )}
            </Step>
          ))}
      </ProgressList>
    </section>
  );
}
