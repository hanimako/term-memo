"use client";

import { useState, useEffect } from "react";
import { Term } from "../types/term";
import { TermStorage } from "../utils/storage";

interface TermListProps {
  onEdit: (term: Term) => void;
  onRefresh: () => void;
  sortBy?: "word" | "createdAt" | "category";
  categoryFilter?: string;
}

export default function TermList({
  onEdit,
  onRefresh,
  sortBy = "word",
  categoryFilter = "",
}: TermListProps) {
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = () => {
    const allTerms = TermStorage.getAllTerms();
    setTerms(allTerms);
  };

  const handleDelete = (id: string) => {
    const term = terms.find((t) => t.id === id);
    if (
      term &&
      confirm(`「${term.word}」を削除しますか？\nこの操作は取り消せません。`)
    ) {
      TermStorage.deleteTerm(id);
      loadTerms();
      onRefresh();
    }
  };

  const handleBulkDelete = () => {
    if (selectedTerms.size === 0) return;

    if (
      confirm(
        `${selectedTerms.size}個の単語を削除しますか？\nこの操作は取り消せません。`
      )
    ) {
      const deletedCount = TermStorage.deleteMultipleTerms(
        Array.from(selectedTerms)
      );
      setSelectedTerms(new Set());
      loadTerms();
      onRefresh();
      alert(`${deletedCount}個の単語を削除しました`);
    }
  };

  const handleSelectAll = () => {
    if (selectedTerms.size === filteredTerms.length) {
      setSelectedTerms(new Set());
    } else {
      setSelectedTerms(new Set(filteredTerms.map((term) => term.id)));
    }
  };

  const handleSelectTerm = (id: string) => {
    const newSelected = new Set(selectedTerms);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTerms(newSelected);
  };

  const filteredTerms = terms
    .filter((term) => {
      const matchesSearch =
        term.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.meaning.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !categoryFilter || term.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "word") {
        return a.word.localeCompare(b.word);
      } else if (sortBy === "createdAt") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "category") {
        const categoryA = a.category || "";
        const categoryB = b.category || "";
        if (categoryA === categoryB) {
          return a.word.localeCompare(b.word);
        }
        return categoryA.localeCompare(categoryB);
      }
      return 0;
    });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* 検索 */}
      <div className="terminal-card">
        <div>
          <label className="block text-sm font-medium mb-1 terminal-text">
            検索
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="terminal-input w-full"
            placeholder="ワードまたは意味で検索"
          />
        </div>
      </div>

      {/* 一括操作 */}
      {selectedTerms.size > 0 && (
        <div className="terminal-card bg-cyan-900/20 border-cyan-500">
          <div className="flex items-center justify-between">
            <span className="terminal-text">
              {selectedTerms.size}個の単語が選択されています
            </span>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded transition-colors duration-200"
              title="選択された単語をすべて削除します"
            >
              一括削除
            </button>
          </div>
        </div>
      )}

      {/* 単語一覧 */}
      <div className="terminal-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold terminal-text">
            単語一覧 ({filteredTerms.length}件)
          </h3>
          {filteredTerms.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm terminal-text hover:underline"
            >
              {selectedTerms.size === filteredTerms.length
                ? "選択解除"
                : "全選択"}
            </button>
          )}
        </div>

        {filteredTerms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "条件に一致する単語が見つかりません"
              : "登録された単語がありません"}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTerms.map((term) => (
              <div
                key={term.id}
                className={`border rounded-lg p-4 transition-colors duration-200 ${
                  selectedTerms.has(term.id)
                    ? "bg-cyan-900/20 border-cyan-500"
                    : "bg-gray-800/50 border-gray-600 hover:border-cyan-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTerms.has(term.id)}
                    onChange={() => handleSelectTerm(term.id)}
                    className="mt-1 flex-shrink-0 custom-checkbox"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="space-y-3">
                      {/* 用語名と編集ボタン */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-lg terminal-accent break-words">
                          {term.word}
                        </h4>
                        <button
                          onClick={() => onEdit(term)}
                          className="terminal-button px-3 py-1 text-sm flex-shrink-0"
                        >
                          編集
                        </button>
                      </div>

                      {/* 意味 */}
                      <p className="text-gray-300 break-words leading-relaxed">
                        {term.meaning.split("\n").map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < term.meaning.split("\n").length - 1 && (
                              <br />
                            )}
                          </span>
                        ))}
                      </p>

                      {/* タグ類 */}
                      <div className="flex flex-wrap gap-2 text-sm">
                        {term.category && (
                          <span className="bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded">
                            {term.category}
                          </span>
                        )}
                        {term.reading && (
                          <span className="bg-gray-600/20 text-gray-300 px-2 py-1 rounded">
                            読み: {term.reading}
                          </span>
                        )}
                        {term.officialName && (
                          <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                            正式: {term.officialName}
                          </span>
                        )}
                        {term.alias && (
                          <span className="bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded">
                            別名: {term.alias}
                          </span>
                        )}
                        {term.commonName && (
                          <span className="bg-gray-600/20 text-gray-300 px-2 py-1 rounded">
                            通称: {term.commonName}
                          </span>
                        )}
                        {term.abbreviation && (
                          <span className="bg-gray-600/20 text-gray-300 px-2 py-1 rounded">
                            略: {term.abbreviation}
                          </span>
                        )}
                      </div>

                      {/* 画像 */}
                      {term.image && (
                        <div className="mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={term.image}
                            alt={term.word}
                            className="max-w-full max-h-32 object-contain rounded border border-gray-600"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      {/* 日付情報 */}
                      <div className="text-xs text-gray-500">
                        <div>登録日: {formatDate(term.createdAt)}</div>
                        {term.updatedAt.getTime() !==
                          term.createdAt.getTime() && (
                          <div className="mt-1">
                            更新日: {formatDate(term.updatedAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
