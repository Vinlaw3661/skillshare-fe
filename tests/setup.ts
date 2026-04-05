// Suppress application-level console output during tests.
// Errors and logs from the app (e.g. "Login failed", "Logged out") are
// expected side-effects of intentional test scenarios and add no signal.
// Use jest.spyOn in individual tests if you need to assert on console calls.
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

afterAll(() => {
  jest.restoreAllMocks()
})
