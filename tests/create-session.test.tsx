import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateSessionPage } from '@/components/create-session-page'
import '@testing-library/jest-dom'

jest.mock('../components/navbar', () => ({
  Navbar: () => null,
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
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

const mockCreateSession = jest.fn()

jest.mock('../api', () => ({
  Configuration: jest.fn(),
  SessionsApi: jest.fn().mockImplementation(() => ({
    createSession: (...args: any[]) => mockCreateSession(...args),
  })),
}))

beforeEach(() => {
  localStorage.clear()
  mockCreateSession.mockReset()
})

describe('CreateSessionPage', () => {
  it('renders all required form fields', () => {
    render(<CreateSessionPage />)
    expect(screen.getByLabelText(/session title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByTestId('category-select')).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^date$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/capacity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
  })

  it('shows a validation error when no skill category is selected', async () => {
    render(<CreateSessionPage />)
    const form = screen.getByRole('button', { name: /publish session/i }).closest('form')!
    fireEvent.submit(form)
    await waitFor(() => {
      expect(
        screen.getByText(/please choose a skill category before publishing/i)
      ).toBeInTheDocument()
    })
  })

  it('shows a sign-in error when submitting without a JWT', async () => {
    render(<CreateSessionPage />)

    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'Tech' } })
    fireEvent.change(screen.getByLabelText(/^date$/i), { target: { value: '2030-06-01' } })
    const form = screen.getByRole('button', { name: /publish session/i }).closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(
        screen.getByText(/please sign in before creating a session/i)
      ).toBeInTheDocument()
    })
  })

  it('calls createSession API and shows the session URL on success', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockCreateSession.mockResolvedValue({ data: { id: 'new-sess-123' } })

    render(<CreateSessionPage />)

    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'Tech' } })
    fireEvent.change(screen.getByLabelText(/^date$/i), { target: { value: '2030-06-01' } })
    const form = screen.getByRole('button', { name: /publish session/i }).closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/session created/i)).toBeInTheDocument()
      expect(screen.getByText(/new-sess-123/)).toBeInTheDocument()
    })
  })

  it('copies the session URL to clipboard when the Copy button is clicked', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockCreateSession.mockResolvedValue({ data: { id: 'copy-sess-456' } })

    const mockWriteText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    })
    Object.defineProperty(window, 'isSecureContext', { value: true, writable: true })

    render(<CreateSessionPage />)

    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'Tech' } })
    fireEvent.change(screen.getByLabelText(/^date$/i), { target: { value: '2030-06-01' } })
    const form = screen.getByRole('button', { name: /publish session/i }).closest('form')!
    fireEvent.submit(form)

    const copyBtn = await screen.findByRole('button', { name: /copy/i })
    fireEvent.click(copyBtn)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        expect.stringContaining('copy-sess-456')
      )
    })
  })

  it('shows an error message when the createSession API call fails', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockCreateSession.mockRejectedValue({
      response: { data: { message: 'Failed to create session' } },
    })

    render(<CreateSessionPage />)

    fireEvent.change(screen.getByTestId('category-select'), { target: { value: 'Tech' } })
    fireEvent.change(screen.getByLabelText(/^date$/i), { target: { value: '2030-06-01' } })
    const form = screen.getByRole('button', { name: /publish session/i }).closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText('Failed to create session')).toBeInTheDocument()
    })
  })
})
