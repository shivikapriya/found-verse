import { useState } from "react";
import { motion } from "framer-motion";
import { EXAMPLE_TEXTS } from "@/data/examples";

interface TextInputProps {
  onSubmit: (text: string, title?: string) => void;
  onBack: () => void;
  initialExample?: boolean;
}

const RSS_FEEDS: Record<string, string> = {
  "Philosophy & Ideas": "https://aeon.co/feed.rss",
  "Literary Culture": "https://lithub.com/feed/",
  "Poetic Essays": "https://www.themarginalian.org/feed/",
};

async function fetchFreshText(feedKey: string) {
  const feedUrl = RSS_FEEDS[feedKey];
  if (!feedUrl) throw new Error("Unknown feed");

  const response = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
  );
  const data = await response.json();

  if (data.status !== "ok" || !data.items?.length) {
    throw new Error("Feed failed");
  }

  const item = data.items[Math.floor(Math.random() * data.items.length)];

  let text = (item.description || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = text.split(/\s+/);
  if (words.length > 350) {
    text = words.slice(0, 350).join(" ") + "...";
  }

  return {
    text,
    source: item.title || feedKey,
    url: item.link || "",
  };
}

const TextInput = ({ onSubmit, onBack, initialExample }: TextInputProps) => {
  const [tab, setTab] = useState<"paste" | "fetch" | "example">(
    initialExample ? "example" : "paste"
  );
  const [text, setText] = useState("");
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  // Fetch state
  const [selectedFeed, setSelectedFeed] = useState(Object.keys(RSS_FEEDS)[0]);
  const [fetchedText, setFetchedText] = useState("");
  const [fetchedSource, setFetchedSource] = useState("");
  const [fetchedUrl, setFetchedUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const MAX_CHARS = 2000;
  const MIN_CHARS = 50;

  const handleFetch = async () => {
    setIsFetching(true);
    setFetchError("");
    try {
      const result = await fetchFreshText(selectedFeed);
      if (result.text.length < 50) {
        throw new Error("Text too short, try again");
      }
      setFetchedText(result.text.slice(0, MAX_CHARS));
      setFetchedSource(result.source);
      setFetchedUrl(result.url);
    } catch {
      setFetchError("Couldn't fetch fresh text. Try using an example instead!");
    } finally {
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
                <select
                  value={selectedFeed}
                  onChange={(e) => setSelectedFeed(e.target.value)}
                  className="bg-card border-2 border-foreground font-mono text-sm px-3 py-2 focus:outline-none cursor-pointer"
                >
                  {Object.keys(RSS_FEEDS).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
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
                    <p className="font-mono text-sm text-muted-foreground text-center px-8">
                      Select a source and click "Fetch Fresh Text"
                      <br />
                      to get real content to turn into poetry
                    </p>
                  </div>
                )
              )}

              {isFetching && (
                <div className="h-64 md:h-80 border-2 border-foreground bg-card flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="font-mono text-sm text-muted-foreground">
                      Fetching fresh content...
                    </p>
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
