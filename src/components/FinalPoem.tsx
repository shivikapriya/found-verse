import { useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { parseText } from "@/hooks/useWordSelection";
import confetti from "canvas-confetti";

interface FinalPoemProps {
  poem: string;
  sourceText: string;
  selectedIndices: Set<number>;
  sourceTitle?: string;
  onSave: () => void;
  onEdit: () => void;
  onNewPoem: () => void;
}

const FinalPoem = ({
  poem,
  sourceText,
  selectedIndices,
  sourceTitle,
  onSave,
  onEdit,
  onNewPoem,
}: FinalPoemProps) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(false);
  const poemWords = useMemo(() => poem.split("\n").filter(Boolean), [poem]);
  const allWords = useMemo(() => parseText(sourceText), [sourceText]);
  const textWords = useMemo(
    () => allWords.filter((w) => !w.isLineBreak),
    [allWords]
  );

  const handleExport = async () => {
    if (!exportRef.current) return;
    try {
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        backgroundColor: "#f4ecd8",
      });

      if (navigator.share && navigator.canShare) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `blackout-poem-${Date.now()}.png`, {
          type: "image/png",
        });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Blackout Poem" });
          return;
        }
      }

      const link = document.createElement("a");
      link.download = `blackout-poem-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleSave = () => {
    onSave();
    setSaved(true);
    // Celebration!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#1a1a1a", "#f4ecd8", "#d4c5a0"],
    });
  };

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      <header className="border-b-2 border-foreground px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onEdit}
            className="font-mono text-sm hover:text-muted-foreground transition-colors"
          >
            ← Edit Poem
          </button>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Step 3 of 3 · Your Poem
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          {/* Celebration message */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-6"
          >
            <p className="font-display text-2xl mb-1">✨ You made a poem</p>
            <p className="font-mono text-xs text-muted-foreground">
              {poemWords.length} words found in the noise
            </p>
          </motion.div>

          {/* Preview display — shows blackout view */}
          <div className="bg-card border-2 border-foreground p-6 md:p-8 shadow-[var(--shadow-dramatic)] vignette relative halftone-overlay">
            <div className="flex flex-wrap gap-x-2 gap-y-1 relative z-10 leading-[2.2]">
              {textWords.map((word) => {
                const isSelected = selectedIndices.has(word.index);
                const rotation = ((word.index * 7) % 5) - 2;
                if (isSelected) {
                  return (
                    <span
                      key={word.index}
                      className="word-blackout-visible font-serif text-sm md:text-base font-bold"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      {word.text}
                    </span>
                  );
                }
                return (
                  <span
                    key={word.index}
                    className="word-blacked-out font-serif text-sm md:text-base"
                  >
                    {word.text}
                  </span>
                );
              })}
            </div>
            {sourceTitle && (
              <p className="mt-6 text-xs font-mono text-muted-foreground text-center italic relative z-10">
                Found in: {sourceTitle}
              </p>
            )}
            <div className="mt-3 text-center relative z-10">
              <p className="text-[10px] font-mono text-muted-foreground/60">
                Made with Blackout Poetry Generator
              </p>
              <p className="text-[9px] font-mono text-muted-foreground/40 mt-0.5">
                (It takes 2 minutes to beat boredom)
              </p>
            </div>
          </div>

          {/* Hidden export element — full blackout view */}
          <div
            ref={exportRef}
            className="absolute -left-[9999px] top-0"
            style={{
              width: "1080px",
              padding: "60px",
              backgroundColor: "#f4ecd8",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 8px",
                lineHeight: "2.2",
              }}
            >
              {textWords.map((word) => {
                const isSelected = selectedIndices.has(word.index);
                const rotation = ((word.index * 7) % 5) - 2;
                if (isSelected) {
                  return (
                    <span
                      key={word.index}
                      style={{
                        display: "inline-block",
                        border: "3px solid #000",
                        padding: "2px 6px",
                        fontFamily: "Georgia, serif",
                        fontSize: "18px",
                        fontWeight: 700,
                        transform: `rotate(${rotation}deg)`,
                        borderRadius: "1px",
                      }}
                    >
                      {word.text}
                    </span>
                  );
                }
                return (
                  <span
                    key={word.index}
                    style={{
                      display: "inline-block",
                      background: "#000",
                      color: "#000",
                      padding: "2px 4px",
                      fontFamily: "Georgia, serif",
                      fontSize: "18px",
                      borderRadius: "1px",
                    }}
                  >
                    {word.text}
                  </span>
                );
              })}
            </div>
            {sourceTitle && (
              <p
                style={{
                  marginTop: "30px",
                  fontFamily: "Courier New, monospace",
                  fontSize: "12px",
                  color: "#888",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Found in: {sourceTitle}
              </p>
            )}
            <p
              style={{
                marginTop: "16px",
                fontFamily: "Courier New, monospace",
                fontSize: "11px",
                color: "#aaa",
                textAlign: "center",
              }}
            >
              Made with Blackout Poetry Generator
            </p>
            <p
              style={{
                marginTop: "4px",
                fontFamily: "Courier New, monospace",
                fontSize: "10px",
                color: "#bbb",
                textAlign: "center",
              }}
            >
              (It takes 2 minutes to beat boredom)
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleExport} className="stamp-button text-sm">
              Download Image
            </button>
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span
                  key="saved"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-3 px-6 border-2 border-foreground font-mono text-sm uppercase tracking-widest bg-muted text-center"
                >
                  ✓ Saved!
                </motion.span>
              ) : (
                <motion.button
                  key="save"
                  onClick={handleSave}
                  className="py-3 px-6 border-2 border-foreground font-mono text-sm uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Save to Vault
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            <button
              onClick={onEdit}
              className="font-mono text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Edit Poem
            </button>
            <button
              onClick={onNewPoem}
              className="font-mono text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Start New Poem
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default FinalPoem;
