// lib/recommendation.worker.ts
import { Session, SkillCategory } from "./mock-sessions";

// Listen for messages from the main React app
self.addEventListener("message", (event) => {
  const { sessions, userVector } = event.data;

  // The Algorithm: Score and sort the sessions
  const scoredSessions = sessions.map((session: Session) => {
    // 1. Convert session to a vector (1.0 for its category, 0 for others)
    const sessionWeight = userVector[session.skill_category] || 0;
    
    // 2. Add slight weights for price (free is better) or capacity
    const priceWeight = session.price === 0 ? 0.2 : 0;
    const availabilityWeight = (session.capacity - session.enrolled_count) > 0 ? 0.1 : -0.5;

    // 3. Calculate final match score
    const totalScore = sessionWeight + priceWeight + availabilityWeight;

    return { session, score: totalScore };
  });

  // Sort by highest score descending
  scoredSessions.sort((a: any, b: any) => b.score - a.score);

  // Strip out the scores and just return the top 3 sorted sessions
  const topRecommendations = scoredSessions.slice(0, 3).map((s: any) => s.session);

  // Send the result back to the main thread
  self.postMessage(topRecommendations);
});