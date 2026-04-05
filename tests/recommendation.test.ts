/**
 * @jest-environment node
 */
import { MOCK_SESSIONS } from '@/tests/mocks/mock-sessions'
import { mockUserInteractionVector } from '@/tests/mocks/mock-user'

// Capture the handler registered by the worker via self.addEventListener
let messageHandler: ((event: { data: any }) => void) | null = null
const mockPostMessage = jest.fn()

beforeAll(() => {
  ;(global as any).self = {
    addEventListener: (type: string, handler: any) => {
      if (type === 'message') messageHandler = handler
    },
    postMessage: (...args: any[]) => mockPostMessage(...args),
  }
  // Loading the module registers the message handler against our mock self
  jest.isolateModules(() => {
    require('../lib/recommendation.worker')
  })
})

beforeEach(() => {
  mockPostMessage.mockClear()
})

function getRecommendations(sessions: typeof MOCK_SESSIONS, userVector: Record<string, number>) {
  expect(messageHandler).not.toBeNull()
  messageHandler!({ data: { sessions, userVector } })
  expect(mockPostMessage).toHaveBeenCalledTimes(1)
  return mockPostMessage.mock.calls[0][0] as typeof MOCK_SESSIONS
}

describe('Recommendation Worker', () => {
  it('returns at most 3 sessions', () => {
    const results = getRecommendations(MOCK_SESSIONS, mockUserInteractionVector)
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('ranks sessions matching high-weight categories above low-weight ones', () => {
    // Technology (0.8) > Fitness (0.0) for the mock user
    const techSession = MOCK_SESSIONS.find((s) => s.skill_category === 'Technology')!
    const fitnessSession = MOCK_SESSIONS.find((s) => s.skill_category === 'Fitness')!

    const results = getRecommendations(
      [techSession, fitnessSession],
      mockUserInteractionVector
    )
    expect(results[0].skill_category).toBe('Technology')
  })

  it('ranks free sessions above paid sessions with the same category weight', () => {
    const freeSession = { ...MOCK_SESSIONS[0], id: 'free', skill_category: 'Technology', price: 0, enrolled_count: 0, capacity: 10 }
    const paidSession = { ...MOCK_SESSIONS[0], id: 'paid', skill_category: 'Technology', price: 20, enrolled_count: 0, capacity: 10 }

    const results = getRecommendations([paidSession, freeSession], mockUserInteractionVector)
    expect(results[0].id).toBe('free')
  })

  it('ranks sessions with available capacity above full sessions', () => {
    const availableSession = { ...MOCK_SESSIONS[0], id: 'available', skill_category: 'Technology', price: 0, enrolled_count: 5, capacity: 10 }
    const fullSession = { ...MOCK_SESSIONS[0], id: 'full', skill_category: 'Technology', price: 0, enrolled_count: 10, capacity: 10 }

    const results = getRecommendations([fullSession, availableSession], mockUserInteractionVector)
    expect(results[0].id).toBe('available')
  })
})
