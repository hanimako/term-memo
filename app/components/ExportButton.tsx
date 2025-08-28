"use client";

import { useState } from "react";
import { GoogleDriveAPI } from "../utils/google-drive";
import { TermStorage } from "../utils/storage";

interface ExportButtonProps {
  onExportSuccess?: () => void;
}

export default function ExportButton({ onExportSuccess }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // ローカルストレージからデータを取得
      const terms = TermStorage.getAllTerms();
      const testResults = localStorage.getItem('term-memo-test-results');
      
      const exportData = {
        terms,
        testResults: testResults ? JSON.parse(testResults) : [],
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };

      // Google Driveにアップロード
      await GoogleDriveAPI.uploadFile(
        'term-memo-data.json',
        JSON.stringify(exportData, null, 2)
      );

      alert('エクスポートが完了しました！');
      onExportSuccess?.();
    } catch (error) {
      console.error('Export error:', error);
      alert('エクスポートに失敗しました。Google Driveに接続されているか確認してください。');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`terminal-button flex items-center justify-center gap-2 ${
        isExporting ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isExporting ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      {isExporting ? "エクスポート中..." : "Google Driveにエクスポート"}
    </button>
  );
}
