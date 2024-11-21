import type { HTMLProps, ReactNode } from 'react';

import { Heading } from '@amsterdam/design-system-react';
import composeClassNames from 'classnames';

import styles from './PageHeading.module.scss';
import { ComponentChildren, LinkProps } from '../../../universal/types';
import { IconChevronLeft } from '../../assets/icons';
import Linkd from '../Button/Button';
import LoadingContent from '../LoadingContent/LoadingContent';

export interface PageHeadingProps
  extends Omit<HTMLProps<HTMLHeadingElement>, 'size'> {
  children: ComponentChildren;
  backLink?: LinkProps;
  icon?: ReactNode;
  className?: string;
  isLoading?: boolean;
}

export default function PageHeading({
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
