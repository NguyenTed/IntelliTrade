import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authStore } from "@/features/auth/model/authStore";
import { useAuthReady } from "@/app/providers/AuthProvider";

type RequireAuthProps = {
  children: React.ReactNode;
};

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const user = authStore((s) => s.user);
  const accessToken = authStore((s) => s.accessToken);
  const location = useLocation();
  const ready = useAuthReady();

  // Debug logging - remove in production
  // console.log("RequireAuth state:", {
  //   ready,
  //   hasUser: !!user,
  //   hasToken: !!accessToken,
  //   pathname: location.pathname,
  //   user: user
  // });

  // If bootstrap hasn't finished yet, show loading placeholder
  if (!ready) {
    return React.createElement(
      "div",
      { className: "p-8 text-center text-neutral-600" },
      "Loading..."
    );
  }

  // After bootstrap, check if user exists
  if (!user || !accessToken) {
    return React.createElement(Navigate as any, {
      to: "/login",
      replace: true,
      state: { from: location },
    });
  }

  return React.createElement(React.Fragment, null, children as any);
};
