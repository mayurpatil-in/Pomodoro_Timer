import { useState, useEffect } from "react";

const quotes = [
  "Focus on being productive instead of busy.",
  "Starve your distractions, feed your focus.",
  "Until we can manage time, we can manage nothing else.",
  "Do what is right, not what is easy.",
  "Success is the sum of small efforts repeated daily.",
  "Your future is created by what you do today.",
  "Action is the foundational key to all success.",
];

export default function Quote({ darkMode }) {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Pick a random quote on mount
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div
      className={`max-w-md mx-auto text-center px-4 transition-colors duration-500 ${
        darkMode ? "text-gray-400" : "text-gray-500"
      }`}
    >
      <p className="italic text-sm sm:text-base font-medium font-outfit">
        &quot;{quote}&quot;
      </p>
    </div>
  );
}
