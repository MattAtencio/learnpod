"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useState, useEffect } from "react";

const STREAK_MILESTONES = [7, 30, 100, 365] as const;

interface QuizResult {
  score: number;
  total: number;
  xpEarned: number;
}

interface LearnState {
  completedItems: string[];
  quizResults: Record<string, QuizResult>;
  xp: number;
  streak: { count: number; lastDate: string };
  streakFreezes: number;
  lastFreezeReplenish: string;
  _hydrated: boolean;

  completeItem: (slug: string, xpReward: number) => void;
  completeQuiz: (slug: string, score: number, total: number, bonusXp: number) => void;
  getQuizResult: (slug: string) => QuizResult | undefined;
  isCompleted: (slug: string) => boolean;
  getModuleProgress: (chapterSlugs: string[]) => { done: number; total: number; pct: number };
  isStreakAtRisk: () => boolean;
  getStreakMilestone: () => number | null;
  checkFreezeReplenish: () => void;
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
      xp: 0,
      streak: { count: 0, lastDate: "" },
      streakFreezes: 1,
      lastFreezeReplenish: "",
      _hydrated: false,

      completeItem: (slug, xpReward) => {
        const state = get();
        if (state.completedItems.includes(slug)) return;

        const today = todayStr();
        let newStreak = state.streak;
        let newFreezes = state.streakFreezes;

        if (!isSameDay(state.streak.lastDate, today)) {
          if (isYesterday(state.streak.lastDate, today)) {
            newStreak = { count: state.streak.count + 1, lastDate: today };
          } else if (state.streakFreezes > 0 && state.streak.count > 0) {
            // Use a freeze to keep the streak alive
            newFreezes = state.streakFreezes - 1;
            newStreak = { count: state.streak.count + 1, lastDate: today };
          } else {
            newStreak = { count: 1, lastDate: today };
          }
        }

        set({
          completedItems: [...state.completedItems, slug],
          xp: state.xp + xpReward,
          streak: newStreak,
          streakFreezes: newFreezes,
        });
      },

      completeQuiz: (slug, score, total, bonusXp) => {
        const state = get();
        if (state.quizResults[slug]) return;
        set({
          quizResults: { ...state.quizResults, [slug]: { score, total, xpEarned: bonusXp } },
          xp: state.xp + bonusXp,
        });
      },

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
    }),
    { name: "learnpod-store" }
  )
);
