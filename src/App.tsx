import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SolvedProblem, FilterState, Difficulty } from "./types";
import { selectRandom, extractAllTopics, filterProblems } from "./utils/selectRandom";

type SpinPhase = "idle" | "spinning" | "landing";

function App() {
  const [allProblems, setAllProblems] = useState<SolvedProblem[]>([]);
  const [problems, setProblems] = useState<SolvedProblem[]>([]);
  const [current, setCurrent] = useState<SolvedProblem | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [phase, setPhase] = useState<SpinPhase>("idle");
  const [key, setKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    difficulties: [],
    topics: [],
    prioritizeUnseen: false,
  });

  const [loading, setLoading] = useState(true);
  const statsRef = useRef<Map<string, { times_shown: number; last_shown: string | null }>>(new Map());

  useEffect(() => {
    fetch("/data/solved_problems.json")
      .then((r) => r.json())
      .then((data: SolvedProblem[]) => {
        setAllProblems(data);
        setTopics(extractAllTopics(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    setProblems(filterProblems(allProblems, filters.difficulties, filters.topics));
  }, [allProblems, filters]);

  const withStats = useCallback(
    (p: SolvedProblem): SolvedProblem => {
      const s = statsRef.current.get(p.questionId);
      return s ? { ...p, ...s } : p;
    },
    []
  );

  const enriched = useCallback(
    () =>
      problems.map((p) => {
        const s = statsRef.current.get(p.questionId);
        return s ? { ...p, ...s } : p;
      }),
    [problems]
  );

  const spin = useCallback(() => {
    if (problems.length === 0 || phase !== "idle") return;

    const final = selectRandom(enriched(), lastId, filters.prioritizeUnseen);
    if (!final) return;

    setPhase("spinning");
    let tick = 0;
    const total = 12;
    let delay = 50;

    const next = () => {
      tick++;
      if (tick >= total) {
        const ex = statsRef.current.get(final.questionId) ?? {
          times_shown: final.times_shown,
          last_shown: final.last_shown,
        };
        statsRef.current.set(final.questionId, {
          times_shown: ex.times_shown + 1,
          last_shown: new Date().toISOString(),
        });
        setCurrent(withStats(final));
        setLastId(final.questionId);
        setKey((k) => k + 1);
        setPhase("landing");
        setTimeout(() => setPhase("idle"), 500);
      } else {
        setCurrent(problems[Math.floor(Math.random() * problems.length)]);
        setKey((k) => k + 1);
        delay *= 1.2;
        setTimeout(next, delay);
      }
    };

    setCurrent(problems[Math.floor(Math.random() * problems.length)]);
    setKey((k) => k + 1);
    setTimeout(next, delay);
  }, [problems, lastId, filters.prioritizeUnseen, phase, enriched, withStats]);

  // Framer Motion
  const variants = {
    initial: { y: 60, opacity: 0, filter: "blur(8px)" },
    animate: { y: 0, opacity: 1, filter: "blur(0px)" },
    exit: { y: -60, opacity: 0, filter: "blur(8px)" },
  };

  const transition =
    phase === "landing"
      ? { type: "spring" as const, stiffness: 100, damping: 18, mass: 0.8 }
      : { duration: 0.1, ease: "easeOut" as const };

  const diffLabel = current
    ? current.difficulty.toUpperCase() +
      (current.topics.length > 0 ? ` · ${current.topics[0].toUpperCase()}` : "")
    : "";

  return (
    <>
      <div className="mesh" />

      <div className="shell">
        {/* Header */}
        <div className="header">
          <div className="logo">LeetRoulette</div>
          <div className="filter-row">
            <select
              className="pill-select"
              value={filters.difficulties[0] || ""}
              onChange={(e) => {
                const v = e.target.value;
                setFilters((f) => ({ ...f, difficulties: v ? [v as Difficulty] : [] }));
              }}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select
              className="pill-select"
              value={filters.topics[0] || ""}
              onChange={(e) => {
                const v = e.target.value;
                setFilters((f) => ({ ...f, topics: v ? [v] : [] }));
              }}
            >
              <option value="">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Display */}
        <div className="display">
          <div className="viewport">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div key="load" className="frame" {...variants} transition={{ duration: 0.3 }}>
                  <div className="label">LOADING</div>
                  <div className="title" style={{ fontSize: "2.5rem" }}>...</div>
                </motion.div>
              ) : problems.length === 0 ? (
                <motion.div key="empty" className="frame" {...variants} transition={{ duration: 0.3 }}>
                  <div className="label">NO MATCHES</div>
                  <div className="title" style={{ fontSize: "2.5rem" }}>Adjust filters</div>
                </motion.div>
              ) : !current ? (
                <motion.div key="ready" className="frame" {...variants} transition={{ duration: 0.4 }}>
                  <div className="label">READY</div>
                  <div className="title">Spin the wheel</div>
                </motion.div>
              ) : (
                <motion.div
                  key={key}
                  className="frame"
                  initial={variants.initial}
                  animate={variants.animate}
                  exit={variants.exit}
                  transition={transition}
                >
                  <div className="label">{diffLabel}</div>
                  <h2 className="title">{current.title}</h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom */}
        <div className="controls">
          <button className="btn-spin" onClick={spin} disabled={loading || problems.length === 0 || phase !== "idle"}>
            {current ? "Spin again" : "Spin"}
          </button>

          <AnimatePresence>
            {current && phase === "idle" && (
              <motion.a
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                href={current.leetcode_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-link"
              >
                Solve on LeetCode
              </motion.a>
            )}
          </AnimatePresence>

          <button className="btn-icon" onClick={() => setShowSettings(true)} aria-label="Settings">
            ⚙
          </button>
        </div>
      </div>

      {/* Settings drawer */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              className="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              className="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="drawer-handle" />
              <div className="drawer-title">Settings</div>

              <div className="drawer-row">
                <span className="drawer-label">Prioritize unseen problems</span>
                <button
                  className={`toggle ${filters.prioritizeUnseen ? "on" : ""}`}
                  onClick={() => setFilters((f) => ({ ...f, prioritizeUnseen: !f.prioritizeUnseen }))}
                >
                  <div className="toggle-knob" />
                </button>
              </div>

              <div className="drawer-row">
                <span className="drawer-label">Problems in pool</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                  {problems.length} / {allProblems.length}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
