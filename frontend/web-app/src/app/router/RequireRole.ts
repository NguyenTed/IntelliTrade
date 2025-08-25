import React from "react";
import { Navigate } from "react-router-dom";
import { authStore } from "@/features/auth/model/authStore";
export const RequireRole: React.FC<{ role: string; children: React.ReactNode }> = ({ role, children }) => {
  const user = authStore((s) => s.user);
  if (!user?.roles?.includes(role)) return <Navigate to="/forbidden" replace />;
  return <>{children}</>;
};
