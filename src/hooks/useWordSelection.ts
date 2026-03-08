import { useState, useCallback } from "react";

export interface WordToken {
  text: string;
  index: number;
  isLineBreak: boolean;
}

export function parseText(text: string): WordToken[] {
  const lines = text.split("\n");
  const tokens: WordToken[] = [];
  let index = 0;

  lines.forEach((line, lineIdx) => {
    const words = line.split(/\s+/).filter(Boolean);
    words.forEach((word) => {
      tokens.push({ text: word, index, isLineBreak: false });
      index++;
    });
    if (lineIdx < lines.length - 1) {
      tokens.push({ text: "\n", index: -1, isLineBreak: true });
    }
  });

  return tokens;
}

export function useWordSelection() {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [history, setHistory] = useState<Set<number>[]>([]);

  const toggleWord = useCallback((index: number) => {
    setSelectedIndices((prev) => {
      setHistory((h) => [...h.slice(-9), new Set(prev)]);
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setSelectedIndices(last);
      return prev.slice(0, -1);
    });
  }, []);

  const clearAll = useCallback(() => {
    setHistory((h) => [...h.slice(-9), new Set(selectedIndices)]);
    setSelectedIndices(new Set());
  }, [selectedIndices]);

  const reset = useCallback(() => {
    setSelectedIndices(new Set());
    setHistory([]);
  }, []);

  return {
    selectedIndices,
    toggleWord,
    undo,
    clearAll,
    reset,
    canUndo: history.length > 0,
    wordCount: selectedIndices.size,
  };
}
