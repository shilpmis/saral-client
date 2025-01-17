'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Trash2 } from 'lucide-react'

interface ClassData {
  id: number;
  name: string;
  divisions: string[];
}

const AcademicSettings: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>(
    Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Class ${i + 1}`, divisions: ['A'] }))
  )
  const [selectedClasses, setSelectedClasses] = useState<number[]>([])

  const handleClassToggle = (classId: number) => {
    setSelectedClasses(prev => 
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    )
  }

  const handleAddDivision = (classId: number) => {
    setClasses(prevClasses => 
      prevClasses.map(cls => {
        if (cls.id === classId) {
          const lastDivision = cls.divisions[cls.divisions.length - 1]
          const newDivision = String.fromCharCode(lastDivision.charCodeAt(0) + 1)
          return { ...cls, divisions: [...cls.divisions, newDivision] }
        }
        return cls
      })
    )
  }

  const handleRemoveDivision = (classId: number, division: string) => {
    setClasses(prevClasses => 
      prevClasses.map(cls => {
        if (cls.id === classId) {
          return { ...cls, divisions: cls.divisions.filter(div => div !== division) }
        }
        return cls
      })
    )
  }

  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Academic Settings</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`class-${cls.id}`} 
                  checked={selectedClasses.includes(cls.id)}
                  onCheckedChange={() => handleClassToggle(cls.id)}
                />
                <label
                  htmlFor={`class-${cls.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {cls.name}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Classes and Divisions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Divisions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.filter(cls => selectedClasses.includes(cls.id)).map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>
                    {cls.divisions.join(', ')}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddDivision(cls.id)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Division
                      </Button>
                      {cls.divisions.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveDivision(cls.id, cls.divisions[cls.divisions.length - 1])}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Last
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default AcademicSettings

