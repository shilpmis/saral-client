import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, UserCheck, UserX, Calendar } from "lucide-react"
import { AdmissionDashboard } from "@/components/Admission/AdmissionDashboard"
import { QuickInquiryForm } from "@/components/Admission/QuickInquiryForm"
import { InquiryList } from "@/components/Admission/InquiryList"
import { useTranslation } from "@/redux/hooks/useTranslation"

export const AdmissionModule: React.FC = () => {
  const [isQuickInquiryOpen, setIsQuickInquiryOpen] = useState(false)
  const {t} = useTranslation()
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
        <h1 className="text-3xl font-bold text-gray-800">{t("admission_module")}</h1>
        <Button onClick={() => setIsQuickInquiryOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> {t("new_inquiry")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recent_inquiries")}</CardTitle>
        </CardHeader>
        <CardContent>
          <InquiryList />
        </CardContent>
      </Card>

      <QuickInquiryForm isOpen={isQuickInquiryOpen} onClose={() => setIsQuickInquiryOpen(false)} />
    </div>
  )
}

