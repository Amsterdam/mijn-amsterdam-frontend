import React, { useState, type ReactNode } from 'react';

import { Button, UnorderedList } from '@amsterdam/design-system-react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';

import styles from './ListExpandable.module.scss';

interface ListExpandableProps<T> {
  items: T[]; // The list of items to display
  initialVisibleCount?: number; // Number of items to show initially
  renderItem?: (item: T, index: number) => React.ReactNode; // Template for rendering each item
  expandButtonText?: ReactNode; // Customizable text for the expand button
  collapseButtonText?: ReactNode; // Customizable text for the collapse button
  className?: string; // Optional className for the container
}

const INITIAL_COUNT = 5;

export function ListExpandable<T>({
  items,
  initialVisibleCount = INITIAL_COUNT,
  renderItem = (item) => <>{item}</>,
  expandButtonText = 'Toon meer',
  collapseButtonText = 'Toon minder',
  className = '',
}: ListExpandableProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const visibleItems = isExpanded ? items : items.slice(0, initialVisibleCount);

  return (
    <div className={className}>
      <UnorderedList
        className={classNames(
          styles.ListExpandable,
          items.length > initialVisibleCount ? 'ams-mb-s' : ''
        )}
      >
        {visibleItems.map((item, index) => (
          <UnorderedList.Item key={index}>
            {renderItem(item, index)}
          </UnorderedList.Item>
        ))}
      </UnorderedList>
      {items.length > initialVisibleCount && (
        <Button
          variant="secondary"
          onClick={toggleExpand}
          icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
        >
          {isExpanded ? collapseButtonText : expandButtonText}
        </Button>
      )}
    </div>
  );
}
