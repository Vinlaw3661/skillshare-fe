import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/login-form'
import { AuthProvider, useAuth } from '@/context/auth-context'
import '@testing-library/jest-dom'

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

const mockLoginUser = jest.fn()
const mockRegisterUser = jest.fn()

jest.mock('../api', () => ({
  UsersApi: jest.fn().mockImplementation(() => ({
    loginUser: () => mockLoginUser(),
    registerUser: () => mockRegisterUser(),
  })),
}))

function renderWithAuth(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>)
}

describe('LoginForm', () => {
  beforeEach(() => {
    localStorage.clear()
    mockLoginUser.mockReset()
    mockRegisterUser.mockReset()
  })

  it('renders email and password fields in login mode', () => {
    renderWithAuth(<LoginForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument()
  })

  it('shows all registration fields after toggling to register mode', () => {
    renderWithAuth(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Register' }))
    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('calls loginUser API and stores JWT in localStorage on successful login', async () => {
    mockLoginUser.mockResolvedValue({ data: { access_token: 'test-token-abc' } })
    renderWithAuth(<LoginForm />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@uni.edu' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledTimes(1)
      expect(localStorage.getItem('skillshare_jwt')).toBe('test-token-abc')
    })
  })

  it('calls registerUser then loginUser and stores JWT on successful registration', async () => {
    mockRegisterUser.mockResolvedValue({ data: {} })
    mockLoginUser.mockResolvedValue({ data: { access_token: 'reg-token-xyz' } })
    renderWithAuth(<LoginForm />)

    fireEvent.click(screen.getByRole('button', { name: 'Register' }))
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'janedoe' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@uni.edu' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password12345' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledTimes(1)
      expect(mockLoginUser).toHaveBeenCalledTimes(1)
      expect(localStorage.getItem('skillshare_jwt')).toBe('reg-token-xyz')
    })
  })
})

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes as not authenticated when no token is in localStorage', async () => {
    function AuthStatus() {
      const { isAuthenticated, isLoading } = useAuth()
      if (isLoading) return <span>loading</span>
      return <span>{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
    }
    render(<AuthProvider><AuthStatus /></AuthProvider>)
    await waitFor(() => {
      expect(screen.getByText('not-authenticated')).toBeInTheDocument()
    })
  })

  it('initializes as authenticated when a JWT already exists in localStorage', async () => {
    localStorage.setItem('skillshare_jwt', 'existing-token')
    function AuthStatus() {
      const { isAuthenticated, isLoading } = useAuth()
      if (isLoading) return <span>loading</span>
      return <span>{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
    }
    render(<AuthProvider><AuthStatus /></AuthProvider>)
    await waitFor(() => {
      expect(screen.getByText('authenticated')).toBeInTheDocument()
    })
  })

  it('removes JWT from localStorage when onLogout is called', async () => {
    localStorage.setItem('skillshare_jwt', 'token-to-remove')
    function LogoutTest() {
      const { onLogout } = useAuth()
      return <button onClick={onLogout}>logout</button>
    }
    render(<AuthProvider><LogoutTest /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'logout' }))
    expect(localStorage.getItem('skillshare_jwt')).toBeNull()
  })

  it('does not store a JWT and stays unauthenticated when login fails', async () => {
    mockLoginUser.mockRejectedValue(new Error('401 Unauthorized'))

    function LoginTest() {
      const { isAuthenticated, onLogin } = useAuth()
      const [failed, setFailed] = React.useState(false)
      const attempt = async () => {
        try { await onLogin({ email: 'bad@uni.edu', password: 'wrong' }) }
        catch { setFailed(true) }
      }
      return (
        <div>
          <button onClick={attempt}>try login</button>
          <span>{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
          {failed && <span>login-failed</span>}
        </div>
      )
    }
    render(<AuthProvider><LoginTest /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'try login' }))

    await waitFor(() => {
      expect(screen.getByText('login-failed')).toBeInTheDocument()
      expect(screen.getByText('not-authenticated')).toBeInTheDocument()
      expect(localStorage.getItem('skillshare_jwt')).toBeNull()
    })
  })
})
