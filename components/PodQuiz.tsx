"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";

interface Props {
  questions: Question[];
  podTitle: string;
  bonusXp: number;
  onComplete: (score: number, total: number) => void;
}

export function PodQuiz({ questions, podTitle, bonusXp, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [animClass, setAnimClass] = useState("");

  const q = questions[current];
  const isLast = current >= questions.length - 1;
  const isCorrect = selected === q.correctIndex;

  function handleSelect(idx: number) {
    if (confirmed) return;
    setSelected(idx);
  }

  function handleConfirm() {
    if (selected === null) return;
    setConfirmed(true);
    setAnimClass(selected === q.correctIndex ? "quiz-bounce" : "quiz-shake");
    if (isCorrect) setScore((s) => s + 1);
  }

  function handleNext() {
    if (isLast) {
      const finalScore = score + (isCorrect ? 0 : 0); // score already updated
      onComplete(score + (selected === q.correctIndex ? 1 : 0), questions.length);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
      setAnimClass("");
    }
  }

  const xpPerQuestion = Math.round(bonusXp / questions.length);

  return (
    <div style={{ margin: "16px 20px 0" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 14,
      }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: "var(--amber)",
          textTransform: "uppercase" as const, letterSpacing: "0.08em",
        }}>
          Quiz · {current + 1}/{questions.length}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: "var(--green)",
          background: "rgba(93,214,140,0.12)",
          padding: "3px 10px", borderRadius: 8,
        }}>
          {score}/{current + (confirmed ? 1 : 0)} correct
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 4, background: "var(--surface2)", borderRadius: 4,
        marginBottom: 18, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 4,
          background: "linear-gradient(90deg, var(--amber), var(--coral))",
          width: `${((current + (confirmed ? 1 : 0)) / questions.length) * 100}%`,
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* Question card */}
      <div style={{
        background: "var(--surface)", borderRadius: 20,
        border: "1px solid var(--border)", padding: "22px 20px",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}>
        <div style={{
          fontFamily: "var(--font-fraunces), Fraunces, serif",
          fontSize: 16, fontWeight: 600, color: "var(--text)",
          lineHeight: 1.4, marginBottom: 18,
        }}>
          {q.question}
        </div>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {q.choices.map((choice, idx) => {
            let bg = "var(--surface2)";
            let border = "1px solid transparent";
            let color = "var(--text)";

            if (confirmed) {
              if (idx === q.correctIndex) {
                bg = "rgba(93,214,140,0.15)";
                border = "1px solid rgba(93,214,140,0.4)";
                color = "var(--green)";
              } else if (idx === selected && !isCorrect) {
                bg = "rgba(255,107,91,0.15)";
                border = "1px solid rgba(255,107,91,0.4)";
                color = "var(--coral)";
              }
            } else if (idx === selected) {
              bg = "var(--amber-dim)";
              border = "1px solid rgba(245,166,35,0.4)";
              color = "var(--amber)";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={confirmed && idx === selected ? animClass : ""}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 14,
                  background: bg, border,
                  cursor: confirmed ? "default" : "pointer",
                  textAlign: "left" as const, width: "100%",
                  transition: "all 0.2s ease",
                  fontFamily: "Outfit, sans-serif",
                }}
                aria-label={`Option ${idx + 1}: ${choice}`}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  background: idx === selected ? (confirmed ? (isCorrect || idx === q.correctIndex ? "rgba(93,214,140,0.25)" : "rgba(255,107,91,0.25)") : "rgba(245,166,35,0.2)") : "var(--surface3)",
                  color: idx === selected ? color : "var(--muted)",
                }}>
                  {confirmed && idx === q.correctIndex ? "✓" :
                   confirmed && idx === selected && !isCorrect ? "✗" :
                   String.fromCharCode(65 + idx)}
                </div>
                <div style={{
                  fontSize: 13, color, lineHeight: 1.4, fontWeight: 500,
                }}>
                  {choice}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation after confirming */}
        {confirmed && (
          <div style={{
            marginTop: 14, padding: "12px 14px", borderRadius: 12,
            background: isCorrect ? "rgba(93,214,140,0.08)" : "rgba(255,107,91,0.08)",
            border: `1px solid ${isCorrect ? "rgba(93,214,140,0.2)" : "rgba(255,107,91,0.2)"}`,
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, marginBottom: 4,
              color: isCorrect ? "var(--green)" : "var(--coral)",
              textTransform: "uppercase" as const, letterSpacing: "0.06em",
            }}>
              {isCorrect ? `Correct! +${xpPerQuestion} XP` : "Not quite"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5, opacity: 0.85 }}>
              {q.explanation}
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      <div style={{ marginTop: 14 }}>
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={selected === null}
            style={{
              width: "100%", padding: "14px", borderRadius: 16,
              background: selected !== null
                ? "linear-gradient(135deg, var(--amber), #e8950f)"
                : "var(--surface2)",
              border: "none",
              color: selected !== null ? "#13100d" : "var(--muted)",
              fontFamily: "Outfit, sans-serif",
              fontSize: 14, fontWeight: 700, cursor: selected !== null ? "pointer" : "default",
              boxShadow: selected !== null ? "0 6px 20px rgba(245,166,35,0.35)" : "none",
              transition: "all 0.2s",
              letterSpacing: "0.02em",
            }}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              width: "100%", padding: "14px", borderRadius: 16,
              background: "linear-gradient(135deg, var(--amber), #e8950f)",
              border: "none", color: "#13100d",
              fontFamily: "Outfit, sans-serif",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 6px 20px rgba(245,166,35,0.35)",
              letterSpacing: "0.02em",
            }}
          >
            {isLast ? "See Results" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}
