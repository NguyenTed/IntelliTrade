import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChartingPage } from "./features/charting/pages/ChartingPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignUpPage } from "./features/auth/pages/SignUpPage";
import  VNPayCallback  from "./features/payment/VNPayCallback";

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/chart" element={<ChartingPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/vnpay/callback" element={<VNPayCallback />} />
      </Routes>
    </Router>
  );
};
