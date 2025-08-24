import { Term, TestQuestion } from "../types/term";
import { TermStorage } from "./storage";

export class TestGenerator {
  static generateQuestion(term: Term): TestQuestion | null {
    const allTerms = TermStorage.getAllTerms();

    // 同じ属性の単語を取得
    const sameCategoryTerms = term.category
      ? allTerms.filter((t) => t.category === term.category && t.id !== term.id)
      : [];

    // 異なる属性の単語を取得
    const differentCategoryTerms = allTerms.filter(
      (t) => t.category !== term.category && t.id !== term.id
    );

    // 選択肢を生成
    const options = this.generateOptions(
      term.meaning,
      sameCategoryTerms,
      differentCategoryTerms
    );

    if (options.length < 4) {
      return null; // 十分な選択肢がない場合
    }

    return {
      id: crypto.randomUUID(),
      word: term.word,
      correctAnswer: term.meaning,
      options: this.shuffleArray(options),
      category: term.category,
    };
  }

  private static generateOptions(
    correctAnswer: string,
    sameCategoryTerms: Term[],
    differentCategoryTerms: Term[]
  ): string[] {
    const options = [correctAnswer];

    // 同じ属性から2つ選択
    const sameCategoryOptions = this.shuffleArray(sameCategoryTerms)
      .slice(0, 2)
      .map((term) => term.meaning);

    options.push(...sameCategoryOptions);

    // 異なる属性から1つ選択（同じ属性が不足している場合）
    if (options.length < 4) {
      const differentCategoryOptions = this.shuffleArray(differentCategoryTerms)
        .slice(0, 4 - options.length)
        .map((term) => term.meaning);

      options.push(...differentCategoryOptions);
    }

    // 重複を除去
    return [...new Set(options)].slice(0, 4);
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static generateTestQuestions(count: number = 10): TestQuestion[] {
    const allTerms = TermStorage.getAllTerms();

    if (allTerms.length < 4) {
      return []; // 最低4つの単語が必要
    }

    const shuffledTerms = this.shuffleArray(allTerms);
    const questions: TestQuestion[] = [];

    for (const term of shuffledTerms) {
      if (questions.length >= count) break;

      const question = this.generateQuestion(term);
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }

  static canGenerateTest(): boolean {
    const allTerms = TermStorage.getAllTerms();
    return allTerms.length >= 4;
  }
}
