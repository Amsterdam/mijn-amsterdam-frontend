import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import UserFeedback from './UserFeedback';

describe('UserFeedback Component', () => {
  it('should render the feedback form', () => {
    render(<UserFeedback />);

    expect(screen.getByLabelText(/feedback/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should call the submit handler when the form is submitted', () => {
    const mockSubmitHandler = vi.fn();
    render(<UserFeedback onSubmit={mockSubmitHandler} />);

    const feedbackInput = screen.getByLabelText(/feedback/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(feedbackInput, { target: { value: 'Great app!' } });
    fireEvent.click(submitButton);

    expect(mockSubmitHandler).toHaveBeenCalledWith('Great app!');
  });

  it('should display an error message for empty feedback submission', () => {
    render(<UserFeedback />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/feedback cannot be empty/i)).toBeInTheDocument();
  });
});
