import type { SolvedProblem } from "../types";

/**
 * Selects a random problem from the filtered list.
 * - If prioritizeUnseen is true, uses weighted random selection where
 *   problems with null or older last_shown dates are more likely to be picked.
 * - Never picks the same problem twice in a row if more than 1 problem exists.
 */
export function selectRandom(
  problems: SolvedProblem[],
  lastPickedId: string | null,
  prioritizeUnseen: boolean
): SolvedProblem | null {
  if (problems.length === 0) return null;

  // Filter out last picked if possible
  const candidates =
    problems.length > 1
      ? problems.filter((p) => p.questionId !== lastPickedId)
      : problems;

  if (!prioritizeUnseen) {
    // Uniform random
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Weighted random: score each problem inversely by recency
  const now = Date.now();
  const weights = candidates.map((p) => {
    if (p.last_shown === null) {
      // Never shown — highest weight
      return 1000;
    }
    const msSinceShown = now - new Date(p.last_shown).getTime();
    const daysSince = msSinceShown / (1000 * 60 * 60 * 24);
    // Weight grows with staleness, minimum of 1
    return Math.max(1, daysSince);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let rand = Math.random() * totalWeight;

  for (let i = 0; i < candidates.length; i++) {
    rand -= weights[i];
    if (rand <= 0) {
      return candidates[i];
    }
  }

  // Fallback (floating point edge case)
  return candidates[candidates.length - 1];
}

/**
 * Extracts all unique topics from the problem list, sorted alphabetically.
 */
export function extractAllTopics(problems: SolvedProblem[]): string[] {
  const topicSet = new Set<string>();
  for (const p of problems) {
    for (const t of p.topics) {
      topicSet.add(t);
    }
  }
  return Array.from(topicSet).sort();
}

/**
 * Filters problems by active difficulty and topic filters.
 */
export function filterProblems(
  problems: SolvedProblem[],
  difficulties: string[],
  topics: string[]
): SolvedProblem[] {
  return problems.filter((p) => {
    const diffMatch =
      difficulties.length === 0 || difficulties.includes(p.difficulty);
    const topicMatch =
      topics.length === 0 || topics.some((t) => p.topics.includes(t));
    return diffMatch && topicMatch;
  });
}

/**
 * Formats an ISO date string to a human-readable format.
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
