import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EditSessionPage } from '@/components/edit-session-page'
import '@testing-library/jest-dom'

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

jest.mock('../components/navbar', () => ({
  Navbar: () => null,
}))

const mockRouterPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  usePathname: () => '/',
}))

// Replace Radix UI Select with a testable native <select>
jest.mock('../components/ui/select', () => {
  const React = require('react')
  const categories = ['Career', 'Study Skills', 'Tech', 'Design', 'Wellness', 'Languages', 'Creative']
  return {
    Select: ({ value, onValueChange }: any) =>
      React.createElement(
        'select',
        {
          'data-testid': 'category-select',
          value,
          onChange: (e: any) => onValueChange(e.target.value),
        },
        React.createElement('option', { key: '', value: '' }, 'Pick a category'),
        ...categories.map((c) =>
          React.createElement('option', { key: c, value: c }, c)
        )
      ),
    SelectTrigger: () => null,
    SelectContent: () => null,
    SelectValue: () => null,
    SelectItem: () => null,
  }
})

const mockGetSession = jest.fn()
const mockGetUser = jest.fn()
const mockUpdateSession = jest.fn()

jest.mock('../api', () => ({
  Configuration: jest.fn(),
  SessionsApi: jest.fn().mockImplementation(() => ({
    getSession: (...args: any[]) => mockGetSession(...args),
    updateSession: (...args: any[]) => mockUpdateSession(...args),
  })),
  UsersApi: jest.fn().mockImplementation(() => ({
    getUser: (...args: any[]) => mockGetUser(...args),
  })),
}))

const EDITABLE_SESSION = {
  id: 'sess-edit',
  title: 'Editable Python Session',
  description: 'An intro to Python',
  skill_category: 'Tech',
  location: 'Room 202',
  start_time: '2030-06-01T14:00:00.000Z',
  end_time: '2030-06-01T16:00:00.000Z',
  enrolled_count: 3,
  capacity: 10,
  price: 5,
  host_id: 'host-user-id',
  status: 'Open',
}

beforeEach(() => {
  localStorage.clear()
  mockRouterPush.mockReset()
  mockGetSession.mockReset().mockResolvedValue({ data: EDITABLE_SESSION })
  mockGetUser.mockReset().mockResolvedValue({ data: { id: 'host-user-id' } })
  mockUpdateSession.mockReset().mockResolvedValue({ data: {} })
})

describe('EditSessionPage', () => {
  it('shows a sign-in error when no JWT is present', async () => {
    render(<EditSessionPage sessionId="sess-edit" />)
    await waitFor(() => {
      expect(screen.getByText(/please sign in to edit sessions/i)).toBeInTheDocument()
    })
  })

  it('shows a permission error when the current user is not the host', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockResolvedValue({ data: { id: 'different-user-id' } })

    render(<EditSessionPage sessionId="sess-edit" />)

    await waitFor(() => {
      expect(
        screen.getByText(/you don't have permission to edit this session/i)
      ).toBeInTheDocument()
    })
  })

  it('pre-populates the form fields with the existing session data for the host', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')

    render(<EditSessionPage sessionId="sess-edit" />)

    await waitFor(() => {
      expect(screen.getByLabelText(/session title/i)).toHaveValue('Editable Python Session')
      expect(screen.getByLabelText(/description/i)).toHaveValue('An intro to Python')
      expect(screen.getByLabelText(/location/i)).toHaveValue('Room 202')
    })
  })

  it('shows a validation error when skill category is cleared before saving', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')

    render(<EditSessionPage sessionId="sess-edit" />)

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/session title/i)).toHaveValue('Editable Python Session')
    })

    // Clear the category via the mocked select
    fireEvent.change(screen.getByTestId('category-select'), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText(/please choose a skill category/i)).toBeInTheDocument()
    })
  })

  it('calls updateSession and shows a success message on save', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')

    render(<EditSessionPage sessionId="sess-edit" />)

    // Wait for form to pre-populate
    await waitFor(() => {
      expect(screen.getByLabelText(/session title/i)).toHaveValue('Editable Python Session')
    })

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockUpdateSession).toHaveBeenCalledWith('sess-edit', expect.any(Object))
      expect(screen.getByText('Session updated.')).toBeInTheDocument()
    })
  })

  it('shows an error message when the session fails to load', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetSession.mockRejectedValue({
      response: { data: { message: 'Session not found' } },
    })

    render(<EditSessionPage sessionId="bad-id" />)

    await waitFor(() => {
      expect(screen.getByText('Session not found')).toBeInTheDocument()
    })
  })

  it('shows an error message when the updateSession API call fails', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockUpdateSession.mockRejectedValue({
      response: { data: { message: 'Update failed' } },
    })

    render(<EditSessionPage sessionId="sess-edit" />)

    await waitFor(() => {
      expect(screen.getByLabelText(/session title/i)).toHaveValue('Editable Python Session')
    })

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument()
    })
  })
})
