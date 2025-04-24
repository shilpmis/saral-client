"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { User, Mail, Phone, Briefcase, CreditCard, FileText } from "lucide-react"

interface EmployeeProps {
  employee: any
}

const EmployeeOverview: React.FC<EmployeeProps> = ({ employee }) => {
  const { t } = useTranslation()

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t("personal_information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("full_name")}</p>
              <p className="font-medium">{employee.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("gender")}</p>
              <p className="font-medium">{employee.gender || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("date_of_birth")}</p>
              <p className="font-medium">{formatDate(employee.dateOfBirth)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("blood_group")}</p>
              <p className="font-medium">{employee.bloodGroup || "N/A"}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">{t("address")}</p>
            <p className="font-medium">{employee.address || "N/A"}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("email")}</p>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{employee.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("contact_number")}</p>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{employee.contactNumber}</p>
              </div>
            </div>
            {employee.emergencyContact && (
              <div>
                <p className="text-sm text-muted-foreground">{t("emergency_contact")}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{employee.emergencyContact}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {t("employment_information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("employee_code")}</p>
              <p className="font-medium">{employee.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("joining_date")}</p>
              <p className="font-medium">{formatDate(employee.joiningDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("employment_type")}</p>
              <p className="font-medium">{employee.employmentType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("status")}</p>
              <p className="font-medium">{employee.status}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("role")}</p>
              <p className="font-medium">{employee.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("department")}</p>
              <p className="font-medium">{employee.department}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">{t("qualification")}</p>
            <p className="font-medium">{employee.qualification || "N/A"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {t("bank_details")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {employee.bankDetails ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("bank_name")}</p>
                  <p className="font-medium">{employee.bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("account_number")}</p>
                  <p className="font-medium">{employee.bankDetails.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("ifsc_code")}</p>
                  <p className="font-medium">{employee.bankDetails.ifscCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("branch")}</p>
                  <p className="font-medium">{employee.bankDetails.branch}</p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">{t("no_bank_details_available")}</p>
          )}
        </CardContent>
      </Card>

      {/* Statutory Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t("statutory_information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("epf_number")}</p>
              <p className="font-medium">{employee.epfNo || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("uan_number")}</p>
              <p className="font-medium">{employee.uanNo || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("pf_account_number")}</p>
              <p className="font-medium">{employee.pfAccountNo || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmployeeOverview
