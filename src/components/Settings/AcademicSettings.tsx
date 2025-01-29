import React from 'react'
import { SaralCard } from '../ui/common/SaralCard'
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, GraduationCap, Save } from "lucide-react"

interface ClassData {
    id: number
    name: string
    divisions: string[]
    isSelected: boolean
}

export default function AcademicSettings() {

    const [classes, setClasses] = useState<ClassData[]>(
        Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            name: `Class ${i + 1}`,
            divisions: ["A"],
            isSelected: false,
        })),
    )

    const handleClassToggle = (id: number) => {
        setClasses(classes.map((cls) => (cls.id === id ? { ...cls, isSelected: !cls.isSelected } : cls)))
    }

    const handleAddDivision = (id: number) => {
        setClasses(
            classes.map((cls) => {
                if (cls.id === id) {
                    const lastDivision = cls.divisions[cls.divisions.length - 1]
                    const newDivision = String.fromCharCode(lastDivision.charCodeAt(0) + 1)
                    return { ...cls, divisions: [...cls.divisions, newDivision] }
                }
                return cls
            }),
        )
    }

    const selectedClasses = classes.filter((cls) => cls.isSelected)

    return (
        <>
            <SaralCard title="Academic Settings" description="Manage classes and divisions for your school">
                {/* <Card> */}
                {/* <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Class Selection
                    </CardTitle>
                    <CardDescription>Select the classes that are active in your school</CardDescription>
                </CardHeader> */}
                {/* <CardContent> */}
                <div className="grid gap-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {classes.map((cls) => (
                            <div
                                key={cls.id}
                                className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent transition-colors"
                            >
                                <Checkbox
                                    id={`class-${cls.id}`}
                                    checked={cls.isSelected}
                                    onCheckedChange={() => handleClassToggle(cls.id)}
                                />
                                <label
                                    htmlFor={`class-${cls.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {cls.name}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <Button>
                            <Save className="mr-2 h-4 w-4" />
                            Save Selection
                        </Button>
                    </div>
                </div>
                {/* </CardContent> */}
                {/* </Card> */}

            </SaralCard>
            <SaralCard description='' title=''>
                {selectedClasses.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Classes & Divisions</CardTitle>
                            <CardDescription>Manage divisions for selected classes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Divisions</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedClasses.map((cls) => (
                                        <TableRow key={cls.id}>
                                            <TableCell className="font-medium">{cls.name}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {cls.divisions.map((division: any) => (
                                                        <Badge key={division} variant="secondary">
                                                            Division {division}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" onClick={() => handleAddDivision(cls.id)}>
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Add Division
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </SaralCard>
        </>
    )
}
