import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import LandingPage from "@/pages/LandingPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import OfficerPage from "@/pages/OfficerPage";
import TeacherPage from "@/pages/TeacherPage";
import EVMPage from "@/pages/EVMPage";
import ResultsPage from "@/pages/ResultsPage";
import NotFound from "@/pages/NotFound";
import { loadTheme } from "@/lib/storage";

export default function App() {
  useEffect(() => {
    const theme = loadTheme();
    if (theme === "light") document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/officer" element={<OfficerPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/evm" element={<EVMPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}