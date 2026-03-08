import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseText } from "@/hooks/useWordSelection";

const EXAMPLES = [
  {
    text: "My mother used to say that worry was just love with nowhere to go. She would stand at the window watching for my return, imagining every possible disaster. I didn't understand then that her fear was proof of how much she cared, how the world felt dangerous because I was in it.",
    poems: [
      ["worry", "was", "just", "love", "with", "nowhere", "to", "go", "imagining", "every", "possible", "disaster"],
      ["my", "mother", "watching", "for", "my", "return", "her", "fear", "was", "proof", "of", "how", "much", "she", "cared"],
      ["love", "with", "nowhere", "to", "go", "the", "world", "felt", "dangerous", "because", "I", "was", "in", "it"],
    ],
  },
  {
    text: "Scientists have discovered that the common household cat spends approximately 70% of its life sleeping. They seem to exist in a state between dreaming and waking, moving through our world as if they know something we don't. Research suggests they can sense changes in atmospheric pressure hours before we notice any difference.",
    poems: [
      ["cat", "between", "dreaming", "and", "waking", "as", "if", "they", "know", "something", "we", "don't"],
      ["exist", "in", "a", "state", "between", "dreaming", "and", "waking", "sense", "changes", "before", "we", "notice"],
    ],
  },
  {
    text: "In the coffee shop, everyone is alone together. Headphones in, eyes down, carefully avoiding the proximity of strangers. We've built invisible walls in public spaces, protecting ourselves from the possibility of connection. Sometimes I wonder if we're hiding or just afraid of being seen.",
    poems: [
      ["everyone", "is", "alone", "together", "carefully", "avoiding", "the", "possibility", "of", "connection"],
      ["we've", "built", "invisible", "walls", "protecting", "ourselves", "from", "connection", "afraid", "of", "being", "seen"],
      ["in", "the", "coffee", "shop", "eyes", "down", "hiding", "afraid", "of", "being", "seen"],
    ],
  },
];

