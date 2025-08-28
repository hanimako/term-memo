"use client";

import { useState } from "react";
import { GoogleDriveAPI } from "../utils/google-drive";
import { TermStorage } from "../utils/storage";

interface ImportButtonProps {
  onImportSuccess?: () => void;
}

export default function ImportButton({ onImportSuccess }: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!confirm('現在のデータが上書きされます。続行しますか？')) {
      return;
    }

    setIsImporting(true);
    
    try {
      // 最新のファイルを取得
      const latestFile = await GoogleDriveAPI.getLatestFile();
      
      if (!latestFile) {
        alert('Google Driveにエクスポートされたデータが見つかりません。');
        return;
      }

      // ファイルをダウンロード
      const fileContent = await GoogleDriveAPI.downloadFile(latestFile.id);
      const importData = JSON.parse(fileContent);

      // データの検証
      if (!importData.terms || !Array.isArray(importData.terms)) {
        throw new Error('Invalid data format');
      }

      // ローカルストレージにデータを保存
      TermStorage.saveTerms(importData.terms);
      
      if (importData.testResults && Array.isArray(importData.testResults)) {
        localStorage.setItem('term-memo-test-results', JSON.stringify(importData.testResults));
      }

      alert('インポートが完了しました！');
      onImportSuccess?.();
    } catch (error) {
      console.error('Import error:', error);
      alert('インポートに失敗しました。ファイル形式を確認してください。');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <button
      onClick={handleImport}
      disabled={isImporting}
      className={`terminal-button flex items-center justify-center gap-2 ${
        isImporting ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isImporting ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8l-4 4m0 0l-4-4m4 4H4" />
        </svg>
      )}
      {isImporting ? "インポート中..." : "Google Driveからインポート"}
    </button>
  );
}
