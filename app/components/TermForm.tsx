"use client";

import { useState, useEffect, useRef } from "react";
import { Term } from "../types/term";
import { TermStorage } from "../utils/storage";
import { ImageCompressor, CompressedImage } from "../utils/image-compressor";

interface TermFormProps {
  term?: Term;
  onSave: (term: Term) => void;
  onCancel: () => void;
}

export default function TermForm({ term, onSave, onCancel }: TermFormProps) {
  const [formData, setFormData] = useState({
    word: "",
    meaning: "",
    category: "",
    reading: "",
    alias: "",
    commonName: "",
    abbreviation: "",
    image: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (term) {
      setFormData({
        word: term.word,
        meaning: term.meaning,
        category: term.category || "",
        reading: term.reading || "",
        alias: term.alias || "",
        commonName: term.commonName || "",
        abbreviation: term.abbreviation || "",
        image: term.image || "",
      });
      // 既存の画像がある場合は圧縮画像として設定
      if (term.image && term.image.startsWith('data:')) {
        setCompressedImage({
          dataUrl: term.image,
          width: 0,
          height: 0,
          size: 0
        });
      }
    }
  }, [term]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.word.trim()) {
      newErrors.word = "ワードは必須です";
    }

    if (!formData.meaning.trim()) {
      newErrors.meaning = "意味は必須です";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const termData = {
      word: formData.word.trim(),
      meaning: formData.meaning.trim(),
      category: formData.category.trim() || undefined,
      reading: formData.reading.trim() || undefined,
      alias: formData.alias.trim() || undefined,
      commonName: formData.commonName.trim() || undefined,
      abbreviation: formData.abbreviation.trim() || undefined,
      image: formData.image.trim() || undefined,
    };

    if (term) {
      // 編集モード
      const updatedTerm = TermStorage.updateTerm(term.id, termData);
      if (updatedTerm) {
        onSave(updatedTerm);
      }
    } else {
      // 新規登録モード
      const newTerm = TermStorage.addTerm(termData);
      onSave(newTerm);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    // ファイルサイズチェック（10MB制限）
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください');
      return;
    }

    setIsCompressing(true);
    try {
      const compressed = await ImageCompressor.compressImage(file);
      setCompressedImage(compressed);
      setFormData(prev => ({ ...prev, image: compressed.dataUrl }));
    } catch (error) {
      console.error('画像圧縮エラー:', error);
      alert('画像の圧縮に失敗しました');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveImage = () => {
    setCompressedImage(null);
    setFormData(prev => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="terminal-card max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 terminal-text">
        {term ? "単語を編集" : "新しい単語を登録"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 必須フィールド */}
        <div>
          <label className="block text-sm font-medium mb-1 terminal-text">
            ワード <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.word}
            onChange={(e) => handleInputChange("word", e.target.value)}
            className="terminal-input w-full"
            placeholder="専門用語を入力"
          />
          {errors.word && (
            <p className="text-red-400 text-sm mt-1">{errors.word}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 terminal-text">
            意味 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={formData.meaning}
            onChange={(e) => handleInputChange("meaning", e.target.value)}
            className="terminal-input w-full h-20 resize-none"
            placeholder="意味を入力"
          />
          {errors.meaning && (
            <p className="text-red-400 text-sm mt-1">{errors.meaning}</p>
          )}
        </div>

        {/* 任意フィールド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 terminal-text">
              属性
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="terminal-input w-full"
              placeholder="介護、医療、情報処理など"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 terminal-text">
              読み仮名
            </label>
            <input
              type="text"
              value={formData.reading}
              onChange={(e) => handleInputChange("reading", e.target.value)}
              className="terminal-input w-full"
              placeholder="ひらがなで入力"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 terminal-text">
              別名
            </label>
            <input
              type="text"
              value={formData.alias}
              onChange={(e) => handleInputChange("alias", e.target.value)}
              className="terminal-input w-full"
              placeholder="別の呼び方"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 terminal-text">
              通称
            </label>
            <input
              type="text"
              value={formData.commonName}
              onChange={(e) => handleInputChange("commonName", e.target.value)}
              className="terminal-input w-full"
              placeholder="一般的な呼び方"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 terminal-text">
              略称
            </label>
            <input
              type="text"
              value={formData.abbreviation}
              onChange={(e) =>
                handleInputChange("abbreviation", e.target.value)
              }
              className="terminal-input w-full"
              placeholder="略称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 terminal-text">
              画像
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="terminal-input w-full"
              disabled={isCompressing}
            />
            {isCompressing && (
              <p className="text-sm text-cyan-400 mt-1">画像を圧縮中...</p>
            )}
            {compressedImage && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>サイズ: {compressedImage.width} × {compressedImage.height}</span>
                  <span>{ImageCompressor.formatFileSize(compressedImage.size)}</span>
                </div>
                <img
                  src={compressedImage.dataUrl}
                  alt="プレビュー"
                  className="max-w-xs max-h-32 object-contain rounded border border-gray-600"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  画像を削除
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 pt-4">
          <button type="submit" className="terminal-button flex-1">
            {term ? "更新" : "登録"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 text-cyan-400 font-semibold px-4 py-2 rounded transition-colors duration-200 flex-1"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
