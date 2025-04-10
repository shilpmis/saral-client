"use client";

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import Header from "./Components/Header";
import { Outlet, useNavigate } from "react-router-dom";
import { selectVerificationStatus, selectActiveAccademicSessionsForSchool } from "@/redux/slices/authSlice";
import { Toaster } from "@/components/ui/toaster";
import AppSidebar from "./Components/Appsidebar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";
import { useAppSelector } from "@/redux/hooks/useAppSelector";
import { AcademicSessionForm } from "@/components/Settings/AcademicSettings/AcademicSessionForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminLayout() {
  const verificationStatus = useAppSelector(selectVerificationStatus);
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool);
  const navigate = useNavigate();
  const [showAcademicSessionForm, setShowAcademicSessionForm] = useState(false);

  useEffect(() => {
    if (!verificationStatus.isAuthenticated && !verificationStatus.isVerificationInProgress) {
      navigate("/");
    }
  }, [verificationStatus, navigate]);

  const handleCloseWarningDialog = () => {
    // Close the dialog
    setShowAcademicSessionForm(false);
  };

  return (
    <>
      {!currentAcademicSession && (
        <AlertDialog open={!currentAcademicSession} onOpenChange={() => {}}>
          <AlertDialogContent className="bg-yellow-50 border-yellow-200">
            <AlertDialogHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
                  <AlertDialogTitle className="text-yellow-700">No Active Academic Session</AlertDialogTitle>
                </div>
              </div>
              <AlertDialogDescription className="text-yellow-600">
                There is no active academic session. Please create or activate an academic session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button onClick={() => setShowAcademicSessionForm(true)}>
                Create Academic Session
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Dialog open={showAcademicSessionForm} onOpenChange={setShowAcademicSessionForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Academic Session</DialogTitle>
          </DialogHeader>
          <AcademicSessionForm onSuccess={() => setShowAcademicSessionForm(false)} />
        </DialogContent>
      </Dialog>
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
