import { AuthProvider } from "@/app/providers/AuthProvider";
import { RequireAuth } from "@/app/router/RequireAuth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ChartPage } from "@/features/chart";
import LandingPage from "@/shared/pages/LandingPage";
import ProfilePage from "@/shared/pages/ProfilePage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import VNPayCallback from "@/features/payment/VNPayCallback";
import SubscriptionPlans from "@/features/payment/pages/SubscriptionPlan";
import IdeasPage from "@/features/articles/pages/IdeasPage";
import IdeasDetailPage from "@/features/articles/pages/IdeasDetailPage";
import NewsDetailPage from "@/features/articles/pages/NewsDetailPage";
import NewsPage from "@/features/articles/pages/NewsPage";
import { SignUpPage } from "@/features/auth/pages/SignUpPage";

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chart" element={<ChartPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/vnpay/callback" element={<VNPayCallback />} />
          <Route path="/payment/subscription" element={<SubscriptionPlans />} />
          <Route path="/ideas" element={<IdeasPage />} />
          <Route path="/ideas/:slug" element={<IdeasDetailPage />} />
          <Route path="/news/:slug" element={<NewsDetailPage />} />
          <Route path="/news" element={<NewsPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};
