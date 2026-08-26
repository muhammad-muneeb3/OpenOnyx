/**
 * Welcome Screen
 *
 * Displayed when no vault is selected. Provides vault opening
 * and a polished first-use experience.
 */

import React, { useEffect, useRef, useState } from "react";
import { FolderOpen, Plus, X } from "lucide-react";
import { Theme } from "../../types";
import { isDarkTheme } from "../../utils/helpers";
import type { AppSettings } from "./SettingsPage";

export type VaultEntryAction = "open" | "create";
export type VaultEntryTransitionPhase = "idle" | "transitioning" | "entered";

interface WelcomeScreenProps {
  onOpenVault: (action: VaultEntryAction) => void;
  previouslyOpenedVaults?: string[];
  onOpenRecentVault?: (path: string) => Promise<boolean>;
  onRemoveRecentVault?: (path: string) => Promise<void>;
  transitionPhase?: VaultEntryTransitionPhase;
  theme?: Theme;
  settings?: AppSettings;
}

export function WelcomeScreen({
  onOpenVault,
  previouslyOpenedVaults = [],
  onOpenRecentVault,
  onRemoveRecentVault,
  transitionPhase = "idle",
  theme = "dark",
  settings,
}: WelcomeScreenProps) {
  const [pressedAction, setPressedAction] = useState<VaultEntryAction | null>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const isDark = isDarkTheme(theme, settings);

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

  const actionsDisabled = transitionPhase !== "idle";
  const recentVaults = Array.from(new Set(previouslyOpenedVaults)).filter(Boolean);

  const vaultName = (path: string) =>
    path.split(/[/\\]/).filter(Boolean).pop() || path;

  const handleAction = (action: VaultEntryAction) => {
    if (actionsDisabled) return;

    setPressedAction(action);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    pressTimerRef.current = setTimeout(() => {
      setPressedAction(null);
      pressTimerRef.current = null;
    }, 140);

    onOpenVault(action);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-(--bg-primary) text-(--text-primary) select-none" ref={screenRef} data-transition-phase={transitionPhase}>
      <div className={`mb-6 flex items-center justify-center p-3.5 rounded-2xl shadow-sm border ${isDark ? "bg-[#18181b] border-neutral-800/80" : "bg-white border-neutral-200/60"} h-24 w-24`}>
        <img
          src={isDark ? "logos/logo-dark.png" : "logos/logo-light.png"}
          alt="OpenOnyx Logo"
          className="w-full h-full object-contain"
        />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-(--text-primary)">OpenOnyx</h1>
      <p className="text-sm text-(--text-secondary) text-center max-w-[360px] leading-relaxed mb-8">
        Your local-first knowledge base. Create, link, and visualize your
        thoughts as an interconnected graph.
      </p>
      <div className="flex items-center gap-4">
        <button
          className={`inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg bg-(--accent-primary) text-(--text-on-accent) border border-(--accent-primary) cursor-pointer transition-all duration-150 hover:bg-(--accent-secondary) hover:border-(--accent-secondary) disabled:opacity-50 disabled:cursor-not-allowed ${pressedAction === "open" ? "scale-95" : ""}`}
          onClick={() => handleAction("open")}
          disabled={actionsDisabled}
        >
          <FolderOpen size={18} strokeWidth={2} /> Open Vault
        </button>
        <button
          className={`inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg bg-(--bg-secondary) text-(--text-primary) border border-(--border-subtle) cursor-pointer transition-all duration-150 hover:bg-(--bg-hover) hover:border-(--border-medium) disabled:opacity-50 disabled:cursor-not-allowed ${pressedAction === "create" ? "scale-95" : ""}`}
          onClick={() => handleAction("create")}
          disabled={actionsDisabled}
        >
          <Plus size={18} strokeWidth={2} /> Create Vault
        </button>
      </div>
      {recentVaults.length > 0 && onOpenRecentVault ? (
        <section className="mt-8 w-full max-w-[440px]" aria-labelledby="recent-vaults-heading">
          <h2
            id="recent-vaults-heading"
            className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--text-muted)"
          >
            Recent vaults
          </h2>
          <div className="overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-secondary)">
            {recentVaults.map((path) => (
              <div
                key={path}
                className="group flex items-center gap-3 border-b border-(--border-subtle) px-3 py-2.5 last:border-b-0 hover:bg-(--bg-hover)"
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent text-left disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={actionsDisabled}
                  onClick={() => void onOpenRecentVault(path)}
                  title={path}
                >
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-(--text-primary)">
                    {vaultName(path)}
                  </span>
                  <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-(--text-muted)">
                    {path}
                  </span>
                </button>
                {onRemoveRecentVault ? (
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-(--text-muted) opacity-70 hover:bg-(--bg-active) hover:text-(--text-primary)"
                    onClick={() => void onRemoveRecentVault(path)}
                    aria-label={`Remove ${vaultName(path)} from recent vaults`}
                    title="Remove from list"
                  >
                    <X size={15} />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
