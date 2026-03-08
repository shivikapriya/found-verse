import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";

interface FinalPoemProps {
  poem: string;
  sourceTitle?: string;
  onSave: () => void;
  onEdit: () => void;
  onNewPoem: () => void;
}

const FinalPoem = ({ poem, sourceTitle, onSave, onEdit, onNewPoem }: FinalPoemProps) => {
  const poemRef = useRef<HTMLDivElement>(null);
  const poemWords = useMemo(() => poem.split("\n").filter(Boolean), [poem]);

  const handleExport = async () => {
    if (!poemRef.current) return;
    try {
      const dataUrl = await toPng(poemRef.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 2,
        backgroundColor: "#f4ecd8",
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px",
          width: "1080px",
          height: "1080px",
        },
      });

      // Try Web Share API
      if (navigator.share && navigator.canShare) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `blackout-poem-${Date.now()}.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Blackout Poem" });
          return;
        }
      }

      // Fallback: download
      const link = document.createElement("a");
      link.download = `blackout-poem-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      <header className="border-b-2 border-foreground px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={onEdit} className="font-mono text-sm hover:text-muted-foreground transition-colors">
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
          {/* Poem display */}
          <div
            ref={poemRef}
            className="bg-card border-2 border-foreground p-10 md:p-16 shadow-[var(--shadow-dramatic)] vignette relative halftone-overlay"
          >
            <div className="flex flex-wrap gap-3 justify-center relative z-10">
              {poemWords.map((word, i) => {
                const rotation = (i * 7 % 5) - 2;
                return (
                  <span
                    key={i}
                    className="word-selected-box font-serif font-bold text-lg md:text-xl"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
            {sourceTitle && (
              <p className="mt-8 text-xs font-mono text-muted-foreground text-center italic relative z-10">
                Found in: {sourceTitle}
              </p>
            )}
            <div className="mt-4 text-center relative z-10">
              <p className="text-[10px] font-mono text-muted-foreground/60">
                Made with Blackout Poetry Generator
              </p>
              <p className="text-[9px] font-mono text-muted-foreground/40 mt-0.5">
                (It takes 2 minutes to beat boredom)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleExport} className="stamp-button text-sm">
              Download Image
            </button>
            <button
              onClick={onSave}
              className="py-3 px-6 border-2 border-foreground font-mono text-sm uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Save to Vault
            </button>
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
