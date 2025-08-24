"use client";

import { useState } from "react";
import { TestQuestion, TestResult } from "../types/term";
import { TestGenerator } from "../utils/test-generator";
import { TestStorage } from "../utils/storage";

interface TestModeProps {
  onBack: () => void;
}

export default function TestMode({ onBack }: TestModeProps) {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const startTest = () => {
    const generatedQuestions =
      TestGenerator.generateTestQuestions(questionCount);
    if (generatedQuestions.length === 0) {
      alert("テストを開始するには最低4つの単語が必要です");
      return;
    }

    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setIsAnswered(false);
    setResults([]);
    setTestStarted(true);
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const result: TestResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      answeredAt: new Date(),
    };

    setResults((prev) => [...prev, result]);
    TestStorage.saveTestResult(result);
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // テスト終了
      setTestStarted(false);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setIsAnswered(false);
    }
  };

  const handleRetry = () => {
    setTestStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setIsAnswered(false);
    setResults([]);
  };

  const getScore = () => {
    const correctCount = results.filter((r) => r.isCorrect).length;
    return {
      correct: correctCount,
      total: results.length,
      percentage: Math.round((correctCount / results.length) * 100),
    };
  };

  const canStartTest = TestGenerator.canGenerateTest();

  if (!testStarted) {
    return (
      <div className="terminal-card max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4 terminal-accent">テストモード</h2>

        {!canStartTest ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              テストを開始するには最低4つの単語を登録してください
            </p>
            <button onClick={onBack} className="terminal-button">
              戻る
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 terminal-text">
                問題数
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="terminal-input w-full"
              >
                <option value={5}>5問</option>
                <option value={10}>10問</option>
                <option value={15}>15問</option>
                <option value={20}>20問</option>
              </select>
            </div>

            <div className="bg-cyan-900/20 border border-cyan-600 rounded-lg p-4">
              <h3 className="font-bold mb-2 terminal-accent">テストの説明</h3>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• ワードが問題として提示されます</li>
                <li>• 4つの選択肢から正しい意味を選んでください</li>
                <li>• 同じ属性の単語から選択肢が生成されます</li>
                <li>• 結果は自動的に保存されます</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button onClick={startTest} className="terminal-button flex-1">
                テスト開始
              </button>
              <button
                onClick={onBack}
                className="bg-gray-700 hover:bg-gray-600 text-cyan-400 font-semibold px-4 py-2 rounded transition-colors duration-200 flex-1"
              >
                戻る
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (results.length === questions.length) {
    // テスト結果表示
    const score = getScore();

    return (
      <div className="terminal-card max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4 terminal-accent">テスト結果</h2>

        <div className="text-center mb-6">
          <div className="text-4xl font-bold mb-2 terminal-accent">
            {score.correct} / {score.total}
          </div>
          <div className="text-2xl mb-4">
            <span
              className={
                score.percentage >= 80
                  ? "text-green-400"
                  : score.percentage >= 60
                  ? "text-yellow-400"
                  : "text-red-400"
              }
            >
              {score.percentage}%
            </span>
          </div>
          <div className="text-gray-400">
            {score.percentage >= 80
              ? "優秀です！"
              : score.percentage >= 60
              ? "良好です"
              : "もう一度復習しましょう"}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {results.map((result, index) => {
            const question = questions[index];
            return (
              <div
                key={result.questionId}
                className={`border rounded-lg p-3 ${
                  result.isCorrect
                    ? "bg-green-900/20 border-green-600"
                    : "bg-red-900/20 border-red-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold terminal-accent">
                    問題 {index + 1}
                  </span>
                  <span
                    className={
                      result.isCorrect ? "text-green-400" : "text-red-400"
                    }
                  >
                    {result.isCorrect ? "正解" : "不正解"}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="mb-1">
                    <span className="text-gray-400">問題: </span>
                    <span className="terminal-accent">{question.word}</span>
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-400">あなたの回答: </span>
                    <span
                      className={
                        result.isCorrect ? "text-green-400" : "text-red-400"
                      }
                    >
                      {result.selectedAnswer}
                    </span>
                  </div>
                  {!result.isCorrect && (
                    <div>
                      <span className="text-gray-400">正解: </span>
                      <span className="text-green-400">
                        {question.correctAnswer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={handleRetry} className="terminal-button flex-1">
            再テスト
          </button>
          <button
            onClick={onBack}
            className="bg-gray-700 hover:bg-gray-600 text-cyan-400 font-semibold px-4 py-2 rounded transition-colors duration-200 flex-1"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-card max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold terminal-accent">テストモード</h2>
        <div className="text-sm text-gray-400">
          問題 {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      {currentQuestion && (
        <div className="space-y-6">
          {/* 問題 */}
          <div className="text-center">
            <div className="text-2xl font-bold mb-2 terminal-accent">
              {currentQuestion.word}
            </div>
            {currentQuestion.category && (
              <div className="text-sm text-gray-400">
                属性: {currentQuestion.category}
              </div>
            )}
          </div>

          {/* 選択肢 */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-lg border transition-colors duration-200 ${
                  selectedAnswer === option
                    ? isAnswered
                      ? option === currentQuestion.correctAnswer
                        ? "bg-green-900/20 border-green-600 text-green-400"
                        : "bg-red-900/20 border-red-600 text-red-400"
                      : "bg-cyan-900/20 border-cyan-600 text-cyan-400"
                    : isAnswered && option === currentQuestion.correctAnswer
                    ? "bg-green-900/20 border-green-600 text-green-400"
                    : "bg-gray-800/50 border-gray-600 text-gray-300 hover:border-cyan-600"
                }`}
              >
                <div className="flex items-center">
                  <span className="font-bold mr-3">
                    {(index + 1).toString()}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* ボタン */}
          <div className="flex gap-3">
            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className={`flex-1 px-4 py-2 rounded font-semibold transition-colors duration-200 ${
                  selectedAnswer
                    ? "terminal-button"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                回答する
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="terminal-button flex-1"
              >
                {isLastQuestion ? "結果を見る" : "次の問題"}
              </button>
            )}

            <button
              onClick={onBack}
              className="bg-gray-700 hover:bg-gray-600 text-cyan-400 font-semibold px-4 py-2 rounded transition-colors duration-200"
            >
              中断
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
