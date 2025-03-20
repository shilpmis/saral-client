import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Plus, Search, Eye } from "lucide-react"
import { AddFeePlanForm } from "./AddFeePlanForm"
import { useLazyGetFeesPlanQuery } from "@/services/feesService"
import type { FeesPlan } from "@/types/fees"
import type { PageMeta } from "@/types/global"
import { selectAllAcademicClasses } from "@/redux/slices/academicSlice"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectAccademicSessionsForSchool, selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import FeePlanDetailsDialog from "./FeePlanDetailsDialog"
import { SaralPagination } from "@/components/ui/common/SaralPagination"

export const FeePlanManagement: React.FC = () => {

  const AcademicDivision = useAppSelector(selectAllAcademicClasses)
  const authState = useAppSelector(selectAuthState)
  const [getAcademicClasses] = useLazyGetAcademicClassesQuery()

  const AcademicSessionsForSchool = useAppSelector(selectAccademicSessionsForSchool)
  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)

  const [getFeesPlan, { data: FetchedFeePlans, isLoading }] = useLazyGetFeesPlanQuery()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2023-2024")
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
    getFeesPlan({  academic_sessions : CurrentAcademicSessionForSchool!.id  ,  page: 1 })
  }

  // Filter fee plans based on search term
  const filteredFeePlans =
    FeePlansDetail?.FeesPlan.filter(
      (plan) =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  useEffect(() => {
    if (!FeePlansDetail) getFeesPlan({ academic_sessions : CurrentAcademicSessionForSchool!.id  ,  page: 1 })
  }, [])

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
  }, [])

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Fee Plan Management</h1>
          <Button onClick={() => setDialogForFeesPlan({ isOpen: true, paln_id: null, type: "create" })}>
            <Plus className="mr-2 h-4 w-4" /> Add Fee Plan
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Fee Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search fee plans..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
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
                  ) : filteredFeePlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        {searchTerm ? "No fee plans match your search" : "No fee plans found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFeePlans.map((feePlan) => (
                      <TableRow key={feePlan.id}>
                        <TableCell className="font-medium">{feePlan.name}</TableCell>
                        <TableCell>
                          {AcademicDivision &&
                            AcademicDivision.find((division) => division.id == feePlan.class_id)?.aliases}
                          {!AcademicDivision && "Loading..."}
                        </TableCell>
                        <TableCell>{feePlan.academic_year_id}</TableCell>
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
                            <Button variant="outline" size="icon" onClick={() => handleEdit(feePlan.id)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
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
            </div>

            {/* {FeePlansDetail?.page && FeePlansDetail.page.total_pages > 1 && (
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={FeePlansDetail.page.current_page === 1}
                    onClick={() => handlePageChange(FeePlansDetail.page.current_page - 1)}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: FeePlansDetail.page.total_pages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === FeePlansDetail.page.current_page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={FeePlansDetail.page.current_page === FeePlansDetail.page.total_pages}
                    onClick={() => handlePageChange(FeePlansDetail.page.current_page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )} */}
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
            <DialogTitle>{DialogForFeesPlan.type === "update" ? "Edit Fee Plan" : "Create New Fee Plan"}</DialogTitle>
          </DialogHeader>
          <div className="h-full">
            <AddFeePlanForm
              type={DialogForFeesPlan.type}
              plan_id={DialogForFeesPlan.paln_id}
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
      />
    </>
  )
}

