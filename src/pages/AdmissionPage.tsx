import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, UserCheck, UserX, Calendar } from "lucide-react"
import { AdmissionDashboard } from "@/components/Admission/AdmissionDashboard"
import { QuickInquiryForm } from "@/components/Admission/QuickInquiryForm"
import { InquiryList } from "@/components/Admission/InquiryList"
import { AdmissionTrend, DashboardData } from "@/types/student"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"


export default function AdminAdmissonView() {
  const [isQuickInquiryOpen, setIsQuickInquiryOpen] = useState(false)

  // Mock dashboard data
  const dashboardData: DashboardData = {
    totalInquiries: 145,
    pendingApplications: 56,
    acceptedAdmissions: 78,
    rejectedApplications: 11,
    upcomingInterviews: 23,
  }

  // Mock trends data
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

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Admission Dashboard</h1>
          <Button onClick={() => setIsQuickInquiryOpen(true)}>Add Quick Inquiry</Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="quotas">Quota Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AdmissionDashboard data={dashboardData} trends={trendData} />
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Admission Inquiries</CardTitle>
                <CardDescription>Manage and process admission inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <InquiryList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quota Distribution</CardTitle>
                <CardDescription>Current allocation of seats across different quotas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">Quota distribution visualization will be displayed here</p>
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

