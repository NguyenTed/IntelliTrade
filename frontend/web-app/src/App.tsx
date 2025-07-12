import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChartingPage } from "./features/charting/pages/ChartingPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignUpPage } from "./features/auth/pages/SignUpPage";

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/chart" element={<ChartingPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </Router>
  );
};
