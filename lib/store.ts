"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useState, useEffect } from "react";
import type { Domain } from "./types";

const STREAK_MILESTONES = [7, 30, 100, 365] as const;

interface QuizResult {
  score: number;
  total: number;
  xpEarned: number;
}

interface ReviewData {
  nextReviewDate: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
}

type DailyXpGoal = 45 | 90 | 135;

interface XpLog {
  date: string;
  earned: number;
}

/**
 * Home screen state — drives state-aware hero copy and conditional rendering.
 *
 *  brandNew     — onboarding not yet complete (unused in HomeClient; Onboarding renders)
 *  firstSession — onboarding done, zero pods completed
 *  lapsed       — 3+ days since last activity
 *  atRisk       — past noon today, no completion yet, streak count > 0
 *  goalHit      — today's XP >= daily goal
 *  midstreak    — streak.count between 2 and 6 (pre-Bronze)
 *  active       — default returning user
 */
export type HomeState =
  | "brandNew"
  | "firstSession"
  | "lapsed"
  | "atRisk"
  | "goalHit"
  | "midstreak"
  | "active";

interface LearnState {
  completedItems: string[];
  quizResults: Record<string, QuizResult>;
  quizAttempts: Record<string, number>;
  domainAccuracy: Record<string, { scores: number[]; totals: number[] }>;
  xp: number;
  dailyXpGoal: DailyXpGoal;
  xpLog: XpLog[];
  streak: { count: number; lastDate: string };
  streakFreezes: number;
  lastFreezeReplenish: string;
  streakRepairs: Record<string, boolean>;
  pendingStreakRepair: boolean;
  reviewSchedule: Record<string, ReviewData>;
  onboardingComplete: boolean;
  preferredDomains: Domain[];
  lastStartedPodSlug: string | null;
  _hydrated: boolean;

  completeItem: (slug: string, xpReward: number) => void;
  completeQuiz: (slug: string, score: number, total: number, bonusXp: number, domain?: string) => void;
  getQuizAttempts: (slug: string) => number;
  getQuizResult: (slug: string) => QuizResult | undefined;
  isCompleted: (slug: string) => boolean;
  getModuleProgress: (chapterSlugs: string[]) => { done: number; total: number; pct: number };
  isStreakAtRisk: () => boolean;
  getStreakMilestone: () => number | null;
  checkFreezeReplenish: () => void;
  setDailyXpGoal: (goal: DailyXpGoal) => void;
  getTodayXp: () => number;
  repairStreak: () => void;
  canRepairStreak: () => boolean;
  scheduleReview: (slug: string, quality: number) => void;
  getDueReviews: () => string[];
  getReviewStatus: (slug: string) => "due" | "overdue" | "mastered" | "learning" | null;
  completeOnboarding: (domains: Domain[]) => void;
  setLastStartedPod: (slug: string) => void;
  getHomeState: () => HomeState;
}

/** Hook that returns true only after the store has hydrated from localStorage */
export function useStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useLearnStore.persist.onFinishHydration(() => setHydrated(true));
    // If already hydrated (e.g. synchronous storage)
    if (useLearnStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}

function isSameDay(a: string, b: string) {
  return a !== "" && a === b;
}

