import { useState } from "react";
import { motion } from "framer-motion";
import { EXAMPLE_TEXTS } from "@/data/examples";

interface TextInputProps {
  onSubmit: (text: string, title?: string) => void;
  onBack: () => void;
  initialExample?: boolean;
}

const LOADING_MESSAGES = [
  "Scanning the archives...",
  "Digging through long reads...",
  "Finding something worth blacking out...",
  "Unearthing hidden poetry...",
  "Searching for your next masterpiece...",
];

async function fetchLongreadsArticle() {
  const feed = "https://longreads.com/feed/";
  const proxy = "https://api.allorigins.win/raw?url=";

  const res = await fetch(proxy + encodeURIComponent(feed));
  if (!res.ok) throw new Error("Failed to fetch feed");

  const xmlText = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");
  const items = [...xml.querySelectorAll("item")];

  if (!items.length) throw new Error("No articles found");

  const item = items[Math.floor(Math.random() * items.length)];
  const title = item.querySelector("title")?.textContent || "Untitled";
  const link = item.querySelector("link")?.textContent || "";

  let html = "";
  const content = item.getElementsByTagName("content:encoded")[0];
  if (content) {
    html = content.textContent || "";
  } else {
    html = item.querySelector("description")?.textContent || "";
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  let text = (doc.body.textContent || "")
    .replace(/\s+/g, " ")
    .trim();

  const words = text.split(/\s+/);
  if (words.length > 350) {
    text = words.slice(0, 350).join(" ") + "...";
  }

  if (words.length < 30) {
    throw new Error("Text too short");
  }

  return { text, source: title, url: link };
}

const TextInput = ({ onSubmit, onBack, initialExample }: TextInputProps) => {
  const [tab, setTab] = useState<"paste" | "fetch" | "example">(
    initialExample ? "example" : "paste"
  );
  const [text, setText] = useState("");
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const [fetchedText, setFetchedText] = useState("");
  const [fetchedSource, setFetchedSource] = useState("");
  const [fetchedUrl, setFetchedUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  const MAX_CHARS = 2000;
  const MIN_CHARS = 50;

  const handleFetch = async () => {
    setIsFetching(true);
    setFetchError("");
    // Cycle loading messages
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 2000);
    try {
      const result = await fetchLongreadsArticle();
      setFetchedText(result.text.slice(0, MAX_CHARS));
      setFetchedSource(result.source);
      setFetchedUrl(result.url);
    } catch {
      setFetchError("Couldn't fetch fresh text. Try using an example instead!");
    } finally {
      clearInterval(msgInterval);
      setIsFetching(false);
    }
  };

  const handleSubmit = () => {
    if (tab === "paste" && text.trim().length >= MIN_CHARS) {
      onSubmit(text.trim());
    } else if (tab === "fetch" && fetchedText.trim().length >= MIN_CHARS) {
      onSubmit(fetchedText.trim(), fetchedSource || undefined);
    } else if (tab === "example" && selectedExample) {
      const ex = EXAMPLE_TEXTS.find((e) => e.id === selectedExample);
      if (ex) onSubmit(ex.text, ex.title);
    }
  };

  const isReady =
    (tab === "paste" && text.trim().length >= MIN_CHARS) ||
    (tab === "fetch" && fetchedText.trim().length >= MIN_CHARS) ||
    (tab === "example" && selectedExample !== null);

  const tabs = [
    { key: "paste" as const, label: "Paste Your Own" },
    { key: "fetch" as const, label: "Get Fresh Text" },
    { key: "example" as const, label: "Try Example" },
  ];

  return (
    <div className="min-h-screen flex flex-col paper-texture">
      <header className="border-b-2 border-foreground px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="font-mono text-sm hover:text-muted-foreground transition-colors"
          >
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
            {tabs.map((t, i) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-3 font-mono text-xs sm:text-sm uppercase tracking-widest transition-colors ${
                  i > 0 ? "border-l-2 border-foreground" : ""
                } ${
                  tab === t.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "paste" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Paste any text here: articles, essays, book passages..."
                className="w-full h-64 md:h-80 p-6 bg-card border-2 border-dashed border-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-solid placeholder:text-muted-foreground"
              />
              <div className="flex justify-between mt-2">
                {text.length > 0 && text.length < MIN_CHARS && (
                  <span className="font-mono text-xs text-muted-foreground">
                    Need at least {MIN_CHARS} characters
                  </span>
                )}
                <span className="ml-auto" />
                <span
                  className={`font-mono text-xs ${
                    text.length > 1900
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {text.length} / {MAX_CHARS}
                </span>
              </div>
            </motion.div>
          )}

          {tab === "fetch" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="text-muted-foreground">📖</span>
                  <span>Longreads</span>
                </div>
                <button
                  onClick={handleFetch}
                  disabled={isFetching}
                  className={`stamp-button text-xs !py-2 !px-4 ${
                    isFetching ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isFetching
                    ? "Fetching..."
                    : fetchedText
                    ? "Get Different Text"
                    : "Fetch Fresh Text"}
                </button>
              </div>

              {fetchError && (
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-destructive">
                    {fetchError}
                  </p>
                  <button
                    onClick={() => setTab("example")}
                    className="font-mono text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground"
                  >
                    Use example instead
                  </button>
                </div>
              )}

              {fetchedText ? (
                <div>
                  <textarea
                    value={fetchedText}
                    onChange={(e) =>
                      setFetchedText(e.target.value.slice(0, MAX_CHARS))
                    }
                    className="w-full h-64 md:h-80 p-6 bg-card border-2 border-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground italic">
                        Source: {fetchedSource}
                      </span>
                      {fetchedUrl && (
                        <a
                          href={fetchedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                        >
                          ↗ Original
                        </a>
                      )}
                    </div>
                    <span
                      className={`font-mono text-xs ${
                        fetchedText.length > 1900
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {fetchedText.length} / {MAX_CHARS}
                    </span>
                  </div>
                </div>
              ) : (
                !isFetching && (
                  <div className="h-64 md:h-80 border-2 border-dashed border-foreground bg-card flex items-center justify-center">
                    <div className="text-center px-8">
                      <p className="font-display text-xl mb-2">📖</p>
                      <p className="font-mono text-sm text-muted-foreground">
                        Fetch a long-form article from Longreads
                      </p>
                      <p className="font-mono text-xs text-muted-foreground/70 mt-1">
                        Great essays waiting to become poetry
                      </p>
                    </div>
                  </div>
                )
              )}

              {isFetching && (
                <div className="h-64 md:h-80 border-2 border-foreground bg-card flex items-center justify-center">
                  <div className="text-center">
                    {/* Ink spreading animation */}
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-foreground"
                        initial={{ scale: 0, opacity: 0.8 }}
                        animate={{ scale: [0, 1.2, 0.8, 1], opacity: [0.8, 0.3, 0.6, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="absolute inset-2 rounded-full bg-foreground"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1, 0.6, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                      />
                      <motion.div
                        className="absolute inset-4 rounded-full bg-card"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 0.8, 1, 0.9] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      />
                    </div>
                    <motion.p
                      key={loadingMsg}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-mono text-sm text-muted-foreground"
                    >
                      {loadingMsg}
                    </motion.p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === "example" && (
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
                      ? "border-foreground bg-primary/5 shadow-[var(--shadow-card)]"
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
