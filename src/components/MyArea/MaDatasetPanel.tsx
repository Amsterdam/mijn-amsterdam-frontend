import React, { useRef, useEffect } from 'react';
import styles from './MyArea.module.scss';
import classnames from 'classnames';
import { MapDataset } from './MaDatasets';

interface DatasetPanelProps {
  id: string;
  title: string;
  datasets: MapDataset[];
  onToggleDataset?: (datasetIds: string[]) => void;
}

export function DatasetPanel({
  id,
  title,
  datasets,
  onToggleDataset,
}: DatasetPanelProps) {
  const activeDatasetIds = datasets
    .filter(dataset => dataset.isActive)
    .map(dataset => dataset.id);
  const isAllDatasetsActive = activeDatasetIds.length === datasets.length;
  const hasActiveDatasets = activeDatasetIds.length !== 0;

  function toggleDataset(datasetId: string, isActive: boolean) {
    const datasetIds = !isActive
      ? activeDatasetIds.filter(id => id !== datasetId)
      : [...activeDatasetIds, datasetId];
    onToggleDataset && onToggleDataset(datasetIds);
  }

  const checkboxRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate =
        hasActiveDatasets && !isAllDatasetsActive;
    }
  }, [checkboxRef, hasActiveDatasets, isAllDatasetsActive]);

  return (
    <div>
      <h3>{title}</h3>
      <label className={styles.MapDatasetToggleAll}>
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={isAllDatasetsActive}
          onChange={() =>
            onToggleDataset &&
            onToggleDataset(
              hasActiveDatasets ? [] : datasets.map(dataset => dataset.id)
            )
          }
        />{' '}
        {hasActiveDatasets ? 'Verberge alle lagen' : 'Toon alle lagen'}
      </label>
      <ul className={styles.MapDatasetList}>
        {datasets.map(dataset => {
          return (
            <li
              key={dataset.id}
              className={classnames(
                styles.MapDatasetListItem,
                styles[`MapDatasetListItem--${dataset.id}`]
              )}
            >
              <label
                className={classnames(
                  styles.MapDatasetListItemToggle,
                  dataset.isActive && styles.isDatasetActive
                )}
              >
                <input
                  type="checkbox"
                  checked={dataset.isActive}
                  onChange={() => toggleDataset(dataset.id, !dataset.isActive)}
                />{' '}
                {/* <img src={dataset.iconUrl} alt="" width="20" height="20" /> */}
                {dataset.title} {dataset.isLoading && '...'}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
