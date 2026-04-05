/**
 * @jest-environment node
 */
import { generateSecureTicket } from '@/lib/security'

describe('generateSecureTicket', () => {
  it('returns a non-empty 64-character hex string (SHA-256)', async () => {
    const ticket = await generateSecureTicket('sess-1', 'user-1')
    expect(typeof ticket).toBe('string')
    expect(ticket).toHaveLength(64)
    expect(ticket).toMatch(/^[0-9a-f]+$/)
  })

  it('returns the same ticket for two calls within the same 30-second window', async () => {
    const realDateNow = Date.now
    const fixedTime = Math.floor(Date.now() / 30000) * 30000 + 100 // anchored well inside a window
    Date.now = () => fixedTime

    try {
      const ticket1 = await generateSecureTicket('sess-abc', 'user-xyz')
      const ticket2 = await generateSecureTicket('sess-abc', 'user-xyz')
      expect(ticket1).toBe(ticket2)
    } finally {
      Date.now = realDateNow
    }
  })

  it('returns a different ticket when the time window changes', async () => {
    const realDateNow = Date.now
    try {
      Date.now = () => 0        // window 0
      const ticket1 = await generateSecureTicket('sess-abc', 'user-xyz')

      Date.now = () => 30000    // window 1
      const ticket2 = await generateSecureTicket('sess-abc', 'user-xyz')

      expect(ticket1).not.toBe(ticket2)
    } finally {
      Date.now = realDateNow
    }
  })
})
