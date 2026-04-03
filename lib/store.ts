"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useState, useEffect } from "react";

interface LearnState {
  completedItems: string[];
  xp: number;
  streak: { count: number; lastDate: string };
  _hydrated: boolean;

  completeItem: (slug: string, xpReward: number) => void;
  isCompleted: (slug: string) => boolean;
  getModuleProgress: (chapterSlugs: string[]) => { done: number; total: number; pct: number };
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

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      completedItems: [],
      xp: 0,
      streak: { count: 0, lastDate: "" },
      _hydrated: false,

      completeItem: (slug, xpReward) => {
        const state = get();
        if (state.completedItems.includes(slug)) return;

        const today = todayStr();
        let newStreak = state.streak;

        if (!isSameDay(state.streak.lastDate, today)) {
          if (isYesterday(state.streak.lastDate, today)) {
            newStreak = { count: state.streak.count + 1, lastDate: today };
          } else {
            newStreak = { count: 1, lastDate: today };
          }
        }

        set({
          completedItems: [...state.completedItems, slug],
          xp: state.xp + xpReward,
          streak: newStreak,
        });
      },

      isCompleted: (slug) => get().completedItems.includes(slug),

      getModuleProgress: (chapterSlugs) => {
        const completed = get().completedItems;
        const done = chapterSlugs.filter((s) => completed.includes(s)).length;
        const total = chapterSlugs.length;
        return { done, total, pct: total > 0 ? done / total : 0 };
      },
    }),
    { name: "learnpod-store" }
  )
);
