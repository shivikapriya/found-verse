import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { parseText } from "@/hooks/useWordSelection";

const EXAMPLE_TEXT =
  "Scientists have discovered that the common household cat spends approximately 70% of its life sleeping. They seem to exist in a state between dreaming and waking, moving through our world as if they know something we don't. Research suggests they can sense changes in atmospheric pressure hours before we notice any difference.";

// Words to select: "cat", "between dreaming and waking", "as if they know", "something we don't"
// We'll identify these by their word indices after parsing
const SELECTED_WORDS = new Set<string>();

function getSelectedIndices(words: ReturnType<typeof parseText>): Set<number> {
  const textWords = words.filter((w) => !w.isLineBreak);
  const selected = new Set<number>();

  // Find indices by matching word sequences
  const sequences = [
    ["cat"],
    ["between", "dreaming", "and", "waking,"],
    ["as", "if", "they", "know"],
    ["something", "we", "don't."],
  ];

  for (const seq of sequences) {
    for (let i = 0; i <= textWords.length - seq.length; i++) {
      let match = true;
      for (let j = 0; j < seq.length; j++) {
        if (textWords[i + j].text.toLowerCase().replace(/[.,!?;:]/g, "") !== seq[j].replace(/[.,!?;:]/g, "")) {
          match = false;
          break;
        }
      }
      if (match) {
        for (let j = 0; j < seq.length; j++) {
          selected.add(textWords[i + j].index);
        }
      }
    }
  }

  return selected;
}

interface LandingProps {
  onCreatePoem: () => void;
  onTryExample: () => void;
  poemCount: number;
  onViewVault: () => void;
}

const Landing = ({ onCreatePoem, onTryExample, poemCount, onViewVault }: LandingProps) => {
  const words = useMemo(() => parseText(EXAMPLE_TEXT), []);
  const selectedIndices = useMemo(() => getSelectedIndices(words), [words]);
  const textWords = useMemo(() => words.filter((w) => !w.isLineBreak), [words]);

  const [phase, setPhase] = useState<"visible" | "boxing" | "blackout" | "showing">("visible");
  const [boxedCount, setBoxedCount] = useState(0);
  const [blackedCount, setBlackedCount] = useState(0);

  // Collect selected indices in order for boxing animation
  const selectedInOrder = useMemo(() => {
    const result: number[] = [];
    const sequences = [
      ["cat"],
      ["between", "dreaming", "and", "waking,"],
      ["as", "if", "they", "know"],
      ["something", "we", "don't."],
    ];
    for (const seq of sequences) {
      for (let i = 0; i <= textWords.length - seq.length; i++) {
        let match = true;
        for (let j = 0; j < seq.length; j++) {
          if (textWords[i + j].text.toLowerCase().replace(/[.,!?;:]/g, "") !== seq[j].replace(/[.,!?;:]/g, "")) {
            match = false;
            break;
          }
        }
        if (match) {
          for (let j = 0; j < seq.length; j++) {
            result.push(textWords[i + j].index);
          }
          break;
        }
      }
    }
    return result;
  }, [textWords]);

  useEffect(() => {
    if (phase === "visible") {
      const timer = setTimeout(() => {
        setPhase("boxing");
        setBoxedCount(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (phase === "boxing") {
      if (boxedCount < selectedInOrder.length) {
        const timer = setTimeout(() => setBoxedCount((c) => c + 1), 300);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setPhase("blackout");
          setBlackedCount(0);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
    if (phase === "blackout") {
      const nonSelected = textWords.filter((w) => !selectedIndices.has(w.index));
      if (blackedCount < nonSelected.length) {
        const timer = setTimeout(() => setBlackedCount((c) => c + 1), 50);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setPhase("showing"), 100);
        return () => clearTimeout(timer);
      }
    }
    if (phase === "showing") {
      const timer = setTimeout(() => {
        setPhase("visible");
        setBoxedCount(0);
        setBlackedCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, boxedCount, blackedCount, selectedInOrder.length, textWords, selectedIndices]);

  const boxedSet = useMemo(() => new Set(selectedInOrder.slice(0, boxedCount)), [selectedInOrder, boxedCount]);
  const nonSelectedWords = useMemo(() => textWords.filter((w) => !selectedIndices.has(w.index)), [textWords, selectedIndices]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 md:py-12 paper-texture">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl mx-auto w-full"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display mb-2 tracking-tight">
          Blackout
          <br />
          Poetry
        </h1>
        <p className="text-muted-foreground font-mono text-sm md:text-base mb-8 tracking-wider uppercase">
          Find hidden poetry in everyday text
        </p>

        {/* YouTube Video Embed */}
        <div className="mb-8 border-2 border-foreground shadow-[var(--shadow-card)]">
          <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/wKpVgoGr6kE"
              title="Austin Kleon Blackout Poetry"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="font-mono text-xs text-muted-foreground py-2 px-3 border-t-2 border-foreground bg-card">
            Learn the art from Austin Kleon himself
          </p>
        </div>

        {/* Animated Example */}
        <div className="bg-card p-5 md:p-8 border-2 border-foreground mb-8 text-left leading-[2] relative shadow-[var(--shadow-card)] halftone-overlay">
          <div className="flex flex-wrap gap-x-2 gap-y-1 relative z-10">
            {textWords.map((word) => {
              const isSelected = selectedIndices.has(word.index);
              const isBoxed = boxedSet.has(word.index);
              const isInBlackoutPhase = phase === "blackout" || phase === "showing";
              const nonSelIdx = nonSelectedWords.findIndex((w) => w.index === word.index);
              const isBlackedOut = isInBlackoutPhase && !isSelected && nonSelIdx < blackedCount;

              // Determine style
              let style: React.CSSProperties = {};
              let className = "font-serif text-sm md:text-base inline-block transition-all duration-200 ";

              if (isBlackedOut) {
                // Solid black coverage - marker scribble
                className += "word-blacked-out";
              } else if (isBoxed || (isInBlackoutPhase && isSelected)) {
                // Hand-drawn box around selected word
                const rotation = (word.index * 7 % 5) - 2; // deterministic ±2deg
                style.transform = `rotate(${rotation}deg)`;
                className += "word-selected-box font-bold";
              } else {
                className += "px-0.5";
              }

              return (
                <span key={word.index} className={className} style={style}>
                  {word.text}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button onClick={onCreatePoem} className="stamp-button text-lg">
            Create Your Poem
          </button>
          <button
            onClick={onTryExample}
            className="font-mono text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Try an Example →
          </button>
        </div>

        <div className="mt-12 flex justify-center gap-8 text-sm font-mono text-muted-foreground">
          {poemCount > 0 && (
            <button onClick={onViewVault} className="hover:text-foreground transition-colors underline underline-offset-4">
              My Vault ({poemCount})
            </button>
          )}
        </div>

        <p className="mt-10 text-xs text-muted-foreground font-mono">
          Inspired by Austin Kleon's <em>Newspaper Blackout</em>
        </p>
      </motion.div>
    </div>
  );
};

export default Landing;
