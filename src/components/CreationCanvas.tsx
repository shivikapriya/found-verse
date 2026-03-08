import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseText } from "@/hooks/useWordSelection";
import type { WordToken } from "@/hooks/useWordSelection";

interface CreationCanvasProps {
  sourceText: string;
  sourceTitle?: string;
  selectedIndices: Set<number>;
  onToggleWord: (index: number) => void;
  onUndo: () => void;
  onClearAll: () => void;
  canUndo: boolean;
  wordCount: number;
  onFinish: () => void;
  onBack: () => void;
}

const Word = ({
  token,
  isSelected,
  blackoutMode,
  onToggle,
}: {
  token: WordToken;
  isSelected: boolean;
  blackoutMode: boolean;
  onToggle: () => void;
}) => {
  const [justTapped, setJustTapped] = useState(false);
  const rotation = useMemo(() => (token.index * 7 % 5) - 2, [token.index]);

  const handleClick = () => {
    onToggle();
    setJustTapped(true);
    setTimeout(() => setJustTapped(false), 250);
  };

  if (token.isLineBreak) return <br />;

  let className =
    "font-serif text-sm md:text-base cursor-pointer select-none inline-block transition-all duration-200 ";

  if (blackoutMode) {
    if (isSelected) {
      className += "word-blackout-visible ";
    } else {
      className += "word-blacked-out ";
    }
  } else {
    if (isSelected) {
      className += "word-selected-box ";
    } else {
      className += "px-0.5 py-0.5 word-hover-underline ";
    }
  }

  const style: React.CSSProperties = {};
  if (isSelected) {
    style.transform = `rotate(${rotation}deg)`;
  }
  if (justTapped && isSelected) {
    style.transform = `scale(1.1) rotate(${rotation}deg)`;
  }

  return (
    <motion.span
      onClick={handleClick}
      className={className}
      style={{ ...style, minWidth: "24px", minHeight: "24px" }}
      whileTap={{ scale: 1.1 }}
    >
      {token.text}
    </motion.span>
  );
};

const CreationCanvas = ({
  sourceText,
  sourceTitle,
  selectedIndices,
  onToggleWord,
  onUndo,
  onClearAll,
  canUndo,
  wordCount,
  onFinish,
  onBack,
}: CreationCanvasProps) => {
  const [blackoutMode, setBlackoutMode] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const words = useMemo(() => parseText(sourceText), [sourceText]);

  // Hide hint after first selection
  useEffect(() => {
    if (wordCount > 0) setShowHint(false);
  }, [wordCount]);

  const poemPreview = useMemo(() => {
    return words
      .filter((w) => !w.isLineBreak && selectedIndices.has(w.index))
      .map((w) => w.text)
      .join(" ");
  }, [words, selectedIndices]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "b" && !e.metaKey && !e.ctrlKey) {
        if ((e.target as HTMLElement).tagName !== "INPUT") {
          setBlackoutMode((m) => !m);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        onUndo();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onUndo]);

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b-2 border-foreground px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={onBack}
            className="font-mono text-sm hover:text-muted-foreground transition-colors"
          >
            ← Back
          </button>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Step 2 of 3 · Select Words
          </span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-bold">
              {wordCount} words
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">Blackout</span>
              <button
                onClick={() => setBlackoutMode((m) => !m)}
                className={`w-10 h-5 rounded-full border-2 border-foreground transition-colors relative ${
                  blackoutMode ? "bg-primary" : "bg-card"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
                    blackoutMode
                      ? "left-5 bg-primary-foreground"
                      : "left-0.5 bg-foreground"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto flex gap-3 mt-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="font-mono text-xs underline underline-offset-2 disabled:opacity-30 disabled:no-underline hover:text-muted-foreground transition-colors"
          >
            Undo
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={wordCount === 0}
            className="font-mono text-xs underline underline-offset-2 disabled:opacity-30 disabled:no-underline hover:text-destructive transition-colors"
          >
            Clear All
          </button>
        </div>
      </header>

      {/* Canvas */}
      <main className="flex-1 flex">
        <div className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-3xl mx-auto">
            {/* Onboarding hint */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 border-2 border-dashed border-foreground/40 bg-card/80 text-center"
                >
                  <p className="font-mono text-xs text-muted-foreground">
                    👆 <strong>Tap any word</strong> to keep it in your poem. Toggle <strong>Blackout</strong> to see the magic. Press <kbd className="px-1 border border-foreground/30 rounded text-[10px]">B</kbd> for shortcut.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-card border-2 border-foreground p-6 md:p-8 leading-[2.4] flex flex-wrap gap-x-2 gap-y-1 shadow-[var(--shadow-card)] halftone-overlay relative">
              {words.map((token, i) => (
                <Word
                  key={i}
                  token={token}
                  isSelected={
                    !token.isLineBreak && selectedIndices.has(token.index)
                  }
                  blackoutMode={blackoutMode}
                  onToggle={() =>
                    !token.isLineBreak && onToggleWord(token.index)
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Preview */}
        <div className="hidden lg:block w-72 border-l-2 border-foreground p-6 bg-card/50">
          <h3 className="font-display text-lg mb-4">Your poem so far...</h3>
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap min-h-[100px]">
            {poemPreview || (
              <span className="text-muted-foreground italic">
                Tap words to select them
              </span>
            )}
          </div>
          {wordCount >= 3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 font-mono text-xs text-muted-foreground/70 italic"
            >
              Looking good! Try toggling Blackout mode to see it come alive ✨
            </motion.p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 z-10 bg-background/90 backdrop-blur border-t-2 border-foreground px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="lg:hidden font-mono text-xs text-muted-foreground max-w-[60%] truncate">
            {poemPreview || "Tap words to begin..."}
          </div>
          <div className="hidden lg:block" />
          <button
            onClick={onFinish}
            disabled={wordCount < 3}
            className={`stamp-button text-sm ${
              wordCount < 3 ? "opacity-30 cursor-not-allowed" : ""
            }`}
          >
            {wordCount < 3
              ? `Select ${3 - wordCount} more word${3 - wordCount > 1 ? "s" : ""}`
              : "Finish Poem →"}
          </button>
        </div>
      </footer>

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border-2 border-foreground p-6 max-w-sm w-full shadow-[var(--shadow-dramatic)]"
          >
            <h3 className="font-display text-xl mb-2">Start over?</h3>
            <p className="font-mono text-sm text-muted-foreground mb-6">
              This will clear all your selections.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 border-2 border-foreground font-mono text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 bg-destructive text-destructive-foreground font-mono text-sm border-2 border-foreground hover:opacity-90 transition-opacity"
              >
                Clear All
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CreationCanvas;
