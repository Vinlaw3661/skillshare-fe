// __tests__/browse-sessions.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BrowseSessions from '@/app/page';
import { MOCK_SESSIONS } from '@/lib/mock-sessions';
import '@testing-library/jest-dom';

// Mock the Next.js router and Web Worker
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('BrowseSessions Component', () => {
  beforeAll(() => {
    // Mock the Web Worker so the test doesn't crash
    window.Worker = class {
      postMessage() { }
      terminate() { }
      addEventListener() { }
      dispatchEvent() { return false; }
      onmessage = null;
      onerror = null;
    } as any;
  });

  it('renders the search bar and filter chips', () => {
    render(<BrowseSessions />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('filters sessions when typing in the search bar', async () => {
    render(<BrowseSessions />);

    // Type "Python" into the search bar
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Python' } });

    // Wait for the simulated loading to finish
    await waitFor(() => {
      expect(screen.getByText('Intro to Python Programming')).toBeInTheDocument();
      // Ensure a non-matching class is hidden
      expect(screen.queryByText('Guitar for Beginners')).not.toBeInTheDocument();
    }, { timeout: 1500 });
  });

  it('filters sessions by category chip', async () => {
    render(<BrowseSessions />);

    // Click the "Arts" category chip
    const artsChip = screen.getByText('Arts');
    fireEvent.click(artsChip);

    await waitFor(() => {
      expect(screen.getByText('Watercolor Painting Basics')).toBeInTheDocument();
      expect(screen.queryByText('Intro to Python Programming')).not.toBeInTheDocument();
    }, { timeout: 1500 });
  });
});