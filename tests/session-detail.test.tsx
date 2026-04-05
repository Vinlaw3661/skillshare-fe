import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionDetailPage } from '@/components/session-detail-page'
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

const mockCheckEnrollment = jest.fn()
const mockGetUser = jest.fn()
const mockGetUserById = jest.fn()
const mockGetEnrollees = jest.fn()
const mockGetRatings = jest.fn()
const mockCreateRating = jest.fn()
const mockEnroll = jest.fn()
const mockCancelEnrollment = jest.fn()
const mockDeleteSession = jest.fn()

jest.mock('../api', () => ({
  Configuration: jest.fn(),
  SessionsApi: jest.fn().mockImplementation(() => ({
    getSession: jest.fn().mockResolvedValue({ data: {} }),
    deleteSession: (...args: any[]) => mockDeleteSession(...args),
  })),
  EnrollmentsApi: jest.fn().mockImplementation(() => ({
    checkEnrollmentStatusEnrollmentsSessionsSessionIdCheckEnrollmentGet: (...args: any[]) =>
      mockCheckEnrollment(...args),
    enrollInSessionEnrollmentsSessionsSessionIdEnrollPost: (...args: any[]) =>
      mockEnroll(...args),
    cancelEnrollmentEnrollmentsSessionsSessionIdEnrollDelete: (...args: any[]) =>
      mockCancelEnrollment(...args),
    getSessionEnrolleesEnrollmentsSessionsSessionIdEnrolleesGet: (...args: any[]) =>
      mockGetEnrollees(...args),
  })),
  UsersApi: jest.fn().mockImplementation(() => ({
    getUser: (...args: any[]) => mockGetUser(...args),
    getUserById: (...args: any[]) => mockGetUserById(...args),
  })),
  RatingsApi: jest.fn().mockImplementation(() => ({
    getRatingsForSessionRatingsSessionSessionIdRatingsGet: (...args: any[]) =>
      mockGetRatings(...args),
    createRatingRatingsCreateRatingPost: (...args: any[]) => mockCreateRating(...args),
  })),
}))

const MOCK_SESSION = {
  id: 'sess-test',
  title: 'React Workshop',
  description: 'Build UIs with React and hooks',
  skill_category: 'Technology',
  location: 'Lab 101',
  start_time: '2030-06-01T14:00:00.000Z',
  end_time: '2030-06-01T16:00:00.000Z',
  enrolled_count: 4,
  capacity: 10,
  price: 0,
  host_id: 'host-abc',
  status: 'Open',
}

const FULL_SESSION = { ...MOCK_SESSION, enrolled_count: 10, capacity: 10 }
const HOST_SESSION = { ...MOCK_SESSION, host_id: 'current-user-id' }
// start_time in the past so hasStarted === true
const PAST_SESSION = { ...MOCK_SESSION, start_time: '2020-01-01T10:00:00.000Z', end_time: '2020-01-01T12:00:00.000Z' }

beforeEach(() => {
  localStorage.clear()
  mockRouterPush.mockReset()
  mockCheckEnrollment.mockReset().mockResolvedValue({ data: { enrolled: false } })
  mockGetUser.mockReset().mockResolvedValue({ data: { id: 'other-user-id' } })
  mockGetUserById.mockReset().mockResolvedValue({ data: { first_name: 'Test', last_name: 'Host' } })
  mockGetEnrollees.mockReset().mockResolvedValue({ data: { enrollees: [] } })
  mockGetRatings.mockReset().mockResolvedValue({ data: { average_rating: 0, total_ratings: 0, ratings: [] } })
  mockCreateRating.mockReset().mockResolvedValue({ data: {} })
  mockEnroll.mockReset().mockResolvedValue({ data: {} })
  mockCancelEnrollment.mockReset().mockResolvedValue({ data: {} })
  mockDeleteSession.mockReset().mockResolvedValue({ data: {} })
})

