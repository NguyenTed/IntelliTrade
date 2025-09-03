import { useMemo, useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { updateMyProfile } from "@/features/profile/api/profileApi";
import Header from "../../../shared/layouts/Header";
import DefaultAvatar from "@/features/articles/components/DefaultAvatar";
import Footer from "../../../shared/layouts/Footer";
import { authStore } from "@/features/auth/model/authStore";
import { getRolesFromToken } from "@/shared/api/jwt";

export default function ProfilePage() {
  const whiteSectionRef = useRef<HTMLDivElement | null>(null);
  const user = authStore((s) => s.user);
  console.log(user);
  const accessToken = authStore((s) => s.accessToken);
  const isLoading = authStore((s) => s.isLoading);
  const loadMe = authStore((s) => s.loadMe);
  const logout = authStore((s) => s.logout);
  const navigate = useNavigate();

  const roles = useMemo(() => getRolesFromToken(accessToken), [accessToken]);
  const fullName = useMemo(() => {
    if (!user) return "—";
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length ? parts.join(" ") : user.username || "—";
  }, [user]);
  const dobDisplay = useMemo(() => {
    if (!user?.dob) return "—";
    const d = new Date(user.dob);
    return isNaN(d.getTime()) ? user.dob : d.toLocaleDateString();
  }, [user?.dob]);

  useEffect(() => {
    if (accessToken && !user && !isLoading) {
      loadMe().catch((error) => {
        console.error("Failed to load profile on ProfilePage:", error);
      });
    }
  }, [accessToken, user, isLoading, loadMe]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
  };

  // ---------- UI Bits ----------
  const isPremium = !!user?.premium;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    dob: user?.dob ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
  });

  useEffect(() => {
    // Sync form when user loads/changes
    setForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      dob: user?.dob ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
    });
  }, [user]);

  const onChangeField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updateMyProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        username: form.username,
        email: form.email,
      });
      setEditing(false);
      await loadMe?.();
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header whiteSectionRef={whiteSectionRef} />

      {/* Cover */}
      <div className="relative w-full h-[28vh] overflow-hidden">
        <img
          src="/media/trading-background.jpg"
          alt="cover"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"
          aria-hidden
        />
      </div>

      {/* Content */}
      <main ref={whiteSectionRef} className="relative -mt-14 sm:-mt-16">
        <div className="mx-auto w-[94%] max-w-5xl">
          {!user && !isLoading ? (
            <div className="mx-auto max-w-2xl py-24 px-6 text-center">
              <h2 className="text-2xl font-semibold">No profile loaded</h2>
              <p className="mt-2 text-neutral-600">
                You may need to sign in to view your profile.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-sky-700"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="-mt-10 sm:-mt-12">
                  <div className="relative inline-block">
                    <DefaultAvatar size={96} />
                    {isPremium && (
                      <span className="absolute -right-1 -bottom-1 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 shadow-sm">
                        <CrownIcon className="h-3.5 w-3.5 text-amber-500" />{" "}
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 truncate">
                      {fullName}
                    </h1>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600 truncate">
                    {user?.email ?? "—"}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {!editing ? (
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
                      type="button"
                      onClick={() => setEditing(true)}
                    >
                      <EditIcon className="h-4 w-4" /> Edit
                    </button>
                  ) : (
                    <>
                      <button
                        className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-700"
                        type="button"
                        onClick={handleSave}
                      >
                        Save
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setForm({
                            firstName: user?.firstName ?? "",
                            lastName: user?.lastName ?? "",
                            dob: user?.dob ?? "",
                            username: user?.username ?? "",
                            email: user?.email ?? "",
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogoutIcon className="h-4 w-4" />{" "}
                    {isLoading ? "Logging out…" : "Logout"}
                  </button>
                </div>
              </div>

              {/* Profile Form */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FieldPill
                  label="Username"
                  value={form.username}
                  onChange={(v) => onChangeField("username", v)}
                  disabled={!editing}
                  placeholder="yourhandle"
                />
                <FieldPill
                  label="Email Address"
                  value={form.email}
                  onChange={(v) => onChangeField("email", v)}
                  disabled={!editing}
                  type="email"
                  placeholder="name@email.com"
                />
                <FieldPill
                  label="First Name"
                  value={form.firstName}
                  onChange={(v) => onChangeField("firstName", v)}
                  disabled={!editing}
                  placeholder="First name"
                />
                <FieldPill
                  label="Last Name"
                  value={form.lastName}
                  onChange={(v) => onChangeField("lastName", v)}
                  disabled={!editing}
                  placeholder="Last name"
                />
                <FieldPill
                  label="Date of Birth"
                  value={form.dob}
                  onChange={(v) => onChangeField("dob", v)}
                  disabled={!editing}
                  type="date"
                  placeholder="YYYY-MM-DD"
                />
              </div>

              {/* Subscription (premium only) */}
              {isPremium && (
                <div className="mt-10">
                  <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-amber-200/60 via-yellow-200/60 to-amber-300/60">
                    <div className="rounded-2xl bg-white">
                      <div className="flex items-center justify-between px-4 sm:px-5 py-4 rounded-t-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 border-b border-amber-200/70">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                            <CrownIcon className="h-4 w-4" />
                          </span>
                          <h2 className="text-base sm:text-lg font-semibold text-neutral-900">
                            Premium Subscription
                          </h2>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                          Active
                        </span>
                      </div>
                      <div className="px-4 sm:px-5 py-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <FieldPill
                            label="Plan"
                            value={user?.planKey ?? "—"}
                            onChange={() => {}}
                            disabled
                          />
                          <FieldPill
                            label="Start Date"
                            value={
                              user?.premiumSince
                                ? new Date(
                                    user.premiumSince
                                  ).toLocaleDateString()
                                : "—"
                            }
                            onChange={() => {}}
                            disabled
                          />
                          <FieldPill
                            label="End Date"
                            value={
                              user?.premiumUntil
                                ? new Date(
                                    user.premiumUntil
                                  ).toLocaleDateString()
                                : "—"
                            }
                            onChange={() => {}}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="mt-1 text-[15px] font-semibold text-neutral-900 break-words">
        {value || "—"}
      </div>
    </div>
  );
}

function FieldCard({
  label,
  value,
  editing,
  onChange,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-200">
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      {!editing ? (
        <div className="mt-1 text-[15px] font-semibold text-neutral-900 break-words">
          {value || "—"}
        </div>
      ) : (
        <input
          type={type || "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[15px] text-neutral-900 shadow-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
        />
      )}
    </div>
  );
}

function FieldPill({
  label,
  value,
  onChange,
  placeholder,
  type,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[13px] font-medium text-neutral-700">
        {label}
      </div>
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-full border px-4 py-3 text-[15px] outline-none transition shadow-sm ${
          disabled
            ? "bg-neutral-50 text-neutral-700 border-neutral-200"
            : "bg-white text-neutral-900 border-neutral-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        }`}
      />
    </label>
  );
}

// ---------- Icons (inline, no external deps) ----------
function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5 17h14l1-9-5 3-3-6-3 6-5-3 1 9zm-1 2a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2H4z" />
    </svg>
  );
}
function EditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M14.846 2.879a3 3 0 0 1 4.243 4.243l-9.9 9.9a2 2 0 0 1-.848.504l-4.11 1.173a.75.75 0 0 1-.927-.927l1.173-4.11a2 2 0 0 1 .504-.848l9.865-9.865Z" />
      <path d="M13.5 4.207 15.793 6.5" />
    </svg>
  );
}
function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3a2 2 0 0 0-2 2v2a1 1 0 1 1-2 0V5a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2a1 1 0 1 1 2 0v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7Z" />
      <path d="M11 10a1 1 0 0 0-1-1H4.414l1.293-1.293a1 1 0 1 0-1.414-1.414L1.586 9a2 2 0 0 0 0 2l2.707 2.707a1 1 0 1 0 1.414-1.414L4.414 11H10a1 1 0 0 0 1-1Z" />
    </svg>
  );
}
function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 2a2 2 0 0 1 1.789 1.106l.5 1A2 2 0 0 0 14.09 5.41l1.104.16A2 2 0 0 1 16 9l-.804.804a2 2 0 0 0-.578 1.777l.189 1.092a2 2 0 0 1-2.764 2.17l-.99-.45a2 2 0 0 0-1.646 0l-.99.45A2 2 0 0 1 4.656 12.67l.19-1.092a2 2 0 0 0-.579-1.777L3.464 9A2 2 0 0 1 4.806 5.57l1.104-.161A2 2 0 0 0 7.71 4.105l.5-1A2 2 0 0 1 10 2Z" />
    </svg>
  );
}
function UserTinyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 18a6 6 0 1 1 12 0H4Z" />
    </svg>
  );
}
