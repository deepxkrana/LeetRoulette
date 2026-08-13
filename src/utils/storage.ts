import type { SolvedProblem } from "../types";

const STORAGE_KEY = "leetroulette_user_data";

export function saveUserData(data: SolvedProblem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to save data to localStorage", error);
    return false;
  }
}

export function loadUserData(): SolvedProblem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // basic validation
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].questionId) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("Failed to load data from localStorage", error);
    return null;
  }
}

export function clearUserData() {
  localStorage.removeItem(STORAGE_KEY);
}
