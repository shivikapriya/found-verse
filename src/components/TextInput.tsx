import { useState } from "react";
import { motion } from "framer-motion";
import { EXAMPLE_TEXTS } from "@/data/examples";

interface TextInputProps {
  onSubmit: (text: string, title?: string) => void;
  onBack: () => void;
  initialExample?: boolean;
}

const TextInput = ({ onSubmit, onBack, initialExample }: TextInputProps) => {
  const [tab, setTab] = useState<"paste" | "example">(initialExample ? "example" : "paste");
  const [text, setText] = useState("");
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const MAX_CHARS = 2000;

  const handleSubmit = () => {
    if (tab === "paste" && text.trim()) {
      onSubmit(text.trim());
    } else if (selectedExample) {
      const ex = EXAMPLE_TEXTS.find((e) => e.id === selectedExample);
      if (ex) onSubmit(ex.text, ex.title);
    }
  };

  const isReady =
    (tab === "paste" && text.trim().length > 0) ||
    (tab === "example" && selectedExample !== null);

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      <header className="border-b-2 border-foreground px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="font-mono text-sm hover:text-muted-foreground transition-colors">
            ← Back
          </button>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Step 1 of 3 · Source Text
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Tab bar */}
          <div className="flex border-2 border-foreground mb-6">
            <button
              onClick={() => setTab("paste")}
              className={`flex-1 py-3 font-mono text-sm uppercase tracking-widest transition-colors ${
                tab === "paste"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted"
              }`}
            >
              Paste Your Own
            </button>
            <button
              onClick={() => setTab("example")}
              className={`flex-1 py-3 font-mono text-sm uppercase tracking-widest transition-colors border-l-2 border-foreground ${
                tab === "example"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted"
              }`}
            >
              Try Example
            </button>
          </div>

          {tab === "paste" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Paste any text: article, email, book passage, tweet..."
                className="w-full h-64 md:h-80 p-6 bg-card border-2 border-dashed border-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-solid placeholder:text-muted-foreground"
              />
              <div className="flex justify-end mt-2">
                <span
                  className={`font-mono text-xs ${
                    text.length > 1900 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {text.length} / {MAX_CHARS}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {EXAMPLE_TEXTS.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExample(ex.id)}
                  className={`w-full text-left p-4 border-2 transition-all font-mono ${
                    selectedExample === ex.id
                      ? "border-foreground bg-accent/30 shadow-[var(--shadow-card)]"
                      : "border-secondary bg-card hover:border-foreground"
                  }`}
                >
                  <div className="text-sm font-bold">{ex.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 italic">
                    {ex.source}
                  </div>
                  <div className="text-xs mt-2 line-clamp-2 text-muted-foreground">
                    {ex.text.slice(0, 120)}...
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!isReady}
              className={`stamp-button ${
                !isReady ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              Start Creating →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TextInput;
