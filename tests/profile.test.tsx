import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ProfilePage } from '@/components/profile-page'
import { UserProfilePage } from '@/components/user-profile-page'
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

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}))

const mockGetUser = jest.fn()
const mockGetUserById = jest.fn()
const mockUpdateUser = jest.fn()
const mockGetMyEnrollments = jest.fn()
const mockCancelEnrollment = jest.fn()
const mockListSessions = jest.fn()
const mockDeleteSession = jest.fn()

jest.mock('../api', () => ({
  Configuration: jest.fn(),
  UsersApi: jest.fn().mockImplementation(() => ({
    getUser: (...args: any[]) => mockGetUser(...args),
    getUserById: (...args: any[]) => mockGetUserById(...args),
    updateUser: (...args: any[]) => mockUpdateUser(...args),
  })),
  EnrollmentsApi: jest.fn().mockImplementation(() => ({
    getMyEnrollmentsEnrollmentsMyEnrollmentsGet: (...args: any[]) =>
      mockGetMyEnrollments(...args),
    cancelEnrollmentEnrollmentsSessionsSessionIdEnrollDelete: (...args: any[]) =>
      mockCancelEnrollment(...args),
  })),
  SessionsApi: jest.fn().mockImplementation(() => ({
    listSessions: (...args: any[]) => mockListSessions(...args),
    deleteSession: (...args: any[]) => mockDeleteSession(...args),
  })),
}))

const MOCK_USER = {
  id: 'user-abc',
  first_name: 'Jane',
  last_name: 'Doe',
  username: 'janedoe',
  email: 'jane@uni.edu',
  bio: 'Full-stack developer',
  date_joined: '2025-01-15T00:00:00Z',
}

const MOCK_HOSTED_SESSION = {
  id: 'hosted-sess-1',
  title: "Jane's Python Workshop",
  start_time: '2030-06-01T14:00:00.000Z',
  location: 'Lab 3',
  status: 'Open',
  host_id: 'user-abc',
}

const MOCK_UPCOMING_ENROLLMENT = {
  id: 'enroll-1',
  session_id: 'other-sess-1',
  session_title: 'Guitar Basics',
  session_start_time: '2030-07-01T14:00:00.000Z',
  session_location: 'Music Hall',
  host_name: 'John Smith',
  status: 'enrolled',
  enrolled_at: '2025-01-20T00:00:00Z',
}

const MOCK_CANCELLED_ENROLLMENT = {
  id: 'enroll-2',
  session_id: 'other-sess-2',
  session_title: 'Cooking 101',
  session_start_time: '2030-08-01T14:00:00.000Z',
  session_location: 'Kitchen',
  host_name: 'Mary Chef',
  status: 'cancelled',
  enrolled_at: '2025-01-25T00:00:00Z',
}

beforeEach(() => {
  localStorage.clear()
  mockGetUser.mockReset().mockResolvedValue({ data: MOCK_USER })
  mockGetUserById.mockReset().mockResolvedValue({ data: MOCK_USER })
  mockUpdateUser.mockReset().mockResolvedValue({ data: { ...MOCK_USER, first_name: 'Updated' } })
  mockGetMyEnrollments.mockReset().mockResolvedValue({ data: [MOCK_UPCOMING_ENROLLMENT] })
  mockCancelEnrollment.mockReset().mockResolvedValue({ data: {} })
  mockListSessions.mockReset().mockResolvedValue({ data: [MOCK_HOSTED_SESSION] })
  mockDeleteSession.mockReset().mockResolvedValue({ data: {} })
})

// ─────────────────────────────────────────────
// ProfilePage
// ─────────────────────────────────────────────
describe('ProfilePage', () => {
  it('shows a sign-in error when no JWT is present', async () => {
    render(<ProfilePage />)
    await waitFor(() => {
      expect(
        screen.getByText(/please sign in to view your profile/i)
      ).toBeInTheDocument()
    })
  })

  it('displays the user name and username after loading', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    render(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('@janedoe')).toBeInTheDocument()
    })
  })

  it('opens the edit form with pre-filled values when Edit profile is clicked', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    render(<ProfilePage />)

    const editBtn = await screen.findByRole('button', { name: /edit profile/i })
    fireEvent.click(editBtn)

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane')
      expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe')
    })
  })

  it('calls updateUser and shows success message on save', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    render(<ProfilePage />)

    const editBtn = await screen.findByRole('button', { name: /edit profile/i })
    fireEvent.click(editBtn)

    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Janet' } })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledTimes(1)
      expect(screen.getByText('Profile updated.')).toBeInTheDocument()
    })
  })

  it('lists hosted sessions belonging to the user', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    render(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByText("Jane's Python Workshop")).toBeInTheDocument()
    })
  })

  it('shows delete confirmation then calls deleteSession', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    render(<ProfilePage />)

    const deleteBtn = await screen.findByRole('button', { name: /delete/i })
    fireEvent.click(deleteBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))

    await waitFor(() => {
      expect(mockDeleteSession).toHaveBeenCalledWith('hosted-sess-1')
    })
  })

  it('switches enrollment content when tabs are clicked', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetMyEnrollments.mockResolvedValue({
      data: [MOCK_UPCOMING_ENROLLMENT, MOCK_CANCELLED_ENROLLMENT],
    })
    render(<ProfilePage />)

    // Upcoming tab is active by default
    await waitFor(() => {
      expect(screen.getByText('Guitar Basics')).toBeInTheDocument()
    })
    expect(screen.queryByText('Cooking 101')).not.toBeInTheDocument()

    // Switch to Cancelled tab
    fireEvent.click(screen.getByRole('button', { name: /cancelled/i }))
    await waitFor(() => {
      expect(screen.getByText('Cooking 101')).toBeInTheDocument()
    })
    expect(screen.queryByText('Guitar Basics')).not.toBeInTheDocument()
  })

  it('calls cancelEnrollment API when Cancel is clicked on an upcoming enrollment', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    render(<ProfilePage />)

    const cancelBtn = await screen.findByRole('button', { name: /^cancel$/i })
    fireEvent.click(cancelBtn)

    await waitFor(() => {
      expect(mockCancelEnrollment).toHaveBeenCalledWith('other-sess-1')
    })
  })

  it('shows an error when the profile API fails after sign-in', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockGetUser.mockRejectedValue({
      response: { data: { message: 'Server error' } },
    })

    render(<ProfilePage />)

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('shows an error message when saving profile changes fails', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    mockUpdateUser.mockRejectedValue({
      response: { data: { message: 'Save failed' } },
    })

    render(<ProfilePage />)

    const editBtn = await screen.findByRole('button', { name: /edit profile/i })
    fireEvent.click(editBtn)

    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────
// UserProfilePage
// ─────────────────────────────────────────────
describe('UserProfilePage', () => {
  it('displays the target user name, username, and bio', async () => {
    render(<UserProfilePage userId="user-abc" />)
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('@janedoe')).toBeInTheDocument()
      expect(screen.getByText('Full-stack developer')).toBeInTheDocument()
    })
  })

  it('does not show an Edit profile button', async () => {
    render(<UserProfilePage userId="user-abc" />)
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /edit profile/i })).not.toBeInTheDocument()
  })

  it('shows an error message when the API call fails', async () => {
    mockGetUserById.mockRejectedValue({ response: { data: { message: 'User not found' } } })
    render(<UserProfilePage userId="unknown-id" />)
    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument()
    })
  })
})
