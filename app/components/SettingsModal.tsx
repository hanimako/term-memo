"use client";

import { useState, useEffect } from "react";
import { TermStorage } from "../utils/storage";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  sortBy: "word" | "createdAt" | "category";
  categoryFilter: string;
  onSortByChange: (sortBy: "word" | "createdAt" | "category") => void;
  onCategoryFilterChange: (categoryFilter: string) => void;
}

function SettingsModal({
  isOpen,
  onClose,
  onRefresh,
  sortBy,
  categoryFilter,
  onSortByChange,
  onCategoryFilterChange,
}: SettingsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = TermStorage.getCategories();

  const handleDeleteAllData = () => {
    if (confirm("すべてのデータを削除しますか？この操作は取り消せません。")) {
      localStorage.clear();
      onRefresh();
      onClose();
      alert("すべてのデータを削除しました");
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300 z-40"
          onClick={onClose}
        />
      )}

      {/* モーダル */}
      <div
        className="fixed inset-y-0 right-0 w-80 bg-gray-900/95 backdrop-blur-sm border-l border-cyan-600 z-50 transform transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="h-full flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-600">
            <h2 className="text-xl font-bold terminal-text">設定</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-cyan-400 text-2xl"
            >
              ×
            </button>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* 属性フィルター */}
            <div>
              <label className="block text-sm font-medium mb-2 terminal-text">
                属性フィルター
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
                className="terminal-input w-full"
              >
                <option value="">すべて</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* 並び順 */}
            <div>
              <label className="block text-sm font-medium mb-2 terminal-text">
                並び順
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  onSortByChange(
                    e.target.value as "word" | "createdAt" | "category"
                  )
                }
                className="terminal-input w-full"
              >
                <option value="word">ワード順</option>
                <option value="createdAt">登録日順</option>
                <option value="category">属性順</option>
              </select>
            </div>

            {/* 全データ削除 */}
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={handleDeleteAllData}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-3 rounded transition-colors duration-200"
              >
                全データ削除
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                この操作は取り消せません
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsModal;
