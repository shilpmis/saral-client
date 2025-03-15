import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Search, Eye } from "lucide-react"
import { AddFeePlanForm } from "./AddFeePlanForm"
import { useLazyGetFeesPlanQuery } from "@/services/feesService"
import { FeesPlan } from "@/types/fees"
import { PageMeta } from "@/types/global"
import { selectAllAcademicClasses } from "@/redux/slices/academicSlice"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectAuthState } from "@/redux/slices/authSlice"
import { useTranslation } from "@/redux/hooks/useTranslation"

export const FeePlanManagement: React.FC = () => {

    const AcademicDivision = useAppSelector(selectAllAcademicClasses)
    const authState = useAppSelector(selectAuthState)
    const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
    const {t} = useTranslation()

    const [getFeesPlan, { data: FetchedFeePlans, isLoading }] = useLazyGetFeesPlanQuery();
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedAcademicYear, setSelectedAcademicYear] = useState("2023-2024")
    const [DialogForFeesPlan, setDialogForFeesPlan] = useState<{ isOpen: boolean, paln_id: number | null, type: 'create' | 'update' }>({
        isOpen: false,
        paln_id: 0,
        type: 'create'
    })
    const [FeePlansDetail, setFeePlansDetail] = useState<{ FeesPlan: FeesPlan[], page: PageMeta } | null>(null)


    const handleDelete = (feePlan_id: number) => {
        // setFeePlans(feePlans.filter((feePlan) => feePlan.id !== id))
    }

    const handleEdit = (feePlan_id: number) => {
        setDialogForFeesPlan({
            isOpen: true,
            paln_id: feePlan_id,
            type: 'update'
        })
    }

    const handleView = (feePlan_id: number) => {
        // Similar to edit, but we'd fetch the complete data for viewing
    }

    const handlePageChange = (page: number) => {
        getFeesPlan({ page })
    }

    useEffect(() => {
        if (!FeePlansDetail)
            getFeesPlan({ page: 1 });
    }, [])

    useEffect(() => {
        if (FetchedFeePlans) {
            setFeePlansDetail({
                FeesPlan: FetchedFeePlans.data,
                page: FetchedFeePlans.meta
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
        else {
            // fetch academic division
        }
    }, [])

    return (
        <>
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{t("fee_plan_management")}</h1>
                    <Button onClick={() => setDialogForFeesPlan({ isOpen: true, paln_id: null, type: 'create' })}>
                        <Plus className="mr-2 h-4 w-4" /> {t("add_fee_plan")}
                    </Button>
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
                                        <TableHead>{t("plan_name")}</TableHead>
                                        <TableHead>{t("class")}</TableHead>
                                        <TableHead>{t("academic_year")}</TableHead>
                                        <TableHead>{t("total_amount")}</TableHead>
                                        {/* <TableHead>Installments</TableHead> */}
                                        <TableHead>{t("status")}</TableHead>
                                        <TableHead>{t("actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {FeePlansDetail && FeePlansDetail.FeesPlan.map((feePlan) => (
                                        <TableRow key={feePlan.id}>
                                            <TableCell className="font-medium">{feePlan.name}</TableCell>
                                            <TableCell>{feePlan.class_id}</TableCell>
                                            <TableCell>{feePlan.academic_year_id}</TableCell>
                                            <TableCell>₹{feePlan.total_amount.toLocaleString()}</TableCell>
                                            {/* <TableCell>{feePlan.installments}</TableCell> */}
                                            <TableCell>
                                                <Badge variant={feePlan.status === 'Active' ? "default" : "destructive"}>
                                                    {feePlan.status === 'Active' ? "Active" : "Inactive"}
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
                                                    <Button variant="outline" size="icon" onClick={() => handleDelete(feePlan.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
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
                        type: 'create'
                    })
                }}
            >
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{DialogForFeesPlan.type === 'update' ? t("edit_fee_plan") : t("create_new_fee_plan")}</DialogTitle>
                    </DialogHeader>
                    <div className="h-full">
                        <AddFeePlanForm
                            type={DialogForFeesPlan.type}
                            plan_id={DialogForFeesPlan.paln_id}
                            onCancel={() => {
                                setDialogForFeesPlan({
                                    isOpen: false,
                                    paln_id: null,
                                    type: 'create',
                                })
                            }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

