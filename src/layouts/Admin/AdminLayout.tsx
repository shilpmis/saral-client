"use client";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { useEffect } from "react";
import Header from "./Components/Header";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks/useAppSelector";
import { selectVerificationStatus } from "@/redux/slices/authSlice";
import { Toaster } from "@/components/ui/toaster";
import AppSidebar from "./Components/Appsidebar";

export default function AdminLayout() {
  const verificationStatus = useAppSelector(selectVerificationStatus);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("verificationStatus", verificationStatus);
    if (!verificationStatus.isAuthenticated && !verificationStatus.isVerificationInProgress) {
      navigate("/");
    }
  }, [verificationStatus, navigate]);

  return (
    <>
      {verificationStatus.isVerificationInProgress && <div>Loading for dashboard ....</div>}
      {verificationStatus.isAuthenticated && (
        <SidebarProvider defaultOpen={true}>
          <SidebarContent />
        </SidebarProvider>
      )}
    </>
  );
}

function SidebarContent() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <AppSidebar isCollapsed={isCollapsed} />
      <main className="w-full">
        <Header />
        <div className="p-3 w-full h-auto mt-6">
          <Outlet />
        </div>
        <Toaster />
      </main>
    </>
  );
}
