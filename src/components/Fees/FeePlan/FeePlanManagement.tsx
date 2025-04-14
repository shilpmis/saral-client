import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Plus, Search, Eye, AlertTriangle } from "lucide-react"
import { AddFeePlanForm } from "./AddFeePlanForm"
import { useLazyGetAllFeesTypeQuery, useLazyGetFeesPlanQuery } from "@/services/feesService"
import type { FeesPlan } from "@/types/fees"
import type { PageMeta } from "@/types/global"
import { selectAllAcademicClasses } from "@/redux/slices/academicSlice"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectAccademicSessionsForSchool, selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import FeePlanDetailsDialog from "./FeePlanDetailsDialog"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { useTranslation } from "@/redux/hooks/useTranslation"
import { AcademicSession, UserRole } from "@/types/user"

export const FeePlanManagement: React.FC = () => {

  const { t } = useTranslation()
  const AcademicDivision = useAppSelector(selectAllAcademicClasses)
  const authState = useAppSelector(selectAuthState)
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
  const [getAllFeesType, { data: FeesTypeForSchool, isLoading: isFeeTypeLoading }] = useLazyGetAllFeesTypeQuery()

  const AcademicSessionsForSchool = useAppSelector(selectAccademicSessionsForSchool)
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)

  const [getFeesPlan, { data: FetchedFeePlans, isLoading }] = useLazyGetFeesPlanQuery()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(CurrentAcademicSessionForSchool ? CurrentAcademicSessionForSchool?.id.toString() : '');
  
  const [DialogForFeesPlan, setDialogForFeesPlan] = useState<{
    isOpen: boolean
    paln_id: number | null
    type: "create" | "update"
  }>({
    isOpen: false,
    paln_id: 0,
    type: "create",
  })
  const [FeePlansDetail, setFeePlansDetail] = useState<{ FeesPlan: FeesPlan[]; page: PageMeta } | null>(null)

  // New state for the details dialog
  const [detailsDialog, setDetailsDialog] = useState<{ isOpen: boolean; planId: number | null }>({
    isOpen: false,
    planId: null,
  })

  const handleDelete = (feePlan_id: number) => {
    // setFeePlans(feePlans.filter((feePlan) => feePlan.id !== id))
  }

  const handleEdit = (feePlan_id: number) => {
    setDialogForFeesPlan({
      isOpen: true,
      paln_id: feePlan_id,
      type: "update",
    })
  }

  const handleView = (feePlan_id: number) => {
    setDetailsDialog({
      isOpen: true,
      planId: feePlan_id,
    })
  }

  const handlePageChange = (page: number) => {
    getFeesPlan({  academic_session : CurrentAcademicSessionForSchool!.id  ,  page: 1 })
  }

  // Filter fee plans based on search term
  const filteredFeePlans =
    FeePlansDetail?.FeesPlan.filter(
      (plan) =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  useEffect(() => {
    if (FetchedFeePlans) {
      setFeePlansDetail({
        FeesPlan: FetchedFeePlans.data,
        page: FetchedFeePlans.meta,
      })
    }
  }, [FetchedFeePlans])

  /**
   *  useEffect for fetch other essentila thing , classes , fees type etc
   */

  useEffect(() => {
    if (!AcademicDivision) {
      getAcademicClasses(authState.user!.school_id)
    }
    getAllFeesType({
      academic_session_id: CurrentAcademicSessionForSchool!.id,
    })
  }, [])

  useEffect(() => {
    if(selectedAcademicYear){
      getFeesPlan({ academic_session : parseInt(selectedAcademicYear) ,  page: 1 })
    }else{
      getFeesPlan({ academic_session : CurrentAcademicSessionForSchool!.id  ,  page: 1 })
    }
  },[selectedAcademicYear])

  if(FeesTypeForSchool && FeesTypeForSchool.length === 0 && !isFeeTypeLoading){
    return(
      <div className="text-center py-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{t("no_fee_types_found")}</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-4">
          {t("you_need_to_create_fee_types_before_you_can_create_fee_plans")}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t("fee_plan_management")}</h1>
          {(authState.user?.role == UserRole.ADMIN  || authState.user?.role == UserRole.PRINCIPAL) && (<Button 
            onClick={() => setDialogForFeesPlan({ isOpen: true, paln_id: null, type: "create" })}>
            <Plus className="mr-2 h-4 w-4" /> {t("add_fee_plan")}
          </Button>)}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("fee_plans")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder={t("search_fee_plans...")}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("academic_year")} />
                </SelectTrigger>
                <SelectContent>
                  {AcademicSessionsForSchool && 
                  AcademicSessionsForSchool.map((academic : AcademicSession , index)=>{
                    return (<SelectItem key={index} value={academic.id.toString()}>{academic.session_name}</SelectItem>)}
                  )}
                </SelectContent>
              </Select>
            </div>

            {filteredFeePlans.length > 0 && (<div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("plan_name")}</TableHead>
                    <TableHead>{t("class")}</TableHead>
                    {/* <TableHead>{t("academic_year")}</TableHead> */}
                    <TableHead>{t("total_amount")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <TableRow key={`loading-${index}`}>
                          <TableCell colSpan={6} className="h-12 animate-pulse bg-gray-100"></TableCell>
                        </TableRow>
                      ))
                  ) : (
                    filteredFeePlans.map((feePlan) => (
                      <TableRow key={feePlan.id}>
                        <TableCell className="font-medium">{feePlan.name}</TableCell>
                        <TableCell>
                            {AcademicDivision &&
                            AcademicDivision.find((division) => division.id == feePlan.division_id)?.aliases}
                            {AcademicDivision &&
                            // AcademicDivision.find((division) => division.id == feePlan.class_id)?.}
                            // {AcademicDivision &&
                            AcademicDivision.find((division) => division.id == feePlan.division_id)?.division}
                          {!AcademicDivision && "Loading..."}
                        </TableCell>
                        {/* <TableCell>{feePlan.academic_session_id}</TableCell> */}
                        <TableCell>₹{Number(feePlan.total_amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={feePlan.status === "Active" ? "default" : "destructive"}>
                            {feePlan.status === "Active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="icon" onClick={() => handleView(feePlan.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(authState.user?.role == UserRole.ADMIN  || authState.user?.role == UserRole.PRINCIPAL) && (<Button variant="outline" size="icon" 
                              onClick={() => handleEdit(feePlan.id)}
                              disabled={CurrentAcademicSessionForSchool?.id !== feePlan.academic_session_id}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>)}
                            {/* <Button variant="outline" size="icon" onClick={() => handleDelete(feePlan.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>)}

            {!isLoading && 
              filteredFeePlans.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{t("no_fee_plan_found")}</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    {t("you_need_to_create_fee_types_before_you_can_create_fee_plans")}
                  </p>
                </div>
            )}              
            
            
            {FeePlansDetail?.page && (<SaralPagination
                currentPage={FeePlansDetail.page.current_page}
                totalPages={FeePlansDetail.page.last_page}
                onPageChange={handlePageChange}  
            ></SaralPagination>)}
          </CardContent>
        </Card>
      </div>

      {/* Dialog For Create and Edit Fees Plan */}
      <Dialog
        open={DialogForFeesPlan.isOpen}
        onOpenChange={(open) => {
          if (!open) return
          setDialogForFeesPlan({
            isOpen: false,
            paln_id: null,
            type: "create",
          })
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{DialogForFeesPlan.type === "update" ? t("edit_fee_plan") : t("create_new_fee_plan")}</DialogTitle>
          </DialogHeader>
          <div className="h-full">
            <AddFeePlanForm
              type={DialogForFeesPlan.type}
              plan_id={DialogForFeesPlan.paln_id}
              onSuccessfulSubmit={() => {
                getFeesPlan({ academic_session : CurrentAcademicSessionForSchool!.id  ,  page: 1 })
                setDialogForFeesPlan({
                  isOpen: false,
                  paln_id: null,
                  type: "create",
                })
              }}
              onCancel={() => {
                setDialogForFeesPlan({
                  isOpen: false,
                  paln_id: null,
                  type: "create",
                })
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Fee Plan Details Dialog */}
      <FeePlanDetailsDialog
        isOpen={detailsDialog.isOpen}
        onClose={() => setDetailsDialog({ isOpen: false, planId: null })}
        planId={detailsDialog.planId}
        academic_sessions={Number(selectedAcademicYear)}
      />
    </>
  )
}

