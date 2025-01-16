import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginPage from "./components/auth/Login";

// Mock function to check if user is logged in
// const isLoggedIn = (): boolean => {
//   // Replace with actual logic, e.g., check a token in localStorage
//   return localStorage.getItem("authToken") !== null;
// };

function App() {
  const [isLoggedIn, setIsLoggedIn] =useState(false);
  return (
    <Router>
      <Routes>
        {/* If logged in, show HomePage; otherwise, redirect to LoginPage */}
        <Route
          path="/"
          element={isLoggedIn ? <HomePage /> : <Navigate to="/login" />}
        />
        {/* Login Page Route */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
