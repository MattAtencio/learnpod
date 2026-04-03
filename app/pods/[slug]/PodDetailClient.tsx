"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Pod, Lesson, Module, Question } from "@/lib/types";
import { DOMAIN_CONFIG } from "@/lib/types";
import { useLearnStore, useStoreHydrated } from "@/lib/store";
import { Markdown } from "@/components/Markdown";
import { PodQuiz } from "@/components/PodQuiz";
import { useNavDirection } from "@/lib/nav-direction";

// XP split: reading earns BASE_XP, quiz earns up to QUIZ_XP (scaled by score)
const BASE_XP = 15;
const QUIZ_XP = 30;

interface Props {
  pod: Pod;
  lesson?: Lesson;
  parentModule?: Module;
  nextPodSlugs: string[];
  questions: Question[];
}

const SECTION_LABELS: Record<string, string> = {
  "key mechanics": "How It Works",
  "when to use it": "When to Use",
  "when not to use it": "When Not to Use",
  "cost impact": "Cost Breakdown",
  "code entry point": "Try It",
  "python entry point": "Try It",
  "how to use": "Try It",
};

function cleanHeading(heading: string): string {
  const lower = heading.toLowerCase();
  return SECTION_LABELS[lower] || heading;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  dx: number;
  dy: number;
  dr: number;
  opacity: number;
}

