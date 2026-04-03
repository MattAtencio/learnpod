"use client";

import { useState } from "react";
import Link from "next/link";
import type { Pod, Lesson, Module } from "@/lib/types";
import { DOMAIN_CONFIG } from "@/lib/types";
import { useLearnStore, useStoreHydrated } from "@/lib/store";
import { Markdown } from "@/components/Markdown";

interface Props {
  pod: Pod;
  lesson?: Lesson;
  parentModule?: Module;
}

// Map vault section headings to cleaner learning-focused labels
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

export function PodDetailClient({ pod, lesson, parentModule }: Props) {
  const hydrated = useStoreHydrated();
  const completeItem = useLearnStore((s) => s.completeItem);
  const isCompleted = useLearnStore((s) => s.isCompleted);
  const completed = hydrated && isCompleted(pod.slug);
  const domain = DOMAIN_CONFIG[pod.domain] || DOMAIN_CONFIG["Tools & Platforms"];

  // "What It Is" becomes the hero subtitle
  const whatSection = pod.sections.find((s) =>
    s.heading.toLowerCase().includes("what it is")
  );
  const subtitle = whatSection?.content.split("\n")[0] || "";

  // Teaching sections — the actual step-through content
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

  function handleNext() {
    if (isLastStep) {
      if (!completed) completeItem(pod.slug, pod.xpReward);
      setIsStudying(false);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleRedo() {
    setCurrentStep(0);
    setIsStudying(true);
  }

  return (
    <div className="pod-detail">
      <div className="nav-back fade-1">
        <Link href="/" className="back-btn">←</Link>
        <div className="nav-back-title">Today&apos;s Queue</div>
        <div className="nav-badge">Pod</div>
      </div>

      {/* Hero */}
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
            <div className="pod-stat-val">+{pod.xpReward}</div>
            <div className="pod-stat-label">XP</div>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      {isStudying && totalSteps > 1 && (
        <div style={{
          display: "flex", gap: 6, margin: "16px 20px 0",
          justifyContent: "center",
        }}>
          {conceptSections.map((_, i) => (
            <button
              key={i}
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

      {/* Current concept — full rendered content */}
      {isStudying && currentSection && (
        <div className="fade-3" style={{ margin: "16px 20px 0" }}>
          <div style={{
            background: "var(--surface)",
            borderRadius: 20,
            border: "1px solid rgba(245,166,35,0.2)",
            padding: "20px",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}>
            {/* Section heading */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}>
              <div className="concept-num">{currentStep + 1}</div>
              <div style={{
                fontFamily: "var(--font-fraunces), Fraunces, serif",
                fontSize: 17,
                fontWeight: 600,
                color: "var(--text)",
              }}>
                {cleanHeading(currentSection.heading)}
              </div>
            </div>

            {/* Rendered content */}
            <Markdown content={currentSection.content} />
          </div>
        </div>
      )}

      {/* Completed state — show all sections collapsed */}
      {!isStudying && (
        <div className="concepts fade-3" style={{ marginTop: 16 }}>
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

      {/* Action buttons */}
      <div className="pod-actions fade-5">
        {isStudying ? (
          <button className="btn-primary" onClick={handleNext}>
            {isLastStep
              ? completed ? "Finish Review" : `Mark Complete · +${pod.xpReward} XP`
              : "Next Concept →"}
          </button>
        ) : (
          <button
            className="btn-primary"
            style={{
              background: "rgba(93,214,140,0.15)",
              color: "var(--green)",
              boxShadow: "none",
              border: "1px solid rgba(93,214,140,0.2)",
            }}
            disabled
          >
            Completed ✓
          </button>
        )}
        <button className="btn-secondary">🔖</button>
      </div>

      {/* Go Deeper */}
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
