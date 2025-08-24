import { Term, TestResult } from "../types/term";

const STORAGE_KEY = "term-memo-data";
const TEST_RESULTS_KEY = "term-memo-test-results";

export class TermStorage {
  static getAllTerms(): Term[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const terms = JSON.parse(data);
      return terms.map((term: Record<string, unknown>) => ({
        ...term,
        createdAt: new Date(term.createdAt as string),
        updatedAt: new Date(term.updatedAt as string),
      }));
    } catch (error) {
      console.error("Failed to load terms from localStorage:", error);
      return [];
    }
  }

  static saveTerms(terms: Term[]): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
    } catch (error) {
      console.error("Failed to save terms to localStorage:", error);
    }
  }

  static addTerm(term: Omit<Term, "id" | "createdAt" | "updatedAt">): Term {
    const newTerm: Term = {
      ...term,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const terms = this.getAllTerms();
    terms.push(newTerm);
    this.saveTerms(terms);

    return newTerm;
  }

  static updateTerm(
    id: string,
    updates: Partial<Omit<Term, "id" | "createdAt">>
  ): Term | null {
    const terms = this.getAllTerms();
    const index = terms.findIndex((term) => term.id === id);

    if (index === -1) return null;

    terms[index] = {
      ...terms[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.saveTerms(terms);
    return terms[index];
  }

  static deleteTerm(id: string): boolean {
    const terms = this.getAllTerms();
    const filteredTerms = terms.filter((term) => term.id !== id);

    if (filteredTerms.length === terms.length) return false;

    this.saveTerms(filteredTerms);
    return true;
  }

  static deleteMultipleTerms(ids: string[]): number {
    const terms = this.getAllTerms();
    const filteredTerms = terms.filter((term) => !ids.includes(term.id));
    const deletedCount = terms.length - filteredTerms.length;

    this.saveTerms(filteredTerms);
    return deletedCount;
  }

  static getTermsByCategory(category: string): Term[] {
    return this.getAllTerms().filter((term) => term.category === category);
  }

  static getCategories(): string[] {
    const terms = this.getAllTerms();
    const categories = terms
      .map((term) => term.category)
      .filter((category): category is string => !!category);

    return [...new Set(categories)];
  }
}

export class TestStorage {
  static getTestResults(): TestResult[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(TEST_RESULTS_KEY);
      if (!data) return [];

      const results = JSON.parse(data);
      return results.map((result: Record<string, unknown>) => ({
        ...result,
        answeredAt: new Date(result.answeredAt as string),
      }));
    } catch (error) {
      console.error("Failed to load test results from localStorage:", error);
      return [];
    }
  }

  static saveTestResult(result: Omit<TestResult, "answeredAt">): void {
    if (typeof window === "undefined") return;

    const newResult: TestResult = {
      ...result,
      answeredAt: new Date(),
    };

    const results = this.getTestResults();
    results.push(newResult);

    try {
      localStorage.setItem(TEST_RESULTS_KEY, JSON.stringify(results));
    } catch (error) {
      console.error("Failed to save test result to localStorage:", error);
    }
  }

  static clearTestResults(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TEST_RESULTS_KEY);
  }
}
