export interface Term {
  id: string;
  word: string;
  meaning: string;
  category?: string;
  reading?: string;
  alias?: string;
  commonName?: string;
  abbreviation?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestQuestion {
  id: string;
  word: string;
  correctAnswer: string;
  options: string[];
  category?: string;
}

export interface TestResult {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: Date;
}