function getSelectedIndices(
  words: ReturnType<typeof parseText>,
  poemWords: string[]
): Set<number> {
  const textWords = words.filter((w) => !w.isLineBreak);
  const selected = new Set<number>();
  let searchFrom = 0;

  for (const target of poemWords) {
    for (let i = searchFrom; i < textWords.length; i++) {
      if (
        textWords[i].text.toLowerCase().replace(/[.,!?;:'"]/g, "") ===
        target.toLowerCase().replace(/[.,!?;:'"]/g, "")
      ) {
        selected.add(textWords[i].index);
        searchFrom = i + 1;
        break;
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

const Landing = ({
  onCreatePoem,
  onTryExample,
  poemCount,
  onViewVault,
}: LandingProps) => {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [poemVariant, setPoemVariant] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const currentExample = EXAMPLES[exampleIdx];
  const currentPoemWords = currentExample.poems[poemVariant % currentExample.poems.length];

  const words = useMemo(() => parseText(currentExample.text), [currentExample.text]);
  const selectedIndices = useMemo(
    () => getSelectedIndices(words, currentPoemWords),
    [words, currentPoemWords]
  );
  const textWords = useMemo(() => words.filter((w) => !w.isLineBreak), [words]);

  const [phase, setPhase] = useState<"visible" | "boxing" | "blackout" | "showing">("visible");
  const [boxedCount, setBoxedCount] = useState(0);
  const [blackedCount, setBlackedCount] = useState(0);

  const selectedInOrder = useMemo(() => {
    const result: number[] = [];
    let searchFrom = 0;
    const tw = textWords;
    for (const target of currentPoemWords) {
      for (let i = searchFrom; i < tw.length; i++) {
        if (tw[i].text.toLowerCase().replace(/[.,!?;:'"]/g, "") === target.toLowerCase().replace(/[.,!?;:'"]/g, "")) {
          result.push(tw[i].index);
          searchFrom = i + 1;
          break;
        }
      }
    }
    return result;
  }, [textWords, currentPoemWords]);

  const advanceExample = useCallback(() => {
    const nextPoemVar = poemVariant + 1;
    if (nextPoemVar >= currentExample.poems.length) {
      setPoemVariant(0);
      setExampleIdx((prev) => (prev + 1) % EXAMPLES.length);
    } else {
      setPoemVariant(nextPoemVar);
    }
  }, [poemVariant, currentExample.poems.length]);

  useEffect(() => {
    if (phase === "visible") {
      const timer = setTimeout(() => {
        setPhase("boxing");
        setBoxedCount(0);
      }, 1800);
      return () => clearTimeout(timer);
    }
    if (phase === "boxing") {
      if (boxedCount < selectedInOrder.length) {
        const timer = setTimeout(() => setBoxedCount((c) => c + 1), 250);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setPhase("blackout");
          setBlackedCount(0);
        }, 400);
        return () => clearTimeout(timer);
      }
    }
    if (phase === "blackout") {
      const nonSelected = textWords.filter((w) => !selectedIndices.has(w.index));
      if (blackedCount < nonSelected.length) {
        const timer = setTimeout(() => setBlackedCount((c) => c + 1), 40);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setPhase("showing"), 100);
        return () => clearTimeout(timer);
      }
    }
    if (phase === "showing") {
      const timer = setTimeout(() => {
        advanceExample();
        setPhase("visible");
        setBoxedCount(0);
        setBlackedCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, boxedCount, blackedCount, selectedInOrder.length, textWords, selectedIndices, advanceExample]);

  const boxedSet = useMemo(
    () => new Set(selectedInOrder.slice(0, boxedCount)),
    [selectedInOrder, boxedCount]
  );
  const nonSelectedWords = useMemo(
    () => textWords.filter((w) => !selectedIndices.has(w.index)),
    [textWords, selectedIndices]
  );

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
        <p className="text-muted-foreground font-mono text-sm md:text-base mb-3 tracking-wider uppercase">
          Find hidden poetry in everyday text
        </p>

        {/* Subtle hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="font-mono text-xs text-muted-foreground/70 mb-6 italic"
        >
          ↓ Watch the magic — paste any text, pick your words, share your poem in 2 minutes
        </motion.p>

        {/* Animated Example */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${exampleIdx}-${poemVariant}`}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            className="bg-card p-5 md:p-8 border-2 border-foreground mb-8 text-left leading-[2] relative shadow-[var(--shadow-card)] halftone-overlay"
          >
            <div className="flex flex-wrap gap-x-2 gap-y-1 relative z-10">
              {textWords.map((word) => {
                const isSelected = selectedIndices.has(word.index);
                const isBoxed = boxedSet.has(word.index);
                const isInBlackoutPhase = phase === "blackout" || phase === "showing";
                const nonSelIdx = nonSelectedWords.findIndex((w) => w.index === word.index);
                const isBlackedOut = isInBlackoutPhase && !isSelected && nonSelIdx < blackedCount;

                let style: React.CSSProperties = {};
                let className = "font-serif text-sm md:text-base inline-block transition-all duration-200 ";

                if (isBlackedOut) {
                  className += "word-blacked-out";
                } else if (isBoxed || (isInBlackoutPhase && isSelected)) {
                  const rotation = ((word.index * 7) % 5) - 2;
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
          </motion.div>
        </AnimatePresence>

        {/* Example dots indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {EXAMPLES.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full border border-foreground transition-all ${
                i === exampleIdx ? "bg-foreground scale-125" : "bg-transparent"
              }`}
            />
          ))}
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

        <div className="mt-10 flex justify-center gap-8 text-sm font-mono text-muted-foreground">
          <button
            onClick={() => setShowVideo(true)}
            className="hover:text-foreground transition-colors underline underline-offset-4"
          >
            How it works ▶
          </button>
          {poemCount > 0 && (
            <button
              onClick={onViewVault}
              className="hover:text-foreground transition-colors underline underline-offset-4"
            >
              My Vault ({poemCount})
            </button>
          )}
        </div>

        <p className="mt-10 text-xs text-muted-foreground font-mono">
          Inspired by Austin Kleon's <em>Newspaper Blackout</em>
        </p>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border-2 border-foreground w-full max-w-2xl shadow-[var(--shadow-dramatic)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b-2 border-foreground">
                <span className="font-mono text-sm uppercase tracking-widest">
                  How It Works
                </span>
                <button
                  onClick={() => setShowVideo(false)}
                  className="font-mono text-lg hover:text-muted-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
                  <div className="p-3 border-2 border-foreground bg-card">
                    <div className="text-2xl mb-2">📝</div>
                    <div className="font-bold">1. Paste Text</div>
                    <div className="text-muted-foreground mt-1">Any article, essay, or passage</div>
                  </div>
                  <div className="p-3 border-2 border-foreground bg-card">
                    <div className="text-2xl mb-2">👆</div>
                    <div className="font-bold">2. Tap Words</div>
                    <div className="text-muted-foreground mt-1">Select words that speak to you</div>
                  </div>
                  <div className="p-3 border-2 border-foreground bg-card">
                    <div className="text-2xl mb-2">🖤</div>
                    <div className="font-bold">3. Black Out</div>
                    <div className="text-muted-foreground mt-1">Watch your poem emerge</div>
                  </div>
                </div>
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "56.25%", height: 0, overflow: "hidden" }}
                >
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src="https://www.youtube.com/embed/wKpVgoGr6kE"
                    title="Austin Kleon Blackout Poetry"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
              <p className="font-mono text-xs text-muted-foreground py-3 px-4 border-t-2 border-foreground">
                Learn the art from Austin Kleon himself
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
