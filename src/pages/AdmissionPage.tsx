import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, UserCheck, UserX, Calendar } from "lucide-react"
import { AdmissionDashboard } from "@/components/Admission/AdmissionDashboard"
import { QuickInquiryForm } from "@/components/Admission/QuickInquiryForm"
import { InquiryList } from "@/components/Admission/InquiryList"

export const AdmissionModule: React.FC = () => {
  const [isQuickInquiryOpen, setIsQuickInquiryOpen] = useState(false)

  const dashboardData = {
    totalInquiries: 150,
    pendingApplications: 45,
    acceptedAdmissions: 80,
    rejectedApplications: 25,
    upcomingInterviews: 10,
  }

  const admissionTrends = [
    { grade: "Grade 1", inquiries: 30 },
    { grade: "Grade 2", inquiries: 25 },
    { grade: "Grade 3", inquiries: 35 },
    { grade: "Grade 4", inquiries: 20 },
    { grade: "Grade 5", inquiries: 40 },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admission Module</h1>
        <Button onClick={() => setIsQuickInquiryOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Inquiry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Admission Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <AdmissionDashboard data={dashboardData} trends={admissionTrends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600">Total Inquiries</p>
                  <p className="text-2xl font-bold text-blue-800">{dashboardData.totalInquiries}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm text-yellow-600">Pending Applications</p>
                  <p className="text-2xl font-bold text-yellow-800">{dashboardData.pendingApplications}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600">Accepted Admissions</p>
                  <p className="text-2xl font-bold text-green-800">{dashboardData.acceptedAdmissions}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-red-100 rounded-lg">
                <UserX className="h-6 w-6 text-red-600 mr-2" />
                <div>
                  <p className="text-sm text-red-600">Rejected Applications</p>
                  <p className="text-2xl font-bold text-red-800">{dashboardData.rejectedApplications}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-purple-100 rounded-lg col-span-2">
                <Calendar className="h-6 w-6 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-purple-600">Upcoming Interviews</p>
                  <p className="text-2xl font-bold text-purple-800">{dashboardData.upcomingInterviews}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <InquiryList />
        </CardContent>
      </Card>

      <QuickInquiryForm isOpen={isQuickInquiryOpen} onClose={() => setIsQuickInquiryOpen(false)} />
    </div>
  )
}