describe('SessionDetailPage', () => {
  it('renders session title, description, and location from initialSession', async () => {
    render(<SessionDetailPage sessionId="sess-test" initialSession={MOCK_SESSION as any} />)
    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument()
      expect(screen.getByText('Build UIs with React and hooks')).toBeInTheDocument()
      expect(screen.getByText('Lab 101')).toBeInTheDocument()
    })
  })

  it('shows "Session full" button when session is at capacity', async () => {
    render(<SessionDetailPage sessionId="sess-test" initialSession={FULL_SESSION as any} />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /session full/i })).toBeInTheDocument()
    })
  })

  it('shows an error message when enrolling without being signed in', async () => {
    render(<SessionDetailPage sessionId="sess-test" initialSession={MOCK_SESSION as any} />)

    const enrollBtn = await screen.findByRole('button', { name: /enroll in session/i })
    fireEvent.click(enrollBtn)

    await waitFor(() => {
      expect(screen.getByText(/please sign in before enrolling/i)).toBeInTheDocument()
    })
  })

  it('calls the enroll API and shows success message on enrollment', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    render(<SessionDetailPage sessionId="sess-test" initialSession={MOCK_SESSION as any} />)

    const enrollBtn = await screen.findByRole('button', { name: /enroll in session/i })
    fireEvent.click(enrollBtn)

    await waitFor(() => {
      expect(mockEnroll).toHaveBeenCalledWith('sess-test')
      expect(screen.getByText(/you're enrolled/i)).toBeInTheDocument()
    })
  })

  it('shows Cancel Enrollment button when the user is already enrolled', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockCheckEnrollment.mockResolvedValue({ data: { enrolled: true } })

    render(<SessionDetailPage sessionId="sess-test" initialSession={MOCK_SESSION as any} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel enrollment/i })).toBeInTheDocument()
    })
  })

  it('shows Edit and Delete controls only for the session host', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockResolvedValue({ data: { id: 'current-user-id' } })

    render(<SessionDetailPage sessionId="sess-test" initialSession={HOST_SESSION as any} />)

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    // Non-host sessions should not show these controls
    expect(screen.queryByText(/enroll in session/i)).not.toBeInTheDocument()
  })

  it('shows delete confirmation and calls the delete API on confirm', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockResolvedValue({ data: { id: 'current-user-id' } })

    render(<SessionDetailPage sessionId="sess-test" initialSession={HOST_SESSION as any} />)

    const deleteBtn = await screen.findByRole('button', { name: /delete/i })
    fireEvent.click(deleteBtn)

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(mockDeleteSession).toHaveBeenCalledWith('sess-test')
      expect(mockRouterPush).toHaveBeenCalledWith('/sessions')
    })
  })

  it('shows an error message when the enroll API call fails', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockEnroll.mockRejectedValue({ response: { data: { message: 'Enrollment failed' } } })

    render(<SessionDetailPage sessionId="sess-test" initialSession={MOCK_SESSION as any} />)

    const enrollBtn = await screen.findByRole('button', { name: /enroll in session/i })
    fireEvent.click(enrollBtn)

    await waitFor(() => {
      expect(screen.getByText('Enrollment failed')).toBeInTheDocument()
    })
  })

  it('shows an error message when the delete API call fails', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockResolvedValue({ data: { id: 'current-user-id' } })
    mockDeleteSession.mockRejectedValue({ response: { data: { message: 'Delete failed' } } })

    render(<SessionDetailPage sessionId="sess-test" initialSession={HOST_SESSION as any} />)

    const deleteBtn = await screen.findByRole('button', { name: /delete/i })
    fireEvent.click(deleteBtn)
    await waitFor(() => screen.getByRole('button', { name: /confirm/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────
// Ratings
// ─────────────────────────────────────────────
describe('Ratings', () => {
  it('displays existing ratings with average score, total count, and reviewer name', async () => {
    mockGetRatings.mockResolvedValue({
      data: {
        average_rating: 4.5,
        total_ratings: 2,
        ratings: [
          { id: 'r1', reviewer_id: 'other-user', reviewer_name: 'Alice', rating: 5, comment: 'Great!' },
          { id: 'r2', reviewer_id: 'another-user', reviewer_name: 'Bob', rating: 4, comment: null },
        ],
      },
    })

    render(<SessionDetailPage sessionId="sess-test" initialSession={MOCK_SESSION as any} />)

    await waitFor(() => {
      expect(screen.getByText(/4\.5\s*\/\s*5/)).toBeInTheDocument()
      expect(screen.getByText(/2\s*ratings/i)).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })
  })

  it('shows "Leave a rating" form when the user is enrolled and the session has started', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockResolvedValue({ data: { id: 'current-user-id' } })
    mockCheckEnrollment.mockResolvedValue({ data: { enrolled: true } })

    render(<SessionDetailPage sessionId="sess-test" initialSession={PAST_SESSION as any} />)

    await waitFor(() => {
      expect(screen.getByText(/leave a rating/i)).toBeInTheDocument()
    })
  })

  it('hides the "Leave a rating" form when the user has already rated the session', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockResolvedValue({ data: { id: 'current-user-id' } })
    mockCheckEnrollment.mockResolvedValue({ data: { enrolled: true } })
    mockGetRatings.mockResolvedValue({
      data: {
        average_rating: 5,
        total_ratings: 1,
        ratings: [{ id: 'r1', reviewer_id: 'current-user-id', reviewer_name: 'Me', rating: 5 }],
      },
    })

    render(<SessionDetailPage sessionId="sess-test" initialSession={PAST_SESSION as any} />)

    await waitFor(() => {
      expect(screen.queryByText(/leave a rating/i)).not.toBeInTheDocument()
    })
  })

  it('does not show the rating form when the session has not yet started', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockResolvedValue({ data: { id: 'current-user-id' } })
    mockCheckEnrollment.mockResolvedValue({ data: { enrolled: true } })

    render(<SessionDetailPage sessionId="sess-test" initialSession={MOCK_SESSION as any} />)

    await waitFor(() => {
      expect(screen.queryByText(/leave a rating/i)).not.toBeInTheDocument()
    })
  })

  it('calls createRating with the correct session_id, rating, and comment on submit', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockResolvedValue({ data: { id: 'current-user-id' } })
    mockCheckEnrollment.mockResolvedValue({ data: { enrolled: true } })

    render(<SessionDetailPage sessionId="sess-test" initialSession={PAST_SESSION as any} />)

    await waitFor(() => expect(screen.getByText(/leave a rating/i)).toBeInTheDocument())

    // Select 3 stars (click the star button with aria-label "Rate 3")
    fireEvent.click(screen.getByRole('button', { name: /rate 3/i }))

    fireEvent.change(screen.getByPlaceholderText(/add a comment/i), {
      target: { value: 'Solid session' },
    })

    fireEvent.click(screen.getByRole('button', { name: /submit rating/i }))

    await waitFor(() => {
      expect(mockCreateRating).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'sess-test',
          rating: 3,
          comment: 'Solid session',
        })
      )
    })
  })

  it('shows "Rating submitted. Thanks for the feedback!" after a successful submission', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockResolvedValue({ data: { id: 'current-user-id' } })
    mockCheckEnrollment.mockResolvedValue({ data: { enrolled: true } })

    render(<SessionDetailPage sessionId="sess-test" initialSession={PAST_SESSION as any} />)

    await waitFor(() => expect(screen.getByText(/leave a rating/i)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /submit rating/i }))

    await waitFor(() => {
      expect(screen.getByText(/rating submitted\. thanks for the feedback/i)).toBeInTheDocument()
    })
  })

  it('hides the rating form after a successful submission', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockResolvedValue({ data: { id: 'current-user-id' } })
    mockCheckEnrollment.mockResolvedValue({ data: { enrolled: true } })

    render(<SessionDetailPage sessionId="sess-test" initialSession={PAST_SESSION as any} />)

    await waitFor(() => expect(screen.getByText(/leave a rating/i)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /submit rating/i }))

    await waitFor(() => {
      expect(screen.queryByText(/leave a rating/i)).not.toBeInTheDocument()
    })
  })

  it('shows an error message when the createRating API call fails', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockResolvedValue({ data: { id: 'current-user-id' } })
    mockCheckEnrollment.mockResolvedValue({ data: { enrolled: true } })
    mockCreateRating.mockRejectedValue({
      response: { data: { message: 'Rating failed' } },
    })

    render(<SessionDetailPage sessionId="sess-test" initialSession={PAST_SESSION as any} />)

    await waitFor(() => expect(screen.getByText(/leave a rating/i)).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /submit rating/i }))

    await waitFor(() => {
      expect(screen.getByText('Rating failed')).toBeInTheDocument()
    })
  })
})
