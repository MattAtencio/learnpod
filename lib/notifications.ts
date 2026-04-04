"use client";

const NOTIFICATION_KEY = "learnpod-notifications";

interface NotificationPrefs {
  enabled: boolean;
  streakReminder: boolean;
  reminderHour: number; // 24h format, default 19 (7pm)
}

function getPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return { enabled: false, streakReminder: true, reminderHour: 19 };
  try {
    const stored = localStorage.getItem(NOTIFICATION_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { enabled: false, streakReminder: true, reminderHour: 19 };
}

function savePrefs(prefs: NotificationPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(prefs));
}

export function getNotificationPrefs(): NotificationPrefs {
  return getPrefs();
}

export function setNotificationPrefs(prefs: Partial<NotificationPrefs>) {
  const current = getPrefs();
  savePrefs({ ...current, ...prefs });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") {
    savePrefs({ ...getPrefs(), enabled: true });
    return true;
  }
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  const granted = result === "granted";
  savePrefs({ ...getPrefs(), enabled: granted });
  return granted;
}

export function canRequestNotifications(): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  return Notification.permission !== "denied";
}

export function isNotificationsEnabled(): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  return Notification.permission === "granted" && getPrefs().enabled;
}

export function sendLocalNotification(title: string, body: string) {
  if (!isNotificationsEnabled()) return;
  try {
    new Notification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
    });
  } catch { /* service worker context may differ */ }
}

/** Schedule a streak reminder check — call this on app load */
export function checkStreakReminder(streakCount: number, lastDate: string) {
  if (!isNotificationsEnabled()) return;
  const prefs = getPrefs();
  if (!prefs.streakReminder || streakCount <= 0) return;

  const today = new Date().toISOString().slice(0, 10);
  if (lastDate === today) return; // Already completed today

  const now = new Date();
  if (now.getHours() >= prefs.reminderHour) {
    sendLocalNotification(
      "Streak at risk! 🔥",
      `Your ${streakCount}-day streak is about to break. Complete a pod to keep it alive.`
    );
  }
}
