"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { AddFeeTypeForm } from "./AddFeeTypeForm"
import { AddFeeTypeForm } from "./FeeType/AddFeeTypeForm"

interface FeeType {
    id: string
    name: string
    type: string
    priority: number
    concessionApplicable: boolean
    allowPartialAmount: boolean
    viewInFeeDetails: boolean
    parentCanPayOnline: boolean
    studentSpecificAmount: boolean
    inventoryFee: boolean
    mandatoryForAll: boolean
    refundable: boolean
    refundableWithInterest: boolean
    securityDeposit: boolean
}

const mockFeeTypes: FeeType[] = [
    {
        id: "1",
        name: "Activity Fee",
        type: "-",
        priority: 2,
        concessionApplicable: true,
        allowPartialAmount: true,
        viewInFeeDetails: true,
        parentCanPayOnline: true,
        studentSpecificAmount: false,
        inventoryFee: false,
        mandatoryForAll: false,
        refundable: false,
        refundableWithInterest: false,
        securityDeposit: false,
    },
    {
        id: "2",
        name: "TUITION FEE",
        type: "Tuition Fee",
        priority: 1,
        concessionApplicable: true,
        allowPartialAmount: true,
        viewInFeeDetails: true,
        parentCanPayOnline: true,
        studentSpecificAmount: false,
        inventoryFee: false,
        mandatoryForAll: true,
        refundable: false,
        refundableWithInterest: false,
        securityDeposit: false,
    },
]

export const FeeTypeSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState("fee-types")
    const [selectedFeeCategory, setSelectedFeeCategory] = useState("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    const feeCategories = [
        { id: "all", name: "All Feetypes" },
        { id: "tuition", name: "Tuition Fee" },
        { id: "transport", name: "Transport Fee" },
        { id: "lunch", name: "Lunch Fee" },
        { id: "hostel", name: "Hostel Fee" },
        { id: "idcard", name: "ID Card Fee" },
        { id: "store", name: "School Store Fee" },
        { id: "activity", name: "Activity Based fees" },
    ]

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Manage Fee Types</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>+ Create New Fee Type</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Fee Type</DialogTitle>
                        </DialogHeader>
                        {/* <AddFeeTypeForm
                            onSubmit={() => setIsAddDialogOpen(false)}
                            initialData={null}
                            onCancel={() => setIsAddDialogOpen(false)}
                        /> */}
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex flex-wrap gap-2">
                    <TabsTrigger value="fee-types">Fee Types</TabsTrigger>
                    <TabsTrigger value="misc-fee-types">Misc Fee Types</TabsTrigger>
                    <TabsTrigger value="other-fee-collection">Other Fee Collection Types</TabsTrigger>
                    <TabsTrigger value="inventory-fee-types">Inventory Fee Types</TabsTrigger>
                    <TabsTrigger value="fee-heads">Fee Heads To Fee Type</TabsTrigger>
                    <TabsTrigger value="monthly-based">Monthly Based fees</TabsTrigger>
                </TabsList>

                <div className="mt-4 flex flex-wrap gap-2">
                    {feeCategories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedFeeCategory === category.id ? "default" : "outline"}
                            onClick={() => setSelectedFeeCategory(category.id)}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                <TabsContent value="fee-types" className="mt-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fee Type Name</TableHead>
                                    <TableHead>Type Of Fee</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Concession Applicable?</TableHead>
                                    <TableHead>Allow Partial Amount?</TableHead>
                                    <TableHead>View in Fee Details?</TableHead>
                                    <TableHead>Parent Can Pay Online?</TableHead>
                                    <TableHead>Student Specific Amount?</TableHead>
                                    <TableHead>Inventory Fee?</TableHead>
                                    <TableHead>Mandatory for All?</TableHead>
                                    <TableHead>Refundable?</TableHead>
                                    <TableHead>Refundable with Interest?</TableHead>
                                    <TableHead>Security Deposit?</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockFeeTypes.map((feeType) => (
                                    <TableRow key={feeType.id}>
                                        <TableCell>{feeType.name}</TableCell>
                                        <TableCell>{feeType.type}</TableCell>
                                        <TableCell>{feeType.priority}</TableCell>
                                        <TableCell>{feeType.concessionApplicable ? "Yes" : "No"}</TableCell>
                                        <TableCell>{feeType.allowPartialAmount ? "Yes" : "No"}</TableCell>
                                        <TableCell>{feeType.viewInFeeDetails ? "Yes" : "No"}</TableCell>
                                        <TableCell>{feeType.parentCanPayOnline ? "Yes" : "No"}</TableCell>
                                        <TableCell>{feeType.studentSpecificAmount ? "Yes" : "No"}</TableCell>
                                        <TableCell>{feeType.inventoryFee ? "Yes" : "No"}</TableCell>
                                        <TableCell>{feeType.mandatoryForAll ? "Yes" : "No"}</TableCell>
                                        <TableCell>{feeType.refundable ? "Yes" : "No"}</TableCell>
                                        <TableCell>{feeType.refundableWithInterest ? "Yes" : "No"}</TableCell>
                                        <TableCell>{feeType.securityDeposit ? "Yes" : "No"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

