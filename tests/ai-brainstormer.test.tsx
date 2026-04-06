import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIBrainstormer } from '../components/ui/ai-brainstormer';
import '@testing-library/jest-dom';

// Mock the scrollIntoView function since it doesn't exist in the Jest virtual DOM
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('AIBrainstormer Component (Advanced Feature)', () => {
  it('renders the initial AI greeting', () => {
    render(<AIBrainstormer />);
    expect(screen.getByText(/Hi! I'm your SkillShare AI Assistant/i)).toBeInTheDocument();
  });

  it('allows the user to type and submit a message', async () => {
    render(<AIBrainstormer />);
    
    // Find the input and the send button
    const input = screen.getByPlaceholderText(/Ask about a requirement.../i);
    const submitButton = screen.getByRole('button');

    // Simulate the user typing a message
    fireEvent.change(input, { target: { value: 'I have an algorithm requirement' } });
    expect(input).toHaveValue('I have an algorithm requirement');

    // Simulate clicking send
    fireEvent.click(submitButton);

    // Verify the user's message was added to the chat window
    expect(screen.getByText('I have an algorithm requirement')).toBeInTheDocument();

    // Verify the input is cleared after sending
    expect(input).toHaveValue('');
  });
});