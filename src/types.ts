export interface SolvedProblem {
  questionId: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  leetcode_url: string;
  date_solved: string; // ISO date
  personal_note: string;
  pattern: string;
  times_shown: number;
  last_shown: string | null; // ISO date or null
}

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface FilterState {
  difficulties: Difficulty[];
  topics: string[];
  prioritizeUnseen: boolean;
}
