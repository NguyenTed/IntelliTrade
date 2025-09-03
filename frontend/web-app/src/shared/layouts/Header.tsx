"use client";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authStore } from "@/features/auth/model/authStore";

function IconUserSolid(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 1 1 14 0H5Z" />
    </svg>
  );
}
function IconChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.06l3.71-2.83a.75.75 0 1 1 .92 1.18l-4.25 3.25a.75.75 0 0 1-.92 0L5.21 8.41a.75.75 0 0 1 .02-1.2z" />
    </svg>
  );
}

export default function Header({
  whiteSectionRef,
}: {
  whiteSectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [isLight, setIsLight] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Get user data and logout function from auth store
  const user = authStore((s) => s.user);
  const logout = authStore((s) => s.logout);
  const isLoading = authStore((s) => s.isLoading);
  const showPricing = !(user && (user as any).premium);

  useEffect(() => {
    const handleScroll = () => {
      if (!whiteSectionRef.current) return;
      const rect = whiteSectionRef.current.getBoundingClientRect();
      if (rect.top <= 80) {
        setIsLight(true);
      } else {
        setIsLight(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [whiteSectionRef]);

  // đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setOpenMenu(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still navigate to login even if logout fails
      navigate("/login");
    }
  };

  // Get display name for user
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      "User"
    : "Guest";

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
        isLight
          ? "bg-white/80 text-neutral-900 backdrop-blur border-b border-neutral-200"
          : "bg-neutral-900/60 text-white backdrop-blur"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-neutral-300/60 to-transparent" />
      </div>
      <div className="relative w-[94%] max-w-7xl mx-auto flex items-center justify-between gap-4 px-3 sm:px-6 py-2.5">
        <div
          aria-hidden
          className="absolute left-0 top-0 h-full w-20 pointer-events-none"
        >
          <div className="h-full w-full opacity-30 bg-[radial-gradient(120px_60px_at_10%_30%,rgba(14,165,233,0.2),transparent_60%)]" />
        </div>
        {/* Logo */}
        <a
          href="/"
          className="flex gap-2 items-center transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <img
            src="/media/logo.png"
            alt="Intelli Trade Logo"
            className="h-8 w-auto"
            loading="lazy"
          />
        </a>

        {/* Menu */}
        <nav
          className={
            showPricing
              ? "font-medium hidden md:block"
              : "font-medium hidden md:block absolute left-1/2 -translate-x-1/2"
          }
        >
          <ul className="flex space-x-1 items-center">
            {showPricing && (
              <li>
                <a
                  href="/pricing"
                  className={`${
                    pathname === "/pricing"
                      ? isLight
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-900"
                      : isLight
                      ? "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                      : "text-neutral-200 hover:text-white hover:bg-neutral-800"
                  } px-3 py-2 rounded-full transition`}
                >
                  Pricing
                </a>
              </li>
            )}
            <li>
              <a
                href="/chart"
                className={`${
                  pathname.startsWith("/chart")
                    ? isLight
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-900"
                    : isLight
                    ? "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                    : "text-neutral-200 hover:text-white hover:bg-neutral-800"
                } px-3 py-2 rounded-full transition`}
              >
                Chart
              </a>
            </li>
            <li>
              <a
                href="/ideas"
                className={`${
                  pathname.startsWith("/ideas")
                    ? isLight
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-900"
                    : isLight
                    ? "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                    : "text-neutral-200 hover:text-white hover:bg-neutral-800"
                } px-3 py-2 rounded-full transition`}
              >
                Ideas
              </a>
            </li>
            <li>
              <a
                href="/news"
                className={`${
                  pathname.startsWith("/news")
                    ? isLight
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-900"
                    : isLight
                    ? "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
                    : "text-neutral-200 hover:text-white hover:bg-neutral-800"
                } px-3 py-2 rounded-full transition`}
              >
                News
              </a>
            </li>
          </ul>
        </nav>

        {/* Profile / Login */}
        <div className="relative" ref={menuRef}>
          {!user ? (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className={`${
                  isLight
                    ? "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 border-neutral-200 bg-white"
                    : "text-neutral-200 hover:text-white hover:bg-neutral-800 border-neutral-700 bg-neutral-800"
                } px-4 py-2 rounded-full border transition hidden sm:inline-block`}
              >
                Log in
              </a>
              <a
                href="/signup"
                className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-medium shadow"
              >
                Sign up
              </a>
            </div>
          ) : (
            <>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openMenu}
                onClick={() => setOpenMenu((v) => !v)}
                className="group inline-flex items-center gap-2 focus:outline-none"
              >
                <span className="rounded-full p-[3px] bg-gradient-to-br from-sky-300/70 via-emerald-300/70 to-indigo-300/70 shadow transition">
                  <span
                    className={`grid place-items-center h-10 w-10 sm:h-11 sm:w-11 rounded-full shadow-md ring-1 transition-transform duration-150 ease-out group-hover:shadow-lg group-active:scale-[0.98] ${
                      isLight
                        ? "bg-white text-neutral-800 ring-neutral-200"
                        : "bg-neutral-800 text-white ring-neutral-700"
                    }`}
                  >
                    <span className="relative inline-grid place-items-center">
                      <IconUserSolid className="h-6 w-6" />
                      <span
                        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.9),transparent_55%)]"
                        aria-hidden
                      />
                    </span>
                  </span>
                </span>
                <IconChevronDown
                  className={`h-4 w-4 transition ${
                    openMenu ? "rotate-180" : ""
                  } ${isLight ? "text-neutral-500" : "text-neutral-300"}`}
                />
              </button>

              {openMenu && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl z-50 border ${
                    isLight
                      ? "bg-white text-neutral-900 border-neutral-200"
                      : "bg-neutral-800 text-white border-neutral-700"
                  }`}
                  role="menu"
                >
                  <div
                    className={`px-4 py-3 rounded-t-xl ${
                      isLight
                        ? "bg-gradient-to-br from-sky-50 via-emerald-50 to-sky-100 border-b border-neutral-200"
                        : "bg-neutral-800 border-b border-neutral-700"
                    }`}
                  >
                    <p className="font-semibold leading-tight">{displayName}</p>
                    {user && (
                      <p className="text-xs opacity-70 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>

                  <div className="py-2">
                    <a
                      href="/profile"
                      className={`${
                        isLight
                          ? "hover:bg-neutral-50"
                          : "hover:bg-neutral-700/70"
                      } block px-4 py-2 text-sm transition`}
                      role="menuitem"
                    >
                      Profile
                    </a>
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className={`${
                        isLight
                          ? "hover:bg-neutral-50"
                          : "hover:bg-neutral-700/70"
                      } w-full text-left px-4 py-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed`}
                      role="menuitem"
                    >
                      {isLoading ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
