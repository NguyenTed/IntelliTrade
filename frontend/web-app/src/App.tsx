import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChartingPage } from "./features/chart/pages/ChartingPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignUpPage } from "./features/auth/pages/SignUpPage";
import VNPayCallback from "./features/payment/VNPayCallback";
import SubscriptionPlans from "./features/payment/pages/SubscriptionPlan";
import IdeasPage from "./features/articles/pages/IdeasPage";
import IdeasDetailPage from "./features/articles/pages/IdeasDetailPage";
import NewsPage from "./features/articles/pages/NewsPage";
import NewsDetailPage from "./features/articles/pages/NewsDetailPage";
import LandingPage from "./shared/pages/LandingPage";
import ProfilePage from "./shared/pages/ProfilePage";

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chart" element={<ChartingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/vnpay/callback" element={<VNPayCallback />} />
        <Route path="/payment/subscription" element={<SubscriptionPlans />} />
        <Route path="/payment/subscription" element={<SubscriptionPlans />} />
        <Route path="/ideas" element={<IdeasPage />} />
        <Route path="/ideas/:slug" element={<IdeasDetailPage />} />
        <Route path="/news/:slug" element={<NewsDetailPage />} />
        <Route path="/news" element={<NewsPage />} />
      </Routes>
    </Router>
  );
};
