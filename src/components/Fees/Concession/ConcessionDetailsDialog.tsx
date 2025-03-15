import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Printer, Download, Tag, Link } from "lucide-react"
import { useLazyGetConcessionsInDetailQuery } from "@/services/feesService"
import { toast } from "@/hooks/use-toast"
import { ConcessionDetailForPlan } from "@/types/fees"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { selectAllAcademicClasses } from "@/redux/slices/academicSlice"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectAuthState } from "@/redux/slices/authSlice"

interface ConcessionDetailsDialogProps {
    concessionId: number
}

export const ConcessionDetailsDialog: React.FC<ConcessionDetailsDialogProps> = ({ concessionId }) => {
    const [activeTab, setActiveTab] = useState("overview")
    const [getConcessionDetails, { data: concessionDetails, isLoading, isError }] = useLazyGetConcessionsInDetailQuery()
    const AcademicDivision = useAppSelector(selectAllAcademicClasses)
    const [getAcademicClasses] = useLazyGetAcademicClassesQuery()
    const authState = useAppSelector(selectAuthState)
    

    useEffect(() => {
        if (!AcademicDivision) {
            getAcademicClasses(authState.user!.school_id)
        }
    }, [])

    useEffect(() => {
        getConcessionDetails({ concession_id: concessionId })
            .unwrap()
            .catch((error) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load concession details. Please try again.",
                })
            })
    }, [concessionId, getConcessionDetails])

    // Format currency
    const formatCurrency = (amount: string | number) => {
        return `₹${Number(amount).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        })}`
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <Skeleton className="h-64" />
            </div>
        )
    }

    if (isError || !concessionDetails) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-500">Failed to load concession details. Please try again.</p>
                <Button onClick={() => getConcessionDetails({ concession_id: concessionId })} className="mt-4">
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{concessionDetails.concession.name}</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="applied-plans">Applied Plans</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center">
                                    <Tag className="mr-2 h-5 w-5" />
                                    Concession Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Category:</span>
                                    <span className="text-sm font-medium">{concessionDetails.concession.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Applicable To:</span>
                                    <span className="text-sm font-medium capitalize">{concessionDetails.concession.applicable_to}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    <Badge variant={concessionDetails.concession.status === "Active" ? "default" : "destructive"}>
                                        {concessionDetails.concession.status || "Active"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Academic Year:</span>
                                    <span className="text-sm font-medium">{concessionDetails.concession.academic_year_id}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center">
                                    <Link className="mr-2 h-5 w-5" />
                                    Application Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Applied Plans:</span>
                                    <span className="text-sm font-medium">{concessionDetails.applied_plans?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Fee Types:</span>
                                    <span className="text-sm font-medium">{concessionDetails.applied_fee_types?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Students:</span>
                                    <span className="text-sm font-medium">{concessionDetails.applied_students?.length || 0}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{concessionDetails.concession.description}</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="applied-plans">
                    <Card>
                        <CardHeader>
                            <CardTitle>Applied Fee Plans</CardTitle>
                            <CardDescription>Fee plans where this concession has been applied</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {concessionDetails.applied_plans && concessionDetails.applied_plans.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Plan Name</TableHead>
                                                <TableHead>Class</TableHead>
                                                <TableHead>Deduction Type</TableHead>
                                                <TableHead>Value</TableHead>
                                                <TableHead>Fee Type</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {concessionDetails.applied_plans.map((plan: ConcessionDetailForPlan, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{plan.fees_plan?.name || "N/A"}</TableCell>
                                                    <TableCell>
                                                        {AcademicDivision && AcademicDivision.find((division) => division.id == plan.fees_plan.class_id)?.aliases}
                                                        {!AcademicDivision && "Loading..."}
                                                    </TableCell>
                                                    <TableCell className="capitalize">{plan.deduction_type}</TableCell>
                                                    <TableCell>
                                                        {plan.deduction_type === "percentage"
                                                            ? `${plan.percentage}%`
                                                            : formatCurrency(plan.amount || 0)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {plan.fees_type_id ? plan.fees_plan.name || `Type #${plan.fees_type_id}` : "Entire Plan"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={plan.status === "Active" ? "default" : "destructive"}>
                                                            {plan.status || "Active"}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">This concession has not been applied to any fee plans yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

