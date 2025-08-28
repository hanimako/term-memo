"use client";

import { useState, useEffect } from "react";
import { Term } from "./types/term";
import { TermStorage } from "./utils/storage";
import { useTheme } from "./contexts/ThemeContext";
import TermForm from "./components/TermForm";
import TermList from "./components/TermList";
import TestMode from "./components/TestMode";
import SettingsModal from "./components/SettingsModal";

type ViewMode = "list" | "form" | "test" | "edit";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingTerm, setEditingTerm] = useState<Term | undefined>();
  const [terms, setTerms] = useState<Term[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"word" | "createdAt" | "category">(
    "word"
  );
  const [categoryFilter, setCategoryFilter] = useState("");
  const { isDarkMode } = useTheme();

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = () => {
    const allTerms = TermStorage.getAllTerms();
    setTerms(allTerms);
  };

  const handleAddNew = () => {
    setEditingTerm(undefined);
    setViewMode("form");
  };

  const handleEdit = (term: Term) => {
    setEditingTerm(term);
    setViewMode("edit");
  };

  const handleSave = () => {
    loadTerms();
    setViewMode("list");
    setEditingTerm(undefined);
  };

  const handleCancel = () => {
    setViewMode("list");
    setEditingTerm(undefined);
  };

  const handleTestMode = () => {
    setViewMode("test");
  };

  const handleBackFromTest = () => {
    setViewMode("list");
  };

  const getStats = () => {
    const totalTerms = terms.length;
    const categories = TermStorage.getCategories();
    const categoryCount = categories.length;

    return { totalTerms, categoryCount };
  };

  const stats = getStats();

  return (
    <main
      className={`min-h-screen p-4 md:p-8 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-900 text-cyan-400"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-8 relative">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 terminal-text">
              専門用語メモ
            </h1>
          </div>

          {/* 設定アイコン */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-0 right-0 p-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
            title="設定"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* ナビゲーション */}
          {viewMode === "list" && (
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={handleAddNew} className="terminal-button">
                新しい単語を登録
              </button>
              <button
                onClick={handleTestMode}
                disabled={stats.totalTerms < 4}
                className={`px-4 py-2 rounded font-semibold transition-colors duration-200 ${
                  stats.totalTerms >= 4
                    ? "terminal-button"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                テストモード
              </button>
            </div>
          )}
        </header>

        {/* メインコンテンツ */}
        <div className="space-y-6">
          {viewMode === "list" && (
            <TermList
              onEdit={handleEdit}
              onRefresh={loadTerms}
              sortBy={sortBy}
              categoryFilter={categoryFilter}
            />
          )}

          {(viewMode === "form" || viewMode === "edit") && (
            <TermForm
              term={editingTerm}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}

          {viewMode === "test" && <TestMode onBack={handleBackFromTest} />}
        </div>

        {/* 設定モーダル */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onRefresh={loadTerms}
          sortBy={sortBy}
          categoryFilter={categoryFilter}
          onSortByChange={setSortBy}
          onCategoryFilterChange={setCategoryFilter}
        />
      </div>
    </main>
  );
}
