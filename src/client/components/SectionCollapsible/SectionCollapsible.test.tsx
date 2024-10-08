import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoilRoot } from 'recoil';
import { describe, expect, it } from 'vitest';

import SectionCollapsible from './SectionCollapsible';

describe('<SectionCollapsible />', () => {
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

  it('should collapse/expand when clicking the title', async () => {
    const user = userEvent.setup();

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
    await user.click(getByText('Click me!'));
    expect(container.querySelector('[aria-hidden=false]')).toBeInTheDocument();
  });

  it('should call trackEvent if tracking info is provided and section is expanded', async () => {
    const user = userEvent.setup();

    const { container, getByText } = render(
      <RecoilRoot>
        <SectionCollapsible
          id="test-SectionCollapsible2"
          isLoading={false}
          hasItems={true}
          title="Click me!"
        >
          <div style={{ height: 500 }}>Boohoo!</div>
        </SectionCollapsible>
      </RecoilRoot>
    );

    expect(container.querySelector('[aria-hidden=true]')).toBeInTheDocument();
    await user.click(getByText('Click me!'));
    expect(container.querySelector('[aria-hidden=false]')).toBeInTheDocument();
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
