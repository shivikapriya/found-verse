import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseText } from "@/hooks/useWordSelection";

const EXAMPLE_TEXT =
  "The company announced today that quarterly profits exceeded expectations despite challenges in the global market and ongoing supply chain disruptions that have plagued the industry for months";

const SELECTED = new Set([3, 5, 6, 7, 9, 13, 16, 20, 24, 29]);

interface LandingProps {
  onCreatePoem: () => void;
  onTryExample: () => void;
  poemCount: number;
  onViewVault: () => void;
}

const Landing = ({ onCreatePoem, onTryExample, poemCount, onViewVault }: LandingProps) => {
  const words = parseText(EXAMPLE_TEXT);
  const [phase, setPhase] = useState<"typing" | "blackout" | "showing">("typing");
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (phase === "typing") {
      if (visibleCount < words.length) {
        const timer = setTimeout(() => setVisibleCount((c) => c + 1), 60);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setPhase("blackout"), 1500);
        return () => clearTimeout(timer);
      }
    }
    if (phase === "blackout") {
      const timer = setTimeout(() => setPhase("showing"), 600);
      return () => clearTimeout(timer);
    }
    if (phase === "showing") {
      const timer = setTimeout(() => {
        setPhase("typing");
        setVisibleCount(0);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase, visibleCount, words.length]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 paper-texture">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h1 className="text-5xl md:text-7xl font-display mb-2 tracking-tight">
          Blackout
          <br />
          Poetry
        </h1>
        <p className="text-muted-foreground font-mono text-sm md:text-base mb-10 tracking-wider uppercase">
          Turn any text into found poetry
        </p>

        {/* Animated Example */}
        <div className="bg-card p-6 md:p-8 border-2 border-foreground mb-10 text-left leading-[2.2] relative shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {words.map((word, i) => {
              if (word.isLineBreak) return null;
              const isVisible = i < visibleCount;
              const isSelected = SELECTED.has(word.index);
              const isBlackout = phase === "blackout" || phase === "showing";

              if (!isVisible) return <span key={i} className="opacity-0 font-mono">{word.text}</span>;

              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isBlackout && !isSelected ? 0.12 : 1,
                  }}
                  transition={{ duration: 0.4, delay: isBlackout && !isSelected ? i * 0.02 : 0 }}
                  className={`font-mono text-sm md:text-base transition-all duration-300 ${
                    isBlackout && isSelected
                      ? "word-blackout-selected font-bold"
                      : ""
                  }`}
                >
                  {word.text}
                </motion.span>
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

        <div className="mt-16 flex justify-center gap-8 text-sm font-mono text-muted-foreground">
          {poemCount > 0 && (
            <button onClick={onViewVault} className="hover:text-foreground transition-colors underline underline-offset-4">
              My Poems ({poemCount})
            </button>
          )}
        </div>

        <p className="mt-12 text-xs text-muted-foreground font-mono italic">
          "Everyone is a poet, they just don't know it yet"
        </p>
      </motion.div>
    </div>
  );
};

export default Landing;
