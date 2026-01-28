import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { InlineKTO } from './InlineKTO';
import { bffApi } from '../../../testing/utils';
import type { AppState } from '../../../universal/types/App.types';
import { componentCreator } from '../../pages/MockApp';

describe('InlineKTO Component', () => {
  const createInlineKTO = componentCreator({
    component: () => <InlineKTO userFeedbackDetails={{ foo: 'bar' }} />,
    routePath: '/',
  });

  it('should render null when there are no questions', () => {
    const InlineKTO = createInlineKTO({});
    const { container } = render(<InlineKTO />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the InlineKTO component with questions', async () => {
    const questions = [
      {
        id: 3,
        questionText: 'Wat vindt u van deze pagina?',
        description: 'Aantal sterren',
        questionType: 'numeric',
        required: false,
        maxCharacters: 5,
      },
      {
        id: 2,
        questionText: 'Heeft u nog een tip of compliment voor ons?',
        description: 'Feedback vrij invul',
        questionType: 'textarea',
        required: false,
        maxCharacters: 300,
      },
      {
        id: 1,
        questionText: 'Uw e-mailadres (niet verplicht)',
        description: 'E-mail',
        questionType: 'email',
        required: false,
        maxCharacters: 0,
      },
    ];
    const state = {
      KTO: {
        content: {
          title: 'KTO',
          description: '1',
          version: 1,
          createdAt: '2026-01-20T14:51:03.230267+01:00',
          activeFrom: '2026-01-20T14:50:40+01:00',
          uniqueCode: 'mams-inline-kto',
          questions,
        },
        status: 'OK',
      },
    } as AppState;

    const InlineKTO = createInlineKTO(state);
    const screen = render(<InlineKTO />);

    expect(screen.getByText(questions[0].questionText)).toBeInTheDocument();
    expect(
      screen.queryByText(questions[1].questionText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(questions[2].questionText)
    ).not.toBeInTheDocument();

    const user = userEvent.setup();

    await user.click(
      screen.getByRole('button', {
        name: 'Waardeer Mijn Amsterdam met 2 sterren',
      })
    );

    expect(screen.getByText(questions[1].questionText)).toBeInTheDocument();
    expect(screen.getByText(questions[2].questionText)).toBeInTheDocument();

    await user.type(screen.getAllByRole('textbox')[0], 'Great service!');
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('Great service!');

    bffApi.post('/user-feedback/collect?version=1').reply(200);

    await user.click(
      screen.getByRole('button', {
        name: 'Verstuur feedback',
      })
    );

    expect(screen.getByText('Hartelijk dank!')).toBeInTheDocument();

    questions.forEach((question) => {
      expect(screen.queryByText(question.questionText)).not.toBeInTheDocument();
    });
  });
});
