"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AdmissionTrend, DashboardData } from "@/mock/admissionMockData"
import { AdmissionDashboard } from "@/components/Admission/AdmissionDashboard"
import { InquiryList } from "@/components/Admission/InquiryList"
import { QuickInquiryForm } from "@/components/Admission/QuickInquiryForm"
import { Link } from "react-router-dom"
import AdmissionInquiryForm from "@/components/Admission/AdmissionInquiryForm"
import { useTranslation } from "@/redux/hooks/useTranslation"

export default function AdminAdmissonView() {
  const [isQuickInquiryOpen, setIsQuickInquiryOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const { t } = useTranslation()

  // Mock dashboard data - not used with current AdmissionDashboard implementation
  const dashboardData: DashboardData = {
    totalInquiries: 145,
    pendingApplications: 56,
    acceptedAdmissions: 78,
    rejectedApplications: 11,
    upcomingInterviews: 23,
  }

  // Mock trends data - not used with current AdmissionDashboard implementation
  const trendData: AdmissionTrend[] = [
    { grade: "Grade 1", inquiries: 25 },
    { grade: "Grade 2", inquiries: 18 },
    { grade: "Grade 3", inquiries: 22 },
    { grade: "Grade 4", inquiries: 15 },
    { grade: "Grade 5", inquiries: 30 },
    { grade: "Grade 6", inquiries: 12 },
    { grade: "Grade 7", inquiries: 8 },
    { grade: "Grade 8", inquiries: 10 },
    { grade: "Grade 9", inquiries: 5 },
    { grade: "Grade 10", inquiries: 0 },
  ]
  useEffect(()=> {
    const translated = t("view_all_admission_inquiries");
    console.log("translated", translated);
  })
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight">{t("admission_dashboard")}</h1>
          <div className="flex gap-4">
            <Link to="/d/admissions/inquiry">
              <Button size="lg">{t("view_all_admission_inquiries")}</Button>
            </Link>
            <Button onClick={() => setIsQuickInquiryOpen(true)}>{t("add_quick_inquiry")}</Button>
            <Button onClick={() => setIsInquiryOpen(true)}>{t("add_admission_inquiry")}</Button>
          </div>
        </div>

        {/* Inquiry Modal */}
        {isInquiryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{t("add_admission_inquiry")}</h2>
                <Button variant="ghost" onClick={() => setIsInquiryOpen(false)}>Close</Button>
              </div>
              <AdmissionInquiryForm />
            </div>
          </div>
        )}

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
            <TabsTrigger value="inquiries">{t("recent_inquiries")}</TabsTrigger>
            <TabsTrigger value="quotas">{t("quota_distribution")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Remove the data and trends props */}
            <AdmissionDashboard />
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("recent_admission_inquiries")}</CardTitle>
                <CardDescription>{t("manage_and_process_admission_inquiries")}</CardDescription>
              </CardHeader>
              <CardContent>
                <InquiryList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("quota_distribution")}</CardTitle>
                <CardDescription>{t("current_allocation_of_seats_across_different_quotas")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">{t("quota_distribution_visualization_will_be_displayed_here")}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <QuickInquiryForm isOpen={isQuickInquiryOpen} onClose={() => setIsQuickInquiryOpen(false)} />
    </div>
  )
}