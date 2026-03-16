// tests/session-card.test.tsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { SessionCard } from '@/components/session-card';
import { MOCK_SESSIONS } from './mocks/mock-sessions';

// Mock the Next.js Link component to prevent routing errors in the test
jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => {
    return <a>{children}</a>;
  };
});

describe('SessionCard Core Component', () => {
  // Grab the fake session and attach Vinlaw's new required backend fields
  const sampleSession = {
    ...MOCK_SESSIONS[0],
    host_id: "test-user-123",
    status: "published",
    created_at: new Date().toISOString()
  } as any;

  it('renders the session title and category correctly', () => {
    render(<SessionCard session={sampleSession} />);
    
    // Assert that the title and category render on the screen
    expect(screen.getByText(sampleSession.title)).toBeInTheDocument();
    expect(screen.getByText(sampleSession.skill_category)).toBeInTheDocument();
  });

  it('displays the correct price or Free badge', () => {
    render(<SessionCard session={sampleSession} />);
    
    if (sampleSession.price === 0) {
      expect(screen.getByText(/Free/i)).toBeInTheDocument();
    } else {
      expect(screen.getByText(`$${sampleSession.price}`)).toBeInTheDocument();
    }
  });
});