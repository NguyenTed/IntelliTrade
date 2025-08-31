import { useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layouts/Header";
import DefaultAvatar from "@/features/articles/components/DefaultAvatar";
import Footer from "../layouts/Footer";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";

import { authStore } from "@/features/auth/model/authStore";
import { getRolesFromToken } from "@/shared/api/jwt";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const whiteSectionRef = useRef<HTMLDivElement | null>(null);
  const user = authStore((s) => s.user);
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

  // Debug logging - remove in production
  // useEffect(() => {
  //   console.log("ProfilePage Debug:", {
  //     hasUser: !!user,
  //     hasToken: !!accessToken,
  //     isLoading,
  //     user: user,
  //     tokenLength: accessToken?.length || 0,
  //   });
  // }, [user, accessToken, isLoading]);

  // Attempt to load profile if we have a token but no user data
  useEffect(() => {
    if (accessToken && !user && !isLoading) {
      console.log("Attempting to load profile data...");
      loadMe().catch((error) => {
        console.error("Failed to load profile on ProfilePage:", error);
      });
    }
  }, [accessToken, user, isLoading, loadMe]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
  };

  // Show loading state while profile is being fetched
  if (isLoading) {
    return (
      <div>
        <Header whiteSectionRef={whiteSectionRef} />
        <div className="mx-auto max-w-3xl py-24 px-6 text-center">
          <h2 className="text-2xl font-semibold">Loading Profile...</h2>
          <div className="mt-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-600 border-r-transparent"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Header whiteSectionRef={whiteSectionRef} />
        <div className="mx-auto max-w-3xl py-24 px-6 text-center">
          <h2 className="text-2xl font-semibold">No profile loaded</h2>
          <p className="mt-2 text-neutral-600">
            You may need to sign in to view your profile.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-5 py-2.5 font-semibold text-white hover:bg-violet-500"
            >
              Go to Login
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div>
      <Header whiteSectionRef={whiteSectionRef} />
      <div className="w-full h-[40vh] overflow-hidden">
        <img
          src="https://i.pinimg.com/1200x/0d/46/f6/0d46f64778413b07d406604c5e712715.jpg"
          alt="cover"
          className="w-full h-full object-cover object-center"
        />
        {/* Profile image + content */}
      </div>
      <div
        ref={whiteSectionRef}
        className="mx-[13%] flex flex-col gap-4 pb-[15%]"
      >
        <div className="-mt-[75px] flex items-center gap-6">
          <DefaultAvatar size={170} />
          <div className="bg-blue-500 text-white font-bold h-fit px-4 py-2 rounded-lg mt-10">
            <span>Premium</span>
          </div>
        </div>
        <h3 className="text-[30px] font-bold">{fullName}</h3>
        <hr />
        <div className="flex justify-between">
          <h3 className="text-[25px] font-semibold">Personal Information</h3>
          <div className="flex gap-3">
            <button className="bg-gray-500 hover:bg-gray-400 transition-colors duration-300 ease-in-out cursor-pointer flex items-center gap-3 text-white font-bold h-fit px-6 py-2 rounded-lg">
              <span>Edit</span>
              <EditIcon sx={{ fontSize: 20 }} />
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-400 transition-colors duration-300 ease-in-out cursor-pointer flex items-center gap-3 text-white font-bold h-fit px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? "Logging out..." : "Logout"}</span>
              <LogoutIcon sx={{ fontSize: 20 }} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols md:grid-cols-2 lg:grid-cols-3 gap-8 text-black font-semibold">
          <div className="flex flex-col overflow-hidden">
            <span className="text-gray-400">First Name</span>
            <span>{user?.firstName ?? "—"}</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-gray-400">Last Name</span>
            <span>{user?.lastName ?? "—"}</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-gray-400">Date of Birth</span>
            <span>{dobDisplay}</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-gray-400">Username</span>
            <span>{user?.username ?? "—"}</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-gray-400">Email</span>
            <span>{user?.email ?? "—"}</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-gray-400">Roles</span>
            <span>{roles.length ? roles.join(", ") : "—"}</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
