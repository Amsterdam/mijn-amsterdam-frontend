import { useEffect, useState } from 'react';

import {
  Accordion,
  ActionGroup,
  Button,
  Icon,
  Paragraph,
} from '@amsterdam/design-system-react';
import { CheckMarkIcon } from '@amsterdam/design-system-react-icons';

import styles from './FilterModal.module.scss';
import { Modal } from '../Modal/Modal';
import { TableMutationsFilterProps } from '../Table/TableV2.types';

type SetCurrentFiltersType = React.Dispatch<
  React.SetStateAction<TableMutationsFilterProps[]>
>;

interface FilterModalProps {
  currentFilters: TableMutationsFilterProps[];
  setCurrentFilters: SetCurrentFiltersType;
  isFilterModalOpen: boolean;
  onClose: () => void;
}

export function FilterModal({
  currentFilters,
  setCurrentFilters,
  isFilterModalOpen,
  onClose,
}: FilterModalProps) {
  const [newFilters, setNewFilters] = useState<TableMutationsFilterProps[]>([]);
  const [showRemoveAllFiltersButton, setShowRemoveAllFiltersButton] =
    useState<boolean>(false);

  const handleSelectFilterOption = (
    filterKey: TableMutationsFilterProps['key'],
    filterOption: TableMutationsFilterProps['options'][0]
  ) => {
    const updatedFilters = newFilters.map((filter) => {
      if (filter.key === filterKey) {
        return {
          ...filter,
          options: filter.options.map((option) => {
            return {
              ...option,
              selected:
                option.value === filterOption.value
                  ? !option.selected
                  : option.selected,
            };
          }),
        };
      }
      return filter;
    });
    setNewFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    setCurrentFilters(newFilters);
    onClose();
  };

  const handleRemoveAllFilters = () => {
    const updatedFilters = newFilters.map((filter) => {
      return {
        ...filter,
        options: filter.options.map((option) => {
          return {
            ...option,
            selected: false,
          };
        }),
      };
    });
    setCurrentFilters(updatedFilters);
    onClose();
  };

  useEffect(() => {
    setNewFilters(currentFilters);
  }, [currentFilters]);

  useEffect(() => {
    setShowRemoveAllFiltersButton(
      newFilters.some((filter) =>
        filter.options.some((option) => option.selected)
      )
    );
  }, [newFilters]);

  if (!isFilterModalOpen) return;

  return (
    <Modal
      title="Filters"
      isOpen={isFilterModalOpen}
      showCloseButton
      closeOnEscape
      onClose={onClose}
      pollingQuerySelector="#lijst-filter"
      actions={
        <ActionGroup>
          <Button variant="primary" onClick={handleApplyFilters}>
            Toepassen
          </Button>
          {showRemoveAllFiltersButton && (
            <Button variant="secondary" onClick={handleRemoveAllFilters}>
              Alle filters verwijderen
            </Button>
          )}
          <Button variant="tertiary" onClick={onClose}>
            Terug
          </Button>
        </ActionGroup>
      }
    >
      {newFilters.map((filter, fIndex) => {
        const amountOfOptionsSelected = filter.options.filter(
          (o) => o.selected
        ).length;

        return (
          <Accordion headingLevel={4} key={fIndex}>
            <Accordion.Section
              label={`${filter.title} ${amountOfOptionsSelected ? `(${amountOfOptionsSelected} toegepast)` : ''}`}
            >
              {filter.options.map((option, oIndex) => {
                return (
                  <div
                    key={oIndex}
                    className={styles.FilterModalOption}
                    onClick={() => handleSelectFilterOption(filter.key, option)}
                  >
                    <div className={styles.FilterModalOptionCheckbox}>
                      {option.selected && (
                        <Icon svg={CheckMarkIcon} size="small" />
                      )}
                    </div>
                    <Paragraph>{option.value}</Paragraph>
                  </div>
                );
              })}
            </Accordion.Section>
          </Accordion>
        );
      })}
    </Modal>
  );
}
