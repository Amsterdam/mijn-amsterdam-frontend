import React from 'react';
import { shallow } from 'enzyme';
import Pagination from './Pagination';

describe('<Pagination />', () => {
  const onPageClick = jest.fn();
  it('Renders without crashing', () => {
    shallow(
      <Pagination
        totalCount={10}
        onPageClick={onPageClick}
        pageSize={2}
        currentPage={1}
      />
    );
  });
});
