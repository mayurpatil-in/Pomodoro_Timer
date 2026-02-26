import { useState, useEffect } from "react";

const quotes = [
  {
    text: "Deep work is the superpower of the 21st century.",
    author: "Cal Newport",
  },
  {
    text: "You don't need more time—you need more focus.",
    author: "Anonymous",
  },
  { text: "Starve your distractions, feed your focus.", author: "Anonymous" },
  {
    text: "Small disciplines repeated with consistency lead to great achievements.",
    author: "John Maxwell",
  },
  {
    text: "The secret to getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Excellence is not a destination; it's a continuous journey.",
    author: "Brian Tracy",
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
  },
];

export default function Quote({ darkMode }) {
  const [q, setQ] = useState(null);

  useEffect(() => {
    setQ(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  if (!q) return null;

  return (
    <div className="flex flex-col items-center gap-1 px-6 text-center max-w-md mx-auto">
      <p
        className={`text-sm font-outfit italic leading-relaxed ${darkMode ? "text-slate-500" : "text-slate-400"}`}
      >
        &ldquo;{q.text}&rdquo;
      </p>
      <span
        className={`text-[11px] font-semibold tracking-wider uppercase ${darkMode ? "text-slate-600" : "text-slate-400"}`}
      >
        — {q.author}
      </span>
    </div>
  );
}
