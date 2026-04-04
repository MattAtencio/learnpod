"use client";

import { useState, useEffect } from "react";
import {
  getNotificationPrefs,
  setNotificationPrefs,
  requestNotificationPermission,
  canRequestNotifications,
  isNotificationsEnabled,
} from "@/lib/notifications";

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [canRequest, setCanRequest] = useState(false);
  const [streakReminder, setStreakReminder] = useState(true);
  const [reminderHour, setReminderHour] = useState(19);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(isNotificationsEnabled());
    setCanRequest(canRequestNotifications());
    const prefs = getNotificationPrefs();
    setStreakReminder(prefs.streakReminder);
    setReminderHour(prefs.reminderHour);
  }, []);

  if (!mounted) return null;

  async function handleToggle() {
    if (enabled) {
      setNotificationPrefs({ enabled: false });
      setEnabled(false);
    } else {
      const granted = await requestNotificationPermission();
      setEnabled(granted);
    }
  }

  function handleStreakToggle() {
    const next = !streakReminder;
    setStreakReminder(next);
    setNotificationPrefs({ streakReminder: next });
  }

  function handleHourChange(hour: number) {
    setReminderHour(hour);
    setNotificationPrefs({ reminderHour: hour });
  }

  if (!canRequest && !enabled) {
    return (
      <div style={{
        margin: "0 20px 16px", padding: "14px 16px",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 16, fontSize: 12, color: "var(--muted)", lineHeight: 1.5,
      }}>
        Notifications are blocked by your browser. Enable them in your browser settings to receive streak reminders.
      </div>
    );
  }

  return (
    <div style={{
      margin: "0 20px 16px", background: "var(--surface)",
      border: "1px solid var(--border)", borderRadius: 18, padding: "16px",
    }}>
      <div style={{
        fontFamily: "var(--font-fraunces), serif", fontSize: 14,
        fontWeight: 600, color: "var(--text)", marginBottom: 12,
      }}>
        Notifications
      </div>

      {/* Main toggle */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: enabled ? 12 : 0,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
            Push Notifications
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
            {enabled ? "Receiving reminders" : "Get streak and learning reminders"}
          </div>
        </div>
        <button
          onClick={handleToggle}
          style={{
            width: 48, height: 28, borderRadius: 14, border: "none",
            background: enabled ? "var(--amber)" : "var(--surface3)",
            position: "relative", cursor: "pointer", transition: "background 0.2s",
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 11,
            background: "white", position: "absolute", top: 3,
            left: enabled ? 23 : 3, transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }} />
        </button>
      </div>

      {/* Sub-settings when enabled */}
      {enabled && (
        <>
          <div style={{
            height: 1, background: "var(--border)", margin: "0 0 12px",
          }} />

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 10,
          }}>
            <div style={{ fontSize: 12, color: "var(--text)" }}>
              Streak-at-risk reminder
            </div>
            <button
              onClick={handleStreakToggle}
              style={{
                width: 40, height: 24, borderRadius: 12, border: "none",
                background: streakReminder ? "var(--green)" : "var(--surface3)",
                position: "relative", cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 9,
                background: "white", position: "absolute", top: 3,
                left: streakReminder ? 19 : 3, transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }} />
            </button>
          </div>

          {streakReminder && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Reminder time
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[17, 19, 21].map((h) => (
                  <button
                    key={h}
                    onClick={() => handleHourChange(h)}
                    style={{
                      padding: "4px 10px", borderRadius: 8, border: "none",
                      background: reminderHour === h ? "var(--amber-dim)" : "var(--surface2)",
                      color: reminderHour === h ? "var(--amber)" : "var(--muted)",
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {h > 12 ? `${h - 12}pm` : `${h}am`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
