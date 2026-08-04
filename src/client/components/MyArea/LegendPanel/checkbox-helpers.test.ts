import { describe, it, expect } from 'vitest';

import {
  categoryCheckboxState,
  datasetCheckboxState,
  filterItemCheckboxState,
} from './checkbox-helpers.ts';
import type {
  DatasetCategory,
  DatasetFilterSelection,
} from '../../../../universal/config/myarea-datasets.ts';

describe('checkbox-helpers', () => {
  describe('categoryCheckboxState', () => {
    const category = {
      title: 'Category',
      datasets: {
        dataset1: { title: 'Dataset 1' },
        dataset2: { title: 'Dataset 2' },
      },
    } as unknown as DatasetCategory;

    it('is unchecked when no datasets are active', () => {
      expect(categoryCheckboxState(category, [])).toEqual({
        isChecked: false,
        isIndeterminate: false,
      });
    });

    it('is checked when all datasets are active', () => {
      expect(categoryCheckboxState(category, ['dataset1', 'dataset2'])).toEqual(
        {
          isChecked: true,
          isIndeterminate: false,
        }
      );
    });

    it('is indeterminate when only some datasets are active', () => {
      expect(categoryCheckboxState(category, ['dataset1'])).toEqual({
        isChecked: false,
        isIndeterminate: true,
      });
    });
  });

  describe('datasetCheckboxState', () => {
    it('is checked when the dataset id is in the active list', () => {
      expect(datasetCheckboxState('dataset1', ['dataset1'])).toEqual({
        isChecked: true,
        isIndeterminate: false,
      });
    });

    it('is not checked when the dataset id is not in the active list', () => {
      expect(datasetCheckboxState('dataset1', ['dataset2'])).toEqual({
        isChecked: false,
        isIndeterminate: false,
      });
    });
  });

  describe('filterItemCheckboxState', () => {
    const activeFilters: DatasetFilterSelection = {
      dataset1: { propertyA: { values: { valueA: 1, valueB: 2 } } },
    };

    it('is checked when the property value is in the active filter values', () => {
      expect(
        filterItemCheckboxState(
          activeFilters,
          'dataset1',
          'propertyA',
          'valueA'
        )
      ).toEqual({ isChecked: true });
    });

    it('is not checked when the property value is absent', () => {
      expect(
        filterItemCheckboxState(
          activeFilters,
          'dataset1',
          'propertyA',
          'valueC'
        )
      ).toEqual({ isChecked: false });
    });

    it('is not checked when the dataset id is not in the active filters', () => {
      expect(
        filterItemCheckboxState(
          activeFilters,
          'unknownDataset',
          'propertyA',
          'valueA'
        )
      ).toEqual({ isChecked: false });
    });
  });
});
