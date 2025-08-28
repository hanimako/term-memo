"use client";

import { useState, useEffect } from "react";
import { TermStorage } from "../utils/storage";
import { useTheme } from "../contexts/ThemeContext";
import LoginButton from "./LoginButton";
import ExportButton from "./ExportButton";
import ImportButton from "./ImportButton";

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
  const [isConnected, setIsConnected] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    setMounted(true);
    // Google Drive接続状態をチェック
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch("/api/google-drive/token");
      setIsConnected(response.ok);
    } catch (error) {
      setIsConnected(false);
    }
  };

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

            {/* ダークモード */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium terminal-text">
                  ダークモード
                </label>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    isDarkMode ? "bg-cyan-600" : "bg-gray-400"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      isDarkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {isDarkMode ? "ダークテーマで表示中" : "通常テーマで表示中"}
              </p>
            </div>

            {/* Google Drive連携 */}
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-sm font-medium mb-3 terminal-text">
                Google Drive連携
              </h3>

              {!isConnected ? (
                <LoginButton onLoginSuccess={checkConnectionStatus} />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    接続済み
                  </div>
                  <ExportButton onExportSuccess={onRefresh} />
                  <ImportButton onImportSuccess={onRefresh} />
                </div>
              )}
            </div>

            {/* 全データ削除 */}
            <div className="pt-4 border-t border-gray-700">
              <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3 text-red-400">
                  ⚠️ 危険な操作
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  この操作により、登録されているすべての単語とテスト結果が完全に削除されます。
                  この操作は取り消すことができません。
                </p>
                <button
                  onClick={handleDeleteAllData}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-3 rounded transition-colors duration-200"
                  title="すべてのデータを削除します（取り消し不可）"
                >
                  全データ削除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsModal;
