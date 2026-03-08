import { motion, AnimatePresence } from "framer-motion";
import type { Poem } from "@/types/poem";

interface PoemVaultProps {
  poems: Poem[];
  onBack: () => void;
  onDeletePoem: (id: string) => void;
  onViewPoem: (poem: Poem) => void;
}

const PoemVault = ({ poems, onBack, onDeletePoem, onViewPoem }: PoemVaultProps) => {
  return (
    <div className="min-h-screen flex flex-col paper-texture">
      <header className="border-b-2 border-foreground px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="font-mono text-sm hover:text-muted-foreground transition-colors">
            ← Back
          </button>
          <h1 className="font-display text-2xl">
            My Poems{" "}
            <span className="text-sm font-mono text-muted-foreground">
              ({poems.length})
            </span>
          </h1>
          <div />
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {poems.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl mb-2">No poems yet</p>
              <p className="font-mono text-sm text-muted-foreground">
                Create your first poem and it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {poems.map((poem, i) => (
                  <motion.div
                    key={poem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border-2 border-foreground p-5 cursor-pointer hover:shadow-[var(--shadow-card)] transition-shadow group"
                    onClick={() => onViewPoem(poem)}
                  >
                    <p className="font-mono text-sm leading-relaxed line-clamp-4 mb-3">
                      {poem.finalPoem}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        {poem.sourceTitle && (
                          <p className="text-xs font-mono text-muted-foreground italic truncate max-w-[150px]">
                            {poem.sourceTitle}
                          </p>
                        )}
                        <p className="text-xs font-mono text-muted-foreground">
                          {poem.wordCount} words · {new Date(poem.created).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePoem(poem.id);
                        }}
                        className="text-xs font-mono text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PoemVault;
