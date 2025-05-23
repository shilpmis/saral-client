"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Receipt, FileText } from "lucide-react"
import { useLazyGetStudentFeesDetailsQuery } from "@/services/feesService"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectActiveAccademicSessionsForSchool, selectCurrentSchool } from "@/redux/slices/authSlice"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { toast } from "@/hooks/use-toast"
import StudentFeesDetailView from "./StudentFeesDetailView"
import ExtraFeesSection from "./ExtraFeesSection"
import type { StudentFeeDetails } from "@/types/fees"

interface StudentFeesDetailPageProps {
  studentId?: number
  onClose?: () => void
  showBackButton?: boolean
}

const StudentFeesDetailPage: React.FC<StudentFeesDetailPageProps> = ({
  studentId: propStudentId,
  onClose,
  showBackButton = true,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const params = useParams<{ student_id: string }>()
  const currentAcademicSession = useAppSelector(selectActiveAccademicSessionsForSchool)
  const schoolDetails = useAppSelector(selectCurrentSchool)

  const [activeTab, setActiveTab] = useState("regular-fees")

  // Determine student ID from props or URL params
  const effectiveStudentId = propStudentId || (params.student_id ? Number.parseInt(params.student_id) : null)

  const [getStudentFeesDetails, { data: studentFeeDetails, isLoading, isError }] =
    useLazyGetStudentFeesDetailsQuery()

  // Fetch student fees details
  useEffect(() => {
    if (effectiveStudentId && currentAcademicSession) {
      getStudentFeesDetails({
        student_id: effectiveStudentId,
        academic_session_id: currentAcademicSession.id,
      })
    }
  }, [effectiveStudentId, currentAcademicSession, getStudentFeesDetails])

  // Handle back button click
  const handleBackToList = () => {
    if (onClose) {
      onClose()
    } else {
      navigate(-1)
    }
  }

  // Handle refresh data
  const handleRefreshData = () => {
    if (effectiveStudentId && currentAcademicSession) {
      getStudentFeesDetails({
        student_id: effectiveStudentId,
        academic_session_id: currentAcademicSession.id,
      })
        .then(() => {
          toast({
            title: t("data_refreshed"),
            description: t("student_fee_details_have_been_refreshed"),
          })
        })
        .catch(() => {
          toast({
            variant: "destructive",
            title: t("error"),
            description: t("failed_to_refresh_data"),
          })
        })
    }
  }

  if (!effectiveStudentId) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-500">{t("no_student_id_provided")}</p>
          <Button onClick={handleBackToList} className="mt-4">
            {t("go_back")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {showBackButton && (
        <Button variant="outline" onClick={handleBackToList} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
        </Button>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="regular-fees" className="flex items-center">
            <Receipt className="mr-2 h-4 w-4" /> {t("regular_fees")}
          </TabsTrigger>
          <TabsTrigger value="extra-fees" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> {t("extra_fees")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regular-fees" className="mt-6">
          <StudentFeesDetailView
            studentId={effectiveStudentId}
            studentFeeDetails={studentFeeDetails as StudentFeeDetails}
            isLoading={isLoading}
            onClose={handleBackToList}
            academicSession={currentAcademicSession!}
            schoolInfo={{
              name: schoolDetails?.name || "School Management System",
              address: schoolDetails?.address || "",
            }}
            showBackButton={false}
          />
        </TabsContent>

        <TabsContent value="extra-fees" className="mt-6">
          {studentFeeDetails ? (
            <ExtraFeesSection
              studentId={effectiveStudentId}
              feesPlanId={studentFeeDetails.detail?.fees_plan?.id || 0}
              extraFees={studentFeeDetails.detail?.extra_fees || []}
              onRefresh={handleRefreshData}
            />
          ) : isLoading ? (
            <div className="text-center p-6">
              <p>{t("loading_extra_fees_data")}...</p>
            </div>
          ) : isError ? (
            <div className="text-center p-6">
              <p className="text-red-500">{t("failed_to_load_extra_fees_data")}</p>
              <Button onClick={handleRefreshData} className="mt-4">
                {t("retry")}
              </Button>
            </div>
          ) : (
            <div className="text-center p-6">
              <p>{t("no_data_available")}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StudentFeesDetailPage
