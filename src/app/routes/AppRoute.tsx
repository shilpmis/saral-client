import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../../features/Auth/pages/LoginPage";
import DashboardPage from "../../features/Dashboard/pages/DashboardPage";


const AppRoutes: React.FC = () => {
  const isLoggedIn = localStorage.getItem("authToken") !== null;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default AppRoutes;
