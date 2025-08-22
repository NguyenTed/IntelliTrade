import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChartingPage } from "./features/charting/pages/ChartingPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignUpPage } from "./features/auth/pages/SignUpPage";
import VNPayCallback from "./features/payment/VNPayCallback";
import SubscriptionPlans from "./features/payment/pages/SubscriptionPlan";
import IdeasPage from "./features/ideas/ideas_list/IdeasPage";
import IdeasDetailPage from "./features/ideas/ideas_detail/IdeasDetailPage";
import NewsPage from "./features/news/news_list/NewsPage";

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/chart" element={<ChartingPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/vnpay/callback" element={<VNPayCallback />} />
        <Route path="/ideas" element={<IdeasPage />} />
        <Route path="/ideas/:slug" element={<IdeasDetailPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/payment/subscription" element={<SubscriptionPlans />} />
      </Routes>
    </Router>
  );
};
