import { ComponentChildren, LinkProps } from '../../App.types';
import Heading, { HeadingTagName } from '../Heading/Heading';
import React, { HTMLProps } from 'react';

import { ReactComponent as CaretLeft } from '../../assets/icons/Chevron-Left.svg';
import Linkd from '../Button/Button';
import LoadingContent from '../LoadingContent/LoadingContent';
import composeClassNames from 'classnames';
import styles from './PageHeading.module.scss';

export interface PageHeadingProps
  extends Omit<HTMLProps<HTMLHeadingElement>, 'size'> {
  children: ComponentChildren;
  backLink?: LinkProps;
  el?: HeadingTagName;
  icon?: JSX.Element;
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
    !!icon && styles.HasIcon,
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
            icon={CaretLeft}
            className={styles.BackLink}
            href={backLink.to}
          >
            {backLink.title}
          </Linkd>
        )}
        {isLoading && (
          <LoadingContent
            className={styles.LoadingContentHeading}
            barConfig={[['50%', '3rem', '0']]}
          />
        )}
        <Heading el={el} size="large">
          {!isLoading && children}
        </Heading>
      </div>
    </header>
  );
}
