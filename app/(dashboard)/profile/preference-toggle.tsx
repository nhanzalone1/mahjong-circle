"use client";

import { useTransition, useOptimistic } from "react";
import { updatePreference } from "./actions";

type Props = {
  icon: React.ReactNode;
  label: string;
  description: string;
  settingKey: "gameNotifications" | "groupVisibility" | "darkTheme";
  value: boolean;
};

export function PreferenceToggle({ icon, label, description, settingKey, value }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);

  const handleToggle = () => {
    const newValue = !optimisticValue;
    setOptimisticValue(newValue);

    startTransition(async () => {
      await updatePreference(settingKey, newValue);
    });
  };

  return (
    <div
      style={{
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        opacity: isPending ? 0.8 : 1,
      }}
      onClick={handleToggle}
    >
      <span style={{ color: "var(--cream-muted)" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 500, fontSize: "15px" }}>{label}</p>
        <p style={{ color: "var(--cream-muted)", fontSize: "13px" }}>
          {description}
        </p>
      </div>
      <div
        style={{
          width: "44px",
          height: "24px",
          borderRadius: "12px",
          background: optimisticValue ? "var(--jade)" : "var(--bg-surface)",
          border: optimisticValue ? "none" : "1px solid var(--border)",
          position: "relative",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: optimisticValue ? "22px" : "2px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: optimisticValue ? "#fff" : "var(--cream-muted)",
            transition: "left 0.2s",
          }}
        />
      </div>
    </div>
  );
}
