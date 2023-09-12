import { Heading } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { ReactNode } from 'react';
import { ComponentChildren } from '../../../universal/types';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './Section.module.scss';

export interface SectionProps {
  title?: string;
  noItemsMessage?: string | ReactNode;
  className?: string;
  isLoading?: boolean;
  track?: { category: string; name: string };
  hasItems?: boolean;
  children: ComponentChildren;
}

export default function Section({
  title = '',
  noItemsMessage = '',
  className,
  isLoading = false,
  hasItems = true,
  children,
}: SectionProps) {
  const hasTitle = !!title;
  const hasNoItemsMessage = !!noItemsMessage;
  const classes = classnames(styles.Section, className);

  return (
    <section className={classes}>
      {hasTitle && (
        <Heading
          level={3}
          size="level-3"
          className={classnames(
            styles.Title,
            hasItems && styles.TitleWithItems
          )}
        >
          {title}
        </Heading>
      )}
      {isLoading && (
        <LoadingContent
          barConfig={[
            ['auto', '2rem', '1rem'],
            ['auto', '2rem', '0'],
          ]}
        />
      )}
      {hasNoItemsMessage && !isLoading && !hasItems && (
        <p className={styles.NoItemsMessage}>{noItemsMessage}</p>
      )}
      {!isLoading && hasItems && children}
    </section>
  );
}
