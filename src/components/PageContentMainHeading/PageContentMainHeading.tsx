import React, { HTMLProps } from 'react';
import styles from './PageContentMainHeading.module.scss';
import composeClassNames from 'classnames';
import Heading, { HeadingTagName } from 'components/Heading/Heading';
import { ComponentChildren, LinkProps } from 'App.types';
import { IconButtonLink } from 'components/ButtonLink/ButtonLink';
import { ReactComponent as CaretLeft } from 'assets/images/Chevron-Left.svg';
import LoadingContent from 'components/LoadingContent/LoadingContent';

export interface PageContentMainHeadingProps
  extends Omit<HTMLProps<HTMLHeadingElement>, 'size'> {
  children: ComponentChildren;
  backLink?: LinkProps;
  el?: HeadingTagName;
  icon?: JSX.Element;
  className?: any;
  isLoading?: boolean;
}

export default function PageContentMainHeading({
  el = 'h2',
  children,
  className,
  icon,
  backLink,
  isLoading,
  ...rest
}: PageContentMainHeadingProps) {
  const classNames = composeClassNames(
    styles.PageContentMainHeading,
    !!icon && styles.HasIcon,
    className
  );
  return (
    <Heading el={el} size="large" className={classNames} {...rest}>
      {!!icon && (
        <span aria-hidden="true" className={styles.Icon}>
          {icon}
        </span>
      )}
      <span className={styles.HeadingInner}>
        {!!backLink && (
          <IconButtonLink className={styles.BackLink} to={backLink.to}>
            <CaretLeft aria-hidden="true" /> {backLink.title}
          </IconButtonLink>
        )}
        {isLoading && (
          <LoadingContent
            className={styles.LoadingContentHeading}
            barConfig={[['50%', '3rem', '0']]}
          />
        )}
        {!isLoading && children}
      </span>
    </Heading>
  );
}
