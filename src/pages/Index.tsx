import { useState, useMemo, useCallback } from "react";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWordSelection, parseText } from "@/hooks/useWordSelection";
import Landing from "@/components/Landing";
import TextInput from "@/components/TextInput";
import CreationCanvas from "@/components/CreationCanvas";
import FinalPoem from "@/components/FinalPoem";
import PoemVault from "@/components/PoemVault";
import type { Poem } from "@/types/poem";
import { toast } from "sonner";

type Screen = "landing" | "input" | "canvas" | "final" | "vault";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [sourceText, setSourceText] = useState("");
  const [sourceTitle, setSourceTitle] = useState<string | undefined>();
  const [initialExample, setInitialExample] = useState(false);
  const [poems, setPoems] = useLocalStorage<Poem[]>("blackout-poems", []);

  const {
    selectedIndices,
    toggleWord,
    undo,
    clearAll,
    reset,
    canUndo,
    wordCount,
  } = useWordSelection();

  const words = useMemo(() => parseText(sourceText), [sourceText]);

  const finalPoem = useMemo(() => {
    return words
      .filter((w) => !w.isLineBreak && selectedIndices.has(w.index))
      .map((w) => w.text)
      .join("\n");
  }, [words, selectedIndices]);

  const handleTextSubmit = useCallback(
    (text: string, title?: string) => {
      setSourceText(text);
      setSourceTitle(title);
      reset();
      setScreen("canvas");
    },
    [reset]
  );

  const handleSave = useCallback(() => {
    const poem: Poem = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      created: Date.now(),
      sourceText,
      sourceTitle,
      selectedIndices: Array.from(selectedIndices),
      finalPoem,
      wordCount,
    };
    setPoems((prev) => [poem, ...prev]);
    toast("Poem saved to vault!", {
      style: {
        fontFamily: '"Courier New", monospace',
        background: "hsl(39, 38%, 93%)",
        border: "2px solid hsl(0, 0%, 10%)",
        color: "hsl(0, 0%, 10%)",
      },
    });
  }, [sourceText, sourceTitle, selectedIndices, finalPoem, wordCount, setPoems]);

  const handleDeletePoem = useCallback(
    (id: string) => {
      setPoems((prev) => prev.filter((p) => p.id !== id));
      toast("Poem deleted", {
        style: {
          fontFamily: '"Courier New", monospace',
          background: "hsl(39, 38%, 93%)",
          border: "2px solid hsl(0, 0%, 10%)",
          color: "hsl(0, 0%, 10%)",
        },
      });
    },
    [setPoems]
  );

  const handleNewPoem = useCallback(() => {
    setSourceText("");
    setSourceTitle(undefined);
    reset();
    setScreen("input");
    setInitialExample(false);
  }, [reset]);

  switch (screen) {
    case "landing":
      return (
        <Landing
          onCreatePoem={() => {
            setInitialExample(false);
            setScreen("input");
          }}
          onTryExample={() => {
            setInitialExample(true);
            setScreen("input");
          }}
          poemCount={poems.length}
          onViewVault={() => setScreen("vault")}
        />
      );
    case "input":
      return (
        <TextInput
          onSubmit={handleTextSubmit}
          onBack={() => setScreen("landing")}
          initialExample={initialExample}
        />
      );
    case "canvas":
      return (
        <CreationCanvas
          sourceText={sourceText}
          sourceTitle={sourceTitle}
          selectedIndices={selectedIndices}
          onToggleWord={toggleWord}
          onUndo={undo}
          onClearAll={clearAll}
          canUndo={canUndo}
          wordCount={wordCount}
          onFinish={() => setScreen("final")}
          onBack={() => setScreen("input")}
        />
      );
    case "final":
      return (
        <FinalPoem
          poem={finalPoem}
          sourceText={sourceText}
          selectedIndices={selectedIndices}
          sourceTitle={sourceTitle}
          onSave={handleSave}
          onEdit={() => setScreen("canvas")}
          onNewPoem={handleNewPoem}
        />
      );
    case "vault":
      return (
        <PoemVault
          poems={poems}
          onBack={() => setScreen("landing")}
          onDeletePoem={handleDeletePoem}
          onViewPoem={(poem) => {
            setSourceText(poem.sourceText);
            setSourceTitle(poem.sourceTitle);
            reset();
            poem.selectedIndices.forEach((i) => toggleWord(i));
            setScreen("final");
          }}
        />
      );
  }
};

export default Index;
