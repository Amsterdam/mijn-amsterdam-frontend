import { Heading } from '@amsterdam/design-system-react';
import type { HTMLProps, ReactNode } from 'react';
import { ComponentChildren, LinkProps } from '../../../universal/types';

import composeClassNames from 'classnames';
import { IconChevronLeft } from '../../assets/icons';
import Linkd from '../Button/Button';
import { HeadingTagName } from '../Heading/Heading';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './PageHeading.module.scss';

export interface PageHeadingProps
  extends Omit<HTMLProps<HTMLHeadingElement>, 'size'> {
  children: ComponentChildren;
  backLink?: LinkProps;
  el?: HeadingTagName;
  icon?: ReactNode;
  className?: string;
  isLoading?: boolean;
}

export default function PageHeading({
  el = 'h2',
  children,
  className,
  icon,
  backLink,
  isLoading,
  ...rest
}: PageHeadingProps) {
  const classNames = composeClassNames(
    styles.PageHeading,
    !!icon && styles.hasIcon,
    !!backLink && styles.hasBackLink,
    className
  );
  return (
    <header className={classNames} {...rest}>
      {!!icon && (
        <span aria-hidden="true" className={styles.Icon}>
          {icon}
        </span>
      )}
      <div className={styles.HeadingInner}>
        {!!backLink && (
          <Linkd
            icon={IconChevronLeft}
            className={styles.BackLink}
            href={backLink.to}
          >
            {backLink.title}
          </Linkd>
        )}
        <Heading level={2} size="level-1">
          {isLoading ? (
            <LoadingContent
              className={styles.LoadingContentHeading}
              barConfig={[['50%', '3rem', '0']]}
            />
          ) : (
            children
          )}
        </Heading>
      </div>
    </header>
  );
}
