import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getVNPayUrl } from "../api/SubscriptionApiService";
import { authStore } from "@/features/auth/model/authStore";
import Header from "@/shared/layouts/Header";
import Footer from "@/shared/layouts/Footer";

const SubscriptionPlans: React.FC = () => {
  const whiteSectionRef = useRef<HTMLDivElement | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPlan] = useState<"Pro">("Pro");
  const contentRef = useRef<HTMLDivElement>(null);
  const user = authStore;
  const navigate = useNavigate();

  const handleSubscribe = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      const userId = user.getState().user?.userId;
      if (!userId) {
        navigate("/login");
        return;
      }
      const result = await getVNPayUrl(userId);
      let url = "";
      if (typeof result === "string") {
        url = result;
      } else if (result && typeof result === "object" && (result as any).url) {
        url = (result as any).url;
      }
      if (url) {
        window.location.href = url;
      } else {
        alert("Failed to get payment URL");
      }
    } catch (error) {
      console.error("Payment URL fetch error:", error);
      alert("Failed to get payment URL");
    }
  };

  // Soft parallax glow on scroll (tiny touch of delight)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", String(y * 6));
      el.style.setProperty("--ry", String(-x * 6));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <Header whiteSectionRef={whiteSectionRef} />
      <div className="relative min-h-screen bg-white">
        {/* ambient gradient + grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div
            className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-25"
            style={{
              background:
                "radial-gradient(120px 120px at 30% 30%, rgba(14,165,233,0.35), transparent), radial-gradient(180px 180px at 70% 60%, rgba(16,185,129,0.35), transparent)",
            }}
          />
          <div
            className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-25"
            style={{
              background:
                "radial-gradient(140px 140px at 70% 30%, rgba(99,102,241,0.35), transparent), radial-gradient(160px 160px at 30% 70%, rgba(14,165,233,0.35), transparent)",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
        </div>

        <div
          ref={contentRef}
          className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16"
        >
          <header className="text-center">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/70 px-3 py-1">
              <CrownIcon className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">
                Premium
              </span>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900">
              Choose your plan
            </h1>
            <p className="mt-2 max-w-xl text-balance text-neutral-600">
              Upgrade to unlock backtesting, multi‑chart layouts, and more
              powerful tools.
            </p>
          </header>

          {/* card */}
          <div
            className="mt-10 w-full max-w-3xl"
            style={{
              transform:
                "perspective(1200px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
              transformStyle: "preserve-3d",
              transition: "transform .12s ease-out",
            }}
          >
            <div className="relative rounded-2xl border border-neutral-200 bg-white/90 shadow-xl ring-1 ring-black/[0.02]">
              {/* subtle top gradient */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-2xl bg-gradient-to-br from-sky-50 via-emerald-50 to-indigo-50" />

              <div className="relative grid gap-6 p-6 sm:grid-cols-[1.2fr_.8fr] sm:gap-8 sm:p-8">
                {/* plan details */}
                <div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
                      Best value
                    </span>
                    <span className="text-sm text-neutral-500">
                      Billed monthly
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
                    Pro
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Distraction‑free trading and investing with advanced tools.
                  </p>

                  <ul className="mt-5 space-y-2 text-sm">
                    <FeatureItem>More indicators support</FeatureItem>
                    <FeatureItem>
                      Add unlimited charts in multichart
                    </FeatureItem>
                    <FeatureItem>Backtesting</FeatureItem>
                  </ul>

                  <p className="mt-4 text-xs text-neutral-500">
                    Secure checkout • Cancel anytime • No hidden fees
                  </p>
                </div>

                {/* price + cta */}
                <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-neutral-900">
                      100.000 VNĐ
                    </span>
                    <span className="pb-1 text-sm text-neutral-500">/mo</span>
                  </div>

                  <button
                    onClick={handleSubscribe}
                    className="mt-5 w-full rounded-xl bg-sky-600 px-4 py-2.5 font-medium text-white shadow hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    Subscribe
                  </button>

                  <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
                    <ShieldIcon className="h-4 w-4" />
                    <span>Payments via VNPay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* confirm dialog */}
          {showConfirm && (
            <ConfirmDialog
              plan={selectedPlan}
              onCancel={() => setShowConfirm(false)}
              onConfirm={handleConfirm}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SubscriptionPlans;

// ---------------- UI bits ----------------
function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-neutral-700">
      <CheckIcon className="mt-0.5 h-4 w-4 text-emerald-600" />
      <span>{children}</span>
    </li>
  );
}

function ConfirmDialog({
  plan,
  onCancel,
  onConfirm,
}: {
  plan: "Pro";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-title"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-sky-900/30 via-neutral-900/40 to-emerald-900/30 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div className="relative z-[1001] w-[92vw] max-w-md p-[1px] rounded-2xl bg-gradient-to-b from-white/40 to-white/40">
        <div
          className="absolute inset-0 -z-10 rounded-[18px] blur-xl opacity-70"
          aria-hidden
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, rgba(14,165,233,0.35), rgba(16,185,129,0.35), rgba(99,102,241,0.35), rgba(14,165,233,0.35))",
          }}
        />
        <div className="rounded-2xl bg-white shadow-xl border border-neutral-200 overflow-hidden">
          <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-sky-50 via-emerald-50 to-indigo-50 border-b border-neutral-200">
            <div className="flex items-start gap-3">
              <CrownIcon className="h-7 w-7 text-amber-500" />
              <div>
                <h3
                  id="confirm-title"
                  className="text-lg font-semibold text-neutral-900"
                >
                  Confirm payment
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  You're subscribing to the <strong>{plan}</strong> plan.
                  Proceed with VNPay?
                </p>
              </div>
            </div>
          </div>
          <div className="px-5 py-5">
            <ul className="space-y-2 text-sm">
              <FeatureItem>Unlock backtesting</FeatureItem>
              <FeatureItem>Open multi‑chart layouts</FeatureItem>
              <FeatureItem>More indicators and tools</FeatureItem>
            </ul>
            <p className="mt-4 text-xs text-neutral-500">
              You can cancel anytime in your account settings.
            </p>
          </div>
          <div className="px-5 pb-5 pt-2 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="group px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-medium shadow transition inline-flex items-center gap-2"
            >
              Confirm
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
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

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.293 5.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 1 1-1.414-1.414L14.586 11H4a1 1 0 1 1 0-2h10.586l-2.293-2.293a1 1 0 0 1 0-1.414z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l7 3v6c0 5.25-3.438 10.125-7 11-3.562-.875-7-5.75-7-11V5l7-3z" />
    </svg>
  );
}
