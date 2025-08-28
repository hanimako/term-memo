"use client";

import { useState, useRef, useEffect } from "react";

interface ComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export default function ComboBox({
  value,
  onChange,
  options,
  placeholder = "選択または入力",
  className = "",
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 入力値が変更されたときの処理
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // フィルタリング処理
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
    setHighlightedIndex(-1);
  }, [inputValue, options]);

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        selectOption(filteredOptions[highlightedIndex]);
      } else if (inputValue.trim()) {
        selectOption(inputValue.trim());
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectOption = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleOptionClick = (option: string) => {
    selectOption(option);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleInputKeyDown}
        className="terminal-input w-full pr-8"
        placeholder={placeholder}
      />
      
      {/* ドロップダウン矢印 */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            <ul>
              {filteredOptions.map((option, index) => (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors duration-150 ${
                      index === highlightedIndex
                        ? "bg-cyan-600/20 text-cyan-300"
                        : "text-gray-300"
                    }`}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              一致する項目がありません
            </div>
          )}
          
          {/* 新規作成オプション */}
          {inputValue.trim() && !filteredOptions.includes(inputValue.trim()) && (
            <div className="border-t border-gray-600">
              <button
                type="button"
                onClick={() => selectOption(inputValue.trim())}
                className="w-full text-left px-3 py-2 text-cyan-400 hover:bg-gray-700 transition-colors duration-150"
              >
                「{inputValue.trim()}」を新規作成
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
