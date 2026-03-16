import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Updated import with curly braces and the correct /ui/ path!
import { BrowseSessionsPage } from '@/components/browse-sessions-page';
import { MOCK_SESSIONS } from '@/tests/mocks/mock-sessions';
import '@testing-library/jest-dom';

// Mock the Next.js router and Web Worker
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/', // <--- We just added this fake URL!
}));

// Mock the API so the component loads sessions without a real server
// Use relative path so Jest can resolve the directory to api/index.ts
jest.mock('../api', () => {
  const { MOCK_SESSIONS } = require('./mocks/mock-sessions');
  return {
    SessionsApi: jest.fn().mockImplementation(() => ({
      listSessions: jest.fn().mockResolvedValue({ data: MOCK_SESSIONS }),
    })),
  };
});

describe('BrowseSessions Component', () => {
  beforeAll(() => {
    // Mock the Web Worker so the test doesn't crash
    window.Worker = class {
      postMessage() { }
      terminate() { }
      addEventListener() { }
      dispatchEvent() { return false; }
      onmessage = null as any;
      onerror = null as any;
    } as any;
  });

  it('renders the search bar and filter chips', async () => {
    // Updated to render the new named component
    render(<BrowseSessionsPage />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    // Wait for the API to resolve and the category chip buttons to render
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Technology' })).toBeInTheDocument();
    });
  });

  it('filters sessions when typing in the search bar', async () => {
    render(<BrowseSessionsPage />);

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
    render(<BrowseSessionsPage />);

    // Wait for sessions to load, then click the "Arts" category chip button
    const artsChip = await waitFor(() => screen.getByRole('button', { name: 'Arts' }));
    fireEvent.click(artsChip);

    await waitFor(() => {
      expect(screen.getByText('Watercolor Painting Basics')).toBeInTheDocument();
      expect(screen.queryByText('Intro to Python Programming')).not.toBeInTheDocument();
    }, { timeout: 1500 });
  });
});
