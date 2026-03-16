import { SkillCategory } from "./mock-sessions";

// This simulates a user who heavily interacts with Technology and Academics,
// has some interest in Music, and no interest in Cooking or Fitness.
export const mockUserInteractionVector: Record<SkillCategory, number> = {
  Technology: 0.8,
  Academics: 0.6,
  Music: 0.3,
  Arts: 0.1,
  Languages: 0.1,
  Fitness: 0.0,
  Cooking: 0.0,
};