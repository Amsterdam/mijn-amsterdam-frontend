import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RecoilRoot } from 'recoil';
import * as analytics from '../../hooks/analytics.hook';
import SectionCollapsible from './SectionCollapsible';

describe('<SectionCollapsible />', () => {
  const trackingSpy = jest.spyOn(analytics, 'trackEventWithProfileType');

  it('should start uncollapsed', () => {
    const { container } = render(
      <RecoilRoot>
        <SectionCollapsible
          id="test-SectionCollapsible"
          isLoading={false}
          hasItems={true}
          startCollapsed={false}
          title="test!"
        >
          <div style={{ height: 500 }}>Boohoo!</div>
        </SectionCollapsible>
      </RecoilRoot>
    );

    expect(container.querySelector('[aria-hidden=false]')).toBeInTheDocument();
    expect(screen.getByText('test!')).toBeInTheDocument();
    expect(screen.getByText('Boohoo!')).toBeInTheDocument();
  });

  it('should start collapsed', () => {
    const { container } = render(
      <RecoilRoot>
        <SectionCollapsible
          id="test-SectionCollapsible"
          isLoading={false}
          hasItems={true}
          startCollapsed={false}
          title="test!"
        >
          <div style={{ height: 500 }}>Boohoo!</div>
        </SectionCollapsible>
      </RecoilRoot>
    );

    expect(container.querySelector('[aria-hidden=true]')).toBeInTheDocument();
    expect(screen.getByText('test!')).toBeInTheDocument();
    expect(screen.getByText('Boohoo!')).toBeInTheDocument();
  });

  it('should collapse/expand when clicking the title', () => {
    const { container, getByText } = render(
      <RecoilRoot>
        <SectionCollapsible
          id="test-SectionCollapsible1"
          isLoading={false}
          hasItems={true}
          title="Click me!"
        >
          <div style={{ height: 500 }}>Boohoo!</div>
        </SectionCollapsible>
      </RecoilRoot>
    );
    expect(container.querySelector('[aria-hidden=true]')).toBeInTheDocument();
    userEvent.click(getByText('Click me!'));
    expect(container.querySelector('[aria-hidden=false]')).toBeInTheDocument();
  });

  it('should call trackEvent if tracking info is provided and section is expanded', () => {
    const { container, getByText } = render(
      <RecoilRoot>
        <SectionCollapsible
          id="test-SectionCollapsible2"
          isLoading={false}
          hasItems={true}
          track={{ category: 'the category', name: 'the content thing' }}
          title="Click me!"
        >
          <div style={{ height: 500 }}>Boohoo!</div>
        </SectionCollapsible>
      </RecoilRoot>
    );

    expect(container.querySelector('[aria-hidden=true]')).toBeInTheDocument();
    userEvent.click(getByText('Click me!'));
    expect(container.querySelector('[aria-hidden=false]')).toBeInTheDocument();
    expect(trackingSpy).toHaveBeenCalledWith(
      {
        category: 'the category',
        name: 'the content thing',
        action: 'Open klikken',
      },
      'private'
    );
  });

  it('should show title and "no items message"', () => {
    render(
      <RecoilRoot>
        <SectionCollapsible
          id="test-SectionCollapsible3"
          title="My Items"
          isLoading={false}
          hasItems={false}
          noItemsMessage="No items"
        >
          <div style={{ height: 500 }}>Boohoo!</div>
        </SectionCollapsible>
      </RecoilRoot>
    );

    expect(screen.getByText('No items')).toBeInTheDocument();
  });
});