function isYesterday(last: string, today: string) {
  if (!last) return false;
  const d1 = new Date(last + "T00:00:00");
  const d2 = new Date(today + "T00:00:00");
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
  d1.setDate(d1.getDate() + 1);
  return d1.toISOString().slice(0, 10) === d2.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      completedItems: [],
      quizResults: {},
      quizAttempts: {},
      domainAccuracy: {},
      xp: 0,
      dailyXpGoal: 45 as DailyXpGoal,
      xpLog: [],
      streak: { count: 0, lastDate: "" },
      streakFreezes: 1,
      lastFreezeReplenish: "",
      streakRepairs: {},
      pendingStreakRepair: false,
      reviewSchedule: {},
      onboardingComplete: false,
      preferredDomains: [],
      lastStartedPodSlug: null,
      _hydrated: false,

      completeItem: (slug, xpReward) => {
        const state = get();
        if (state.completedItems.includes(slug)) return;

        const today = todayStr();
        let newStreak = state.streak;
        let newFreezes = state.streakFreezes;
        let consumeRepair = false;

        if (!isSameDay(state.streak.lastDate, today)) {
          if (isYesterday(state.streak.lastDate, today)) {
            newStreak = { count: state.streak.count + 1, lastDate: today };
          } else if (state.pendingStreakRepair && state.streak.count > 0) {
            // Pending repair: this completion is the proof-of-work that restores the streak
            newStreak = { count: state.streak.count + 1, lastDate: today };
            consumeRepair = true;
          } else if (state.streakFreezes > 0 && state.streak.count > 0) {
            // Use a freeze to keep the streak alive
            newFreezes = state.streakFreezes - 1;
            newStreak = { count: state.streak.count + 1, lastDate: today };
          } else {
            newStreak = { count: 1, lastDate: today };
          }
        }

        // Log daily XP
        const todayLog = state.xpLog.find((l) => l.date === today);
        const updatedLog = todayLog
          ? state.xpLog.map((l) => l.date === today ? { ...l, earned: l.earned + xpReward } : l)
          : [...state.xpLog, { date: today, earned: xpReward }];

        set({
          completedItems: [...state.completedItems, slug],
          xp: state.xp + xpReward,
          xpLog: updatedLog,
          streak: newStreak,
          streakFreezes: newFreezes,
          // Clear resume pointer if it was this pod
          ...(state.lastStartedPodSlug === slug ? { lastStartedPodSlug: null } : {}),
          ...(consumeRepair
            ? {
                pendingStreakRepair: false,
                streakRepairs: { ...state.streakRepairs, [today]: true },
              }
            : {}),
        });
      },

      completeQuiz: (slug, score, total, bonusXp, domain) => {
        const state = get();
        const isFirstCompletion = !state.quizResults[slug];
        const newAttempts = (state.quizAttempts[slug] || 0) + 1;

        // Track domain accuracy
        let newDomainAccuracy = state.domainAccuracy;
        if (domain) {
          const prev = state.domainAccuracy[domain] || { scores: [], totals: [] };
          newDomainAccuracy = {
            ...state.domainAccuracy,
            [domain]: { scores: [...prev.scores, score], totals: [...prev.totals, total] },
          };
        }

        const xpToAdd = isFirstCompletion ? bonusXp : 0;
        // Log daily XP
        const today = todayStr();
        const todayLog = state.xpLog.find((l) => l.date === today);
        const updatedLog = xpToAdd > 0
          ? (todayLog
            ? state.xpLog.map((l) => l.date === today ? { ...l, earned: l.earned + xpToAdd } : l)
            : [...state.xpLog, { date: today, earned: xpToAdd }])
          : state.xpLog;

        set({
          quizResults: { ...state.quizResults, [slug]: { score, total, xpEarned: bonusXp } },
          quizAttempts: { ...state.quizAttempts, [slug]: newAttempts },
          domainAccuracy: newDomainAccuracy,
          xpLog: updatedLog,
          xp: state.xp + xpToAdd,
        });
      },

      getQuizAttempts: (slug) => get().quizAttempts[slug] || 0,

      getQuizResult: (slug) => get().quizResults[slug],

      isCompleted: (slug) => get().completedItems.includes(slug),

      getModuleProgress: (chapterSlugs) => {
        const completed = get().completedItems;
        const done = chapterSlugs.filter((s) => completed.includes(s)).length;
        const total = chapterSlugs.length;
        return { done, total, pct: total > 0 ? done / total : 0 };
      },

      isStreakAtRisk: () => {
        const state = get();
        if (state.streak.count <= 0) return false;
        const today = todayStr();
        if (isSameDay(state.streak.lastDate, today)) return false;
        const now = new Date();
        return now.getHours() >= 12;
      },

      getStreakMilestone: () => {
        const count = get().streak.count;
        return STREAK_MILESTONES.includes(count as typeof STREAK_MILESTONES[number])
          ? count
          : null;
      },

      checkFreezeReplenish: () => {
        const state = get();
        const now = new Date();
        if (now.getDay() !== 1) return; // Not Monday
        const thisMonday = getMonday(now);
        if (state.lastFreezeReplenish === thisMonday) return; // Already replenished this week
        set({ streakFreezes: 1, lastFreezeReplenish: thisMonday });
      },

      setDailyXpGoal: (goal) => set({ dailyXpGoal: goal }),

      getTodayXp: () => {
        const state = get();
        const today = todayStr();
        const entry = state.xpLog.find((l) => l.date === today);
        return entry?.earned || 0;
      },

      repairStreak: () => {
        const state = get();
        const today = todayStr();
        if (state.streakRepairs[today]) return;
        if (state.pendingStreakRepair) return;
        if (!state.streak.lastDate || isSameDay(state.streak.lastDate, today)) return;
        // Only allow repair if streak broke (not yesterday, not same day)
        if (isYesterday(state.streak.lastDate, today)) return;
        if (state.streak.count <= 0) return;
        // Arm the repair: streak is NOT restored until the next completeItem call
        // provides proof-of-work. Prevents free-repair exploit where users could
        // resurrect a broken streak without doing any actual learning.
        set({ pendingStreakRepair: true });
      },

      canRepairStreak: () => {
        const state = get();
        const today = todayStr();
        if (state.streakRepairs[today]) return false;
        if (state.pendingStreakRepair) return false;
        if (state.streak.count <= 0) return false;
        if (isSameDay(state.streak.lastDate, today)) return false;
        if (isYesterday(state.streak.lastDate, today)) return false;
        return true;
      },

      scheduleReview: (slug, quality) => {
        const state = get();
        const prev = state.reviewSchedule[slug] || {
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReviewDate: todayStr(),
        };

        let { easeFactor, interval, repetitions } = prev;

        if (quality >= 3) {
          repetitions += 1;
          if (repetitions === 1) {
            interval = 1;
          } else if (repetitions === 2) {
            interval = 6;
          } else {
            interval = Math.round(interval * easeFactor);
          }
        } else {
          repetitions = 0;
          interval = 1;
        }

        // Update ease factor: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
        const diff = 5 - quality;
        easeFactor = easeFactor + (0.1 - diff * (0.08 + diff * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;

        // Calculate next review date
        const next = new Date();
        next.setDate(next.getDate() + interval);
        const nextReviewDate = next.toISOString().slice(0, 10);

        set({
          reviewSchedule: {
            ...state.reviewSchedule,
            [slug]: { nextReviewDate, easeFactor, interval, repetitions },
          },
        });
      },

      getDueReviews: () => {
        const state = get();
        const today = todayStr();
        return Object.entries(state.reviewSchedule)
          .filter(([, data]) => data.nextReviewDate <= today)
          .map(([slug]) => slug);
      },

      getReviewStatus: (slug) => {
        const state = get();
        const data = state.reviewSchedule[slug];
        if (!data) return null;
        const today = todayStr();
        if (data.nextReviewDate < today) return "overdue";
        if (data.nextReviewDate === today) return "due";
        if (data.repetitions >= 5 && data.easeFactor >= 2.5) return "mastered";
        return "learning";
      },
      completeOnboarding: (domains) => {
        set({ onboardingComplete: true, preferredDomains: domains });
      },

      setLastStartedPod: (slug) => {
        const state = get();
        // Only track pods that aren't already completed; clear when completed
        if (state.completedItems.includes(slug)) {
          if (state.lastStartedPodSlug === slug) set({ lastStartedPodSlug: null });
          return;
        }
        if (state.lastStartedPodSlug !== slug) set({ lastStartedPodSlug: slug });
      },

      getHomeState: () => {
        const state = get();
        if (!state.onboardingComplete) return "brandNew";
        if (state.completedItems.length === 0) return "firstSession";

        // Lapsed: 3+ days since last activity
        const last = state.streak.lastDate;
        if (last) {
          const lastDate = new Date(last + "T00:00:00");
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 3) return "lapsed";
        }

        // At-risk: past noon, no completion today yet, has a streak
        const today = todayStr();
        if (state.streak.count > 0 && !isSameDay(state.streak.lastDate, today)) {
          if (new Date().getHours() >= 12) return "atRisk";
        }

        // Goal hit: today's XP >= daily goal
        const todayLog = state.xpLog.find((l) => l.date === today);
        const todayXp = todayLog?.earned || 0;
        if (todayXp >= state.dailyXpGoal) return "goalHit";

        // Mid-streak: 2-6 days (pre-Bronze)
        if (state.streak.count >= 2 && state.streak.count <= 6) return "midstreak";

        return "active";
      },
    }),
    {
      name: "learnpod-store",
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<LearnState>) };
        // Auto-complete onboarding for existing users who already have progress
        if (merged.completedItems.length > 0 && !merged.onboardingComplete) {
          merged.onboardingComplete = true;
        }
        return merged;
      },
    }
  )
);
