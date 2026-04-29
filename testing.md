# Frontend Testing Documentation

## Test Locations
All automated frontend tests are located in the `/tests` directory.

## What is Covered
Our frontend test suite validates UI rendering, state transitions, and mocked API integrations.
1. **Core Workflows:** Validates keyword searching, category filtering, and authentication error handling (e.g., 401 Unauthorized invalid logins).
2. **Generative UI AI Agent:** Validates the deterministic state machine logic of the AI Brainstormer to ensure it triggers the correct Phase states based on user prompts.
3. **Enrollment Rendering:** Ensures the session capacity UI appropriately reflects "Session is full" states.

## How to Run the Tests
To execute the test suite and generate the coverage report, run the following command in the root directory:

```bash
npx jest --coverage
```

## Important Limitations
- Because these are isolated Mock-Object frontend tests, they do not hit the live MongoDB database. End-to-end atomic database transactions are covered in the backend testing suite.
- Web Worker background threads (used for the Recommendation Engine) are mocked in Jest.

## CSDS 493 Advanced Quality Artifact

### 1. Test Coverage Telemetry
Our Jest and React Testing Library suite contains 11 distinct test suites and 69 tests, achieving industry-standard coverage for our frontend architecture:

- **Overall Line Coverage:** 83.87%
- **Statement Coverage:** 80.22%

### 2. Mutation Testing Design
To ensure our tests are strictly catching UI regressions rather than just hitting lines of code, we designed a Mutation Testing integration path. This involves injecting deliberate faults (mutants)—such as flipping `>=` to `<=` in capacity checks—using a tool like Stryker. By measuring the "mutation score," we quantitatively verify the robustness of our Jest assertions against silent failures.
