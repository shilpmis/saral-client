import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Search } from "lucide-react"
import { AddFeeTypeForm } from "./AddFeeTypeForm"
import { useCreateFeesTypeMutation, useLazyGetFeesTypeQuery, useUpdateFeesTypeMutation } from "@/services/feesService"
import { FeesType } from "@/types/fees"
import { PageMeta } from "@/types/global"
import { SaralPagination } from "@/components/ui/common/SaralPagination"
import { feeTypeSchema } from "@/utils/fees.validation"
import { z } from "zod"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"

export const FeeTypeManagement: React.FC = () => {

    const [getFeesType, { data: FeesType, isLoading: loagingFeesType }] = useLazyGetFeesTypeQuery();
    const [createFeesType, { isLoading: isCreateFeesTypeLoading }] = useCreateFeesTypeMutation();
    const [updateFeesType, { isLoading: isUpdateFeesTypeLoading }] = useUpdateFeesTypeMutation();
    const {t} = useTranslation()

    const [searchTerm, setSearchTerm] = useState("")
    const [DialogForFeeType, setDialogForFeeType] = useState<{ isOpen: boolean, type: 'create' | 'edit', data: FeesType | null }>({
        isOpen: false,
        data: null,
        type: 'create'
    })

    const [DataForFeesType, setDataForFeesType] = useState<{ type: FeesType[], page: PageMeta } | null>(null)


    /**
     * Filter is not working
     */
    const filteredFeeTypes = DataForFeesType && DataForFeesType.type.filter(
        (feeType) =>
            feeType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feeType.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleDelete = (id: number) => {
        // setFeeTypes(feeTypes.filter((feeType) => feeType.id !== id))
        toast({
            variant: "destructive",
            title: "Can not delete fees plan for now ."
        })
    }

    const handleSubmit = async (values: z.infer<typeof feeTypeSchema>) => {
        console.log(values)
        if (DialogForFeeType.type === 'edit') {
            const fees_type = await updateFeesType({
                id: DialogForFeeType.data!.id,
                data: {
                    name: values.name,
                    description: values.description ? values.description : "",
                    status: values.status,
                    academic_year_id: 1,
                }
            })
            if (fees_type.data) {
                toast({
                    variant: "default",
                    title: "Fee Type Updated Successfully"
                })
                getFeesType({ page: 1 })
            } else {
                console.log("Error updating Fee Type", fees_type.error)
                toast({
                    variant: "destructive",
                    title: "Error updating Fee Type"
                })
            }
        } else if (DialogForFeeType.type === 'create') {
            const fees_type = await createFeesType({
                data: {
                    name: values.name,
                    description: values.description ? values.description : "",
                    status: values.status,
                    academic_year_id: 1
                }
            })
            if (fees_type.data) {
                getFeesType({ page: 1 })
                toast({
                    variant: "default",
                    title: "Fee Type Updated Successfully"
                })
            } else {
                console.log("Error creating Fee Type", fees_type.error)
                toast({
                    variant: "destructive",
                    title: "Error creating Fee Type"
                })

            }
        }
        setDialogForFeeType({ isOpen: false, data: null, type: "create" })
    }

    const handlePageChange = (page: number) => {
        getFeesType({ page })
    }

    useEffect(() => {
        if (!DataForFeesType)
            getFeesType({ page: 1 });
    }, [])

    useEffect(() => {
        if (FeesType && FeesType.data) {
            setDataForFeesType({
                type: FeesType.data,
                page: FeesType.meta
            })
        }
    }, [FeesType])


    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t("fee_type_management")}</h1>
                <Dialog
                    open={DialogForFeeType.isOpen}
                    onOpenChange={(open) => {
                        // setDialogForFeeType(open)
                        setDialogForFeeType({ isOpen: true, data: null, type: 'create' })
                        if (!open) setDialogForFeeType({ isOpen: false, data: null, type: 'create' })
                    }}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> {t("add_fee_type")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{DialogForFeeType.type === 'edit' ? t("edit_fee_type") : t("add_new_fee_type")}</DialogTitle>
                        </DialogHeader>
                        <AddFeeTypeForm
                            initialData={DialogForFeeType.data}
                            type={DialogForFeeType.type}
                            onCancel={() => setDialogForFeeType({ isOpen: false, data: null, type: "create" })}
                            onSubmit={handleSubmit}
                            isLoading={isCreateFeesTypeLoading || isUpdateFeesTypeLoading}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t("fee_types")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center mb-4">
                        <div className="hidden relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search fee types..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {DataForFeesType && (<div className="rounded-md border">
                        {DataForFeesType.type.length > 0 && (<Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("name")}</TableHead>
                                    <TableHead>{t("description")}</TableHead>
                                    {/* <TableHead>Priority</TableHead> */}
                                    {/* <TableHead>Concession Applicable</TableHead> */}
                                    <TableHead>{t("status")}</TableHead>
                                    <TableHead>{t("actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {FeesType?.data.map((feeType) => (
                                    <TableRow key={feeType.id}>
                                        <TableCell className="font-medium">{feeType.name}</TableCell>
                                        <TableCell>{feeType.description}</TableCell>
                                        {/* <TableCell>{feeType.}</TableCell> */}
                                        {/* <TableCell>{feeType.is_concession_applicable ? "Yes" : "No"}</TableCell> */}
                                        <TableCell>
                                            <Badge variant={feeType.status === 'Active' ? "default" : "destructive"}>
                                                {feeType.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="icon" onClick={() => setDialogForFeeType({ isOpen: true, data: feeType, type: 'edit' })}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => handleDelete(feeType.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>)}
                        {DataForFeesType.type.length === 0 && <div className="text-center py-4 text-gray-500">{t("no_records_found")}</div>}
                    </div>)}
                    <div className="mt-4">
                        {DataForFeesType && DataForFeesType.type.length > 0 && <SaralPagination
                            currentPage={DataForFeesType.page.current_page}
                            totalPages={DataForFeesType.page.last_page}
                            onPageChange={handlePageChange}
                        />}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

