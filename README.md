# SkillShare Local (Frontend)

**Live Deployment (Extra Credit):** [https://skillshare-fe-aoux6.ondigitalocean.app/](https://skillshare-fe-aoux6.ondigitalocean.app/)

## Project Description
SkillShare Local is a campus-focused web application that connects university students who want to learn practical skills with peers willing to teach them. It provides a structured, role-based system separating Instructors and Learners to foster a culture of collaborative learning.

## Architecture Overview
This repository contains the frontend client for SkillShare Local. It follows a Client-Server architecture, communicating with our FastAPI backend via HTTPS REST calls.
* **State & Data Fetching:** Utilizes TanStack Query for efficient server state management and caching.
* **Security:** Implements stateless JWT authentication. Tokens are stored client-side and attached to the `Authorization` header for protected routes.

## Tech Stack & Dependencies
* **Framework:** React
* **Language:** TypeScript
* **Styling:** Tailwind CSS / Shadcn UI
* **Testing:** Jest & React Testing Library
* **Documentation:** TypeDoc

## Installation & Setup
To run the frontend locally, ensure you have Node.js installed, then run:

```bash
# Clone the repository
git clone https://github.com/walle5eva/skillshare-fe.git
cd skillshare-fe

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000.

## Usage Example
- **Register/Login:** Navigate to `/login` and create a Learner or Instructor account.
- **Browse Sessions:** Navigate to the dashboard to view upcoming sessions. Use the category filters or keyword search.
- **Advanced AI Brainstormer:** Click the AI Assistant to get tailored CWRU graduation requirement advice to dynamically generate a session draft.

## Repository Folder Structure
- `/app` or `/src/pages`: Application routing and page views.
- `/components`: Reusable React components.
- `/hooks`: Custom React hooks.
- `/lib` or `/api`: API integration layer.
- `/tests`: Jest mock-object test suites.
- `/docs`: Exported, browsable source code documentation.

## Team Member Roles & Contributions
- **Eva-Jessy Guech:** Frontend Authentication Interface, Session Listing UI, Generative UI AI Agent (Deterministic state machine), and frontend mutation testing.
- **Vinlaw Mudehwe:** Frontend Enrollment Integration, JWT storage state handling, UI testing, and CI/CD deployment.
- **Apeksha Malik:** Backend Architecture, Session APIs, validation logic, and mock object testing for enrollments.
- **Alvisa Krasniqi:** Backend Authentication, Database Modeling, fuzz testing for ratings, and mutation testing for sessions.

## CSDS 493 Quality Artifacts (Testing & QA)
As required for CSDS 493, this frontend implements Mock-Object Testing and a Mutation Testing Design. We isolated our UI logic by mocking the Next.js router and browser-native Web Workers. Our automated Jest suite achieves 83.87% Line Coverage. See `testing.md` for full details.

## Retrospective: Lessons Learned
Building the frontend taught us the importance of separating UI rendering from business logic. Handling complex state required strict alignment between our React hooks and the FastAPI backend. Furthermore, implementing the AI Brainstormer highlighted the power of Generative UI over traditional text-based LLMs for actionable workflows.

## License
MIT License
