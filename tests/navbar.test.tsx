import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Navbar } from '@/components/navbar'
import '@testing-library/jest-dom'

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

beforeEach(() => {
  localStorage.clear()
})

describe('Navbar', () => {
  it('always renders the Browse link', async () => {
    render(<Navbar />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /browse/i })).toBeInTheDocument()
    })
  })

  it('renders a Sign in link when no JWT is present', async () => {
    render(<Navbar />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /host/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /profile/i })).not.toBeInTheDocument()
    })
  })

  it('renders Host, Profile, and Sign out when a JWT is present', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    render(<Navbar />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /host/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
    })
  })

  it('removes the JWT from localStorage when Sign out is clicked', async () => {
    localStorage.setItem('skillshare_jwt', 'test-token')
    render(<Navbar />)

    const signOutBtn = await screen.findByRole('button', { name: /sign out/i })
    fireEvent.click(signOutBtn)

    expect(localStorage.getItem('skillshare_jwt')).toBeNull()
  })
})