function CelebrationOverlay({
  xp,
  streak,
  onContinue,
  onNextPod,
  hasNextPod,
  firstAttemptBonus,
}: {
  xp: number;
  streak: number;
  onContinue: () => void;
  onNextPod: () => void;
  hasNextPod: boolean;
  firstAttemptBonus?: number;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);
  const [xpCount, setXpCount] = useState(0);

  useEffect(() => {
    const colors = [
      "#f5a623", "#ff6b5b", "#3ecfb2", "#5dd68c", "#6ea8fe", "#b08ef5",
    ];
    const initial: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 360,
      dx: (Math.random() - 0.5) * 8,
      dy: -(2 + Math.random() * 6),
      dr: (Math.random() - 0.5) * 10,
      opacity: 1,
    }));
    setParticles(initial);
    requestAnimationFrame(() => setShow(true));
  }, []);

  useEffect(() => {
    if (!show) return;
    const duration = 600;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setXpCount(Math.round(t * xp));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show, xp]);

  useEffect(() => {
    if (particles.length === 0) return;
    let raf: number;
    let running = true;
    function animate() {
      if (!running) return;
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.dx * 0.3,
            y: p.y + p.dy * 0.3,
            dy: p.dy + 0.15,
            rotation: p.rotation + p.dr,
            opacity: Math.max(0, p.opacity - 0.008),
          }))
          .filter((p) => p.opacity > 0)
      );
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(raf); };
  }, [particles.length > 0]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: show ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0)",
        backdropFilter: show ? "blur(8px)" : "none",
        transition: "all 0.4s ease",
        padding: 20,
      }}
      role="dialog"
      aria-label="Pod completed"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: p.size > 8 ? 2 : "50%",
            background: p.color,
            transform: `rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          background: "var(--surface)",
          borderRadius: 28,
          border: "1px solid rgba(245,166,35,0.3)",
          padding: "36px 28px 28px",
          maxWidth: 340,
          width: "100%",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(245,166,35,0.1)",
          transform: show ? "scale(1) translateY(0)" : "scale(0.8) translateY(20px)",
          opacity: show ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          textAlign: "center" as const,
        }}
      >
        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 16 }}>
          🎉
        </div>

        <div style={{
          fontFamily: "var(--font-fraunces), Fraunces, serif",
          fontSize: 24, fontWeight: 600, color: "var(--text)", marginBottom: 6,
        }}>
          Pod Complete!
        </div>

        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24, lineHeight: 1.5 }}>
          Great work — keep the momentum going.
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
          <div style={{
            background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.2)",
            borderRadius: 16, padding: "12px 20px", textAlign: "center" as const,
          }}>
            <div style={{
              fontFamily: "var(--font-fraunces), Fraunces, serif",
              fontSize: 26, fontWeight: 600, color: "var(--amber)", lineHeight: 1,
            }}>
              +{xpCount}
            </div>
            <div style={{
              fontSize: 10, fontWeight: 600, color: "var(--amber)",
              textTransform: "uppercase" as const, letterSpacing: "0.08em", marginTop: 4,
            }}>
              XP Earned
            </div>
          </div>

          {streak > 0 && (
            <div style={{
              background: "rgba(255,107,91,0.12)", border: "1px solid rgba(255,107,91,0.2)",
              borderRadius: 16, padding: "12px 20px", textAlign: "center" as const,
            }}>
              <div style={{
                fontFamily: "var(--font-fraunces), Fraunces, serif",
                fontSize: 26, fontWeight: 600, color: "var(--coral)", lineHeight: 1,
              }}>
                {streak}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 600, color: "var(--coral)",
                textTransform: "uppercase" as const, letterSpacing: "0.08em", marginTop: 4,
              }}>
                Day Streak
              </div>
            </div>
          )}

          {firstAttemptBonus && firstAttemptBonus > 0 && (
            <div style={{
              background: "rgba(176,142,245,0.12)", border: "1px solid rgba(176,142,245,0.2)",
              borderRadius: 16, padding: "12px 20px", textAlign: "center" as const,
            }}>
              <div style={{
                fontFamily: "var(--font-fraunces), Fraunces, serif",
                fontSize: 26, fontWeight: 600, color: "var(--purple)", lineHeight: 1,
              }}>
                +{firstAttemptBonus}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 600, color: "var(--purple)",
                textTransform: "uppercase" as const, letterSpacing: "0.08em", marginTop: 4,
              }}>
                First Try
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {hasNextPod && (
            <button
              onClick={onNextPod}
              style={{
                width: "100%", padding: "14px", borderRadius: 16,
                background: "linear-gradient(135deg, var(--amber), #e8950f)",
                border: "none", color: "#13100d", fontFamily: "Outfit, sans-serif",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 6px 20px rgba(245,166,35,0.35)", letterSpacing: "0.02em",
              }}
            >
              Next Pod →
            </button>
          )}
          <button
            onClick={onContinue}
            style={{
              width: "100%", padding: "12px", borderRadius: 14,
              background: "var(--surface2)", border: "1px solid var(--border)",
              color: "var(--muted)", fontFamily: "Outfit, sans-serif",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Review This Pod
          </button>
        </div>
      </div>
    </div>
  );
}

export function PodDetailClient({ pod, lesson, parentModule, nextPodSlugs, questions }: Props) {
  const hydrated = useStoreHydrated();
  const completeItem = useLearnStore((s) => s.completeItem);
  const completeQuiz = useLearnStore((s) => s.completeQuiz);
  const scheduleReview = useLearnStore((s) => s.scheduleReview);
  const getQuizResult = useLearnStore((s) => s.getQuizResult);
  const getQuizAttempts = useLearnStore((s) => s.getQuizAttempts);
  const isCompleted = useLearnStore((s) => s.isCompleted);
  const completedItems = useLearnStore((s) => s.completedItems);
  const streak = useLearnStore((s) => s.streak);
  const completed = hydrated && isCompleted(pod.slug);
  const quizResult = hydrated ? getQuizResult(pod.slug) : undefined;
  const hasQuiz = questions.length > 0;
  const domain = DOMAIN_CONFIG[pod.domain] || DOMAIN_CONFIG["Tools & Platforms"];
  const router = useRouter();
  const { setBack, setForward } = useNavDirection();

  const [showCelebration, setShowCelebration] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [firstAttemptBonus, setFirstAttemptBonus] = useState(0);

  const whatSection = pod.sections.find((s) =>
    s.heading.toLowerCase().includes("what it is")
  );
  const subtitle = whatSection?.content.split("\n")[0] || "";

  const conceptSections = pod.sections.filter(
    (s) =>
      !s.heading.toLowerCase().includes("what it is") &&
      !s.heading.toLowerCase().includes("related") &&
      !s.heading.toLowerCase().includes("research next") &&
      !s.heading.toLowerCase().includes("apply it")
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [isStudying, setIsStudying] = useState(!completed);
  const totalSteps = conceptSections.length;
  const isLastStep = currentStep >= totalSteps - 1;
  const currentSection = conceptSections[currentStep];

  const nextPodSlug = hydrated
    ? nextPodSlugs.find((slug) => !completedItems.includes(slug))
    : nextPodSlugs[0];

  const handleNext = useCallback(() => {
    if (isLastStep) {
      if (!completed) {
        // Award base XP for reading
        const readXp = hasQuiz ? BASE_XP : pod.xpReward;
        completeItem(pod.slug, readXp);
        setJustCompleted(true);
        if (hasQuiz) {
          setShowQuiz(true);
          setIsStudying(false);
        } else {
          setTotalXpEarned(readXp);
          setShowCelebration(true);
        }
      } else {
        setIsStudying(false);
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLastStep, completed, completeItem, pod.slug, pod.xpReward, hasQuiz]);

  function handleRedo() {
    setCurrentStep(0);
    setIsStudying(true);
  }

  function handleQuizComplete(score: number, total: number) {
    const pct = score / total;
    // Accuracy multiplier: <50% = 0.5x, 50-80% = 1x, 80%+ = 1.5x
    const multiplier = pct < 0.5 ? 0.5 : pct >= 0.8 ? 1.5 : 1;
    const bonusXp = Math.round(QUIZ_XP * multiplier);

    // First-attempt bonus: +10 XP if first try and 80%+ accuracy
    const attempts = getQuizAttempts(pod.slug);
    const isFirstAttempt = attempts === 0;
    const firstBonus = isFirstAttempt && pct >= 0.8 ? 10 : 0;

    completeQuiz(pod.slug, score, total, bonusXp + firstBonus, pod.domain);

    // Schedule spaced repetition review based on quiz performance
    const quality = Math.round(pct * 5);
    scheduleReview(pod.slug, quality);

    setFirstAttemptBonus(firstBonus);
    setTotalXpEarned(BASE_XP + bonusXp + firstBonus);
    setShowQuiz(false);
    setShowCelebration(true);
  }

  function handleCelebrationContinue() {
    setShowCelebration(false);
    setIsStudying(false);
  }

  function handleNextPod() {
    if (nextPodSlug) {
      setForward();
      router.push(`/pods/${nextPodSlug}`);
    }
  }

  return (
    <div className="pod-detail">
      {showCelebration && (
        <CelebrationOverlay
          xp={totalXpEarned || pod.xpReward}
          streak={streak.count}
          onContinue={handleCelebrationContinue}
          onNextPod={handleNextPod}
          hasNextPod={!!nextPodSlug}
          firstAttemptBonus={firstAttemptBonus}
        />
      )}

      <div className="nav-back fade-1">
        <Link href="/" className="back-btn" aria-label="Back to home" onClick={setBack}>←</Link>
        <div className="nav-back-title">Today&apos;s Queue</div>
        <div className="nav-badge">Pod</div>
      </div>

      <div className="pod-hero fade-2">
        <div className="pod-hero-tag">
          <span className={`pod-tag tag-${domain.tag}`}>{domain.emoji} {pod.domain}</span>
        </div>
        <div className="pod-hero-title">{pod.title}</div>
        <div className="pod-hero-subtitle">{subtitle}</div>
        <div className="pod-stats">
          <div className="pod-stat">
            <div className="pod-stat-val">{pod.estimatedMinutes}</div>
            <div className="pod-stat-label">Minutes</div>
          </div>
          <div className="pod-stat">
            <div className="pod-stat-val">{totalSteps}</div>
            <div className="pod-stat-label">Concepts</div>
          </div>
          <div className="pod-stat">
            <div className="pod-stat-val">+{hasQuiz ? `${BASE_XP}+${QUIZ_XP}` : pod.xpReward}</div>
            <div className="pod-stat-label">{hasQuiz ? "Read+Quiz" : "XP"}</div>
          </div>
        </div>
      </div>

      {isStudying && totalSteps > 1 && (
        <div
          role="tablist"
          aria-label="Concept steps"
          style={{ display: "flex", gap: 6, margin: "16px 20px 0", justifyContent: "center" }}
        >
          {conceptSections.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === currentStep}
              aria-label={`Step ${i + 1} of ${totalSteps}`}
              onClick={() => i <= currentStep && setCurrentStep(i)}
              style={{
                width: i === currentStep ? 28 : 10,
                height: 10,
                borderRadius: 5,
                border: "none",
                cursor: i <= currentStep ? "pointer" : "default",
                background: i === currentStep
                  ? "var(--amber)"
                  : i < currentStep
                    ? "rgba(245,166,35,0.4)"
                    : "var(--surface3)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      {isStudying && currentSection && (
        <div key={currentStep} className="fade-3 section-step-enter" style={{ margin: "16px 20px 0" }}>
          <div style={{
            background: "var(--surface)",
            borderRadius: 20,
            border: "1px solid rgba(245,166,35,0.2)",
            padding: "20px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div className="concept-num">{currentStep + 1}</div>
              <div style={{
                fontFamily: "var(--font-fraunces), Fraunces, serif",
                fontSize: 17, fontWeight: 600, color: "var(--text)",
              }}>
                {cleanHeading(currentSection.heading)}
              </div>
            </div>
            <Markdown content={currentSection.content} />
          </div>
        </div>
      )}

      {/* Quiz phase */}
      {showQuiz && (
        <PodQuiz
          questions={questions}
          podTitle={pod.title}
          bonusXp={QUIZ_XP}
          onComplete={handleQuizComplete}
        />
      )}

      {!isStudying && !showQuiz && (
        <div className="concepts fade-3" style={{ marginTop: 16 }}>
          {justCompleted && nextPodSlug && (
            <div
              style={{
                margin: "0 0 12px", padding: "14px 18px",
                background: "rgba(245,166,35,0.08)",
                border: "1px solid rgba(245,166,35,0.2)",
                borderRadius: 16, display: "flex", alignItems: "center",
                gap: 12, cursor: "pointer",
              }}
              onClick={handleNextPod}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, var(--amber), #e8950f)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: "#13100d", fontWeight: 700, flexShrink: 0,
                boxShadow: "0 4px 12px rgba(245,166,35,0.3)",
              }}>
                ▶
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--amber)" }}>
                  Next Up
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                  Continue your learning streak
                </div>
              </div>
              <div style={{ color: "var(--amber)", fontSize: 16 }}>→</div>
            </div>
          )}
          {quizResult && (
            <div style={{
              margin: "0 0 12px", padding: "12px 16px",
              background: "rgba(93,214,140,0.08)", border: "1px solid rgba(93,214,140,0.2)",
              borderRadius: 14, display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: "var(--green)",
                textTransform: "uppercase" as const, letterSpacing: "0.06em",
              }}>
                Quiz: {quizResult.score}/{quizResult.total} · +{quizResult.xpEarned} XP
              </div>
            </div>
          )}
          {conceptSections.map((section, i) => (
            <div
              key={i}
              className="concept-item"
              style={{ cursor: "pointer" }}
              onClick={() => { setCurrentStep(i); setIsStudying(true); }}
            >
              <div className="concept-num">{i + 1}</div>
              <div>
                <div className="concept-text">{cleanHeading(section.heading)}</div>
                <div className="concept-sub">Tap to review</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pod-actions fade-5" style={showQuiz ? { display: "none" } : undefined}>
        {isStudying ? (
          <button
            className="btn-primary"
            onClick={handleNext}
            aria-label={isLastStep ? (completed ? "Finish Review" : hasQuiz ? "Start Quiz" : `Mark Complete and earn ${pod.xpReward} XP`) : "Next Concept"}
          >
            {isLastStep
              ? completed ? "Finish Review" : hasQuiz ? `Start Quiz · +${BASE_XP} XP` : `Mark Complete · +${pod.xpReward} XP`
              : "Next Concept →"}
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={handleRedo}
            style={{
              background: "rgba(93,214,140,0.15)",
              color: "var(--green)",
              boxShadow: "none",
              border: "1px solid rgba(93,214,140,0.2)",
            }}
          >
            Review Again ↻
          </button>
        )}
        <button className="btn-secondary" aria-label="Bookmark this pod">🔖</button>
      </div>

      {(lesson || parentModule) && (
        <div className="related fade-6">
          <div className="section-header" style={{ padding: "16px 0 10px" }}>
            <div className="section-title" style={{ fontSize: 16 }}>Go Deeper</div>
          </div>
          {lesson && (
            <div className="related-item">
              <div className="related-icon" style={{ background: "rgba(110,168,254,0.12)" }}>📖</div>
              <div className="related-info">
                <div className="related-title">Lesson — {lesson.title}</div>
                <div className="related-meta">{lesson.estimatedMinutes} min</div>
              </div>
              <div className="related-arrow">›</div>
            </div>
          )}
          {parentModule && (
            <Link href={`/modules/${parentModule.slug}`} className="related-item">
              <div className="related-icon" style={{ background: "rgba(176,142,245,0.12)" }}>🗂</div>
              <div className="related-info">
                <div className="related-title">Module — {parentModule.title}</div>
                <div className="related-meta">{parentModule.chapters.length} chapters</div>
              </div>
              <div className="related-arrow">›</div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
