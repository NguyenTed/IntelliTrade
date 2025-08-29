"use client";
import { useEffect, useState, useRef } from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SearchIcon from "@mui/icons-material/Search";

export default function Header({
  whiteSectionRef,
}: {
  whiteSectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [isLight, setIsLight] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
        isLight ? "bg-white/90 text-black" : "bg-black/50 text-white"
      }`}
    >
      <div className="w-[90%] mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/" className="flex gap-2 items-center">
          <svg width="36" height="28" viewBox="0 0 36 28">
            <path
              d="M14 22H7V11H0V4h14v18zM28 22h-8l7.5-18h8L28 22z"
              fill="currentColor"
            ></path>
            <circle cx="20" cy="8" r="4" fill="currentColor"></circle>
          </svg>
          <div className="text-2xl font-bold">IntelliTrade</div>
        </a>

        {/* Menu */}
        <nav className="font-semibold">
          <ul className="flex space-x-6 items-center">
            <li>
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search..."
                  className={`pl-9 py-2 rounded-full transition-all ${
                    isLight
                      ? "bg-gray-100 text-black"
                      : "bg-[#2E2E2E] text-white"
                  }`}
                />
                <div className="absolute left-2 top-1.5">
                  <SearchIcon
                    className={isLight ? "text-black" : "text-white"}
                  />
                </div>
              </div>
            </li>
            <li>
              <a href="/chart">Chart</a>
            </li>
            <li>
              <a href="/ideas">Ideas</a>
            </li>
            <li>
              <a href="/news">News</a>
            </li>
          </ul>
        </nav>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <div
            className={`rounded-full cursor-pointer transition-all p-1 ${
              isLight ? "hover:bg-gray-200" : "hover:bg-[#3D3D3E]"
            }`}
            onClick={() => setOpenMenu(!openMenu)}
          >
            <PersonOutlineIcon sx={{ fontSize: 30 }} />
          </div>

          {openMenu && (
            <div
              className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50 ${
                isLight ? "bg-white text-black" : "bg-[#2E2E2E] text-white"
              }`}
            >
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                <p className="font-semibold">John Doe</p> {/* giả sử có name */}
              </div>
              <a
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-500 dark:hover:text-white"
              >
                Profile
              </a>
              <button
                onClick={() => alert("Logging out...")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-500 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
