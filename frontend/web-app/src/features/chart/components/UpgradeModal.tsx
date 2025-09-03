import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function UpgradeModal({
  open,
  onClose,
  title = "Upgrade to Premium",
  message = "This feature is available for Premium users.",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}) {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus management (move focus into dialog on open)
  useEffect(() => {
    if (open) {
      // Try to focus the primary button first for quick action
      closeBtnRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      aria-hidden={!open}
    >
      {/* dimmer */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-sky-900/30 via-neutral-900/40 to-emerald-900/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* container with animated glow ring */}
      <div className="relative z-[1001] w-[92vw] max-w-lg p-[1px] rounded-2xl bg-gradient-to-b from-white/40 to-white/40">
        <div
          className="absolute inset-0 -z-10 rounded-[18px] blur-xl opacity-70"
          aria-hidden
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, rgba(14,165,233,0.35), rgba(16,185,129,0.35), rgba(99,102,241,0.35), rgba(14,165,233,0.35))",
          }}
        />

        {/* card */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-title"
          className="rounded-2xl bg-white shadow-xl border border-neutral-200 overflow-hidden"
        >
          {/* header */}
          <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-sky-50 via-emerald-50 to-indigo-50 border-b border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CrownIcon className="h-7 w-7 text-amber-500" />
              </div>
              <div>
                <h3
                  id="upgrade-title"
                  className="text-xl font-semibold text-neutral-900"
                >
                  {title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">{message}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-auto rounded-full p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* value props */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <FeatureChip label="Run Backtests" />
              <FeatureChip label="Multi‑Chart Layouts" />
              <FeatureChip label="Priority Updates" />
            </div>
          </div>

          {/* body */}
          <div className="px-5 py-5">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 text-neutral-700">
                <CheckIcon className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>
                  Unlock advanced analytics and backtest strategies instantly.
                </span>
              </li>
              <li className="flex items-start gap-2 text-neutral-700">
                <CheckIcon className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>Create up to 4 synchronized charts per workspace.</span>
              </li>
              <li className="flex items-start gap-2 text-neutral-700">
                <CheckIcon className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>Enjoy faster updates and early access to new tools.</span>
              </li>
            </ul>

            <p className="mt-4 text-xs text-neutral-500">
              Secure checkout • Cancel anytime
            </p>
          </div>

          {/* footer */}
          <div className="px-5 pb-5 pt-2 flex items-center justify-end gap-3">
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition"
            >
              Maybe later
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="group px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-medium shadow transition inline-flex items-center gap-2"
            >
              View plans
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm">
      <SparkleIcon className="h-3.5 w-3.5 text-sky-600" />
      {label}
    </span>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5 17h14l1-9-5 3-3-6-3 6-5-3 1 9zm-1 2a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2H4z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.364 7.364a1 1 0 0 1-1.414 0L3.293 9.829a1 1 0 1 1 1.414-1.414l3.222 3.222 6.657-6.657a1 1 0 0 1 1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.8 4.6L18 8.4l-4.2 1.8L12 15l-1.8-4.8L6 8.4l4.2-1.8L12 2zm7 10l1 2.5L23 16l-2.5 1.5L20 20l-1.5-2.5L16 16l2.5-1.5L19 12zm-14 0l1 2.5L9 16l-2.5 1.5L6 20l-1.5-2.5L2 16l2.5-1.5L5 12z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.293 5.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 1 1-1.414-1.414L14.586 11H4a1 1 0 1 1 0-2h10.586l-2.293-2.293a1 1 0 0 1 0-1.414z" />
    </svg>
  );
}
