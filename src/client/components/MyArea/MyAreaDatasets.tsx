import React from 'react';
import { useDatasetControlItems } from './MyAreaDatasetControl';

export default function MyAreaDatasets() {
  const datasetControlItems = useDatasetControlItems();

  return (
    <ul
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 44444,
      }}
    >
      {datasetControlItems.map((item) => (
        <li>
          {item.title}{' '}
          <div>
            {item.datasets
              .filter((dataset) => dataset.isActive)
              .map((dataset) => (
                <>
                  {dataset.title}
                  <br />
                </>
              ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
