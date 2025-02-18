/**
 * 
 * TODO : CRUD operation for all component is working , 
 * Need to update component accordingly by updating centeral state .   
 */


import { useState, useCallback, useEffect, useMemo } from "react"
import type { AcademicClasses, ClassData, Division } from "@/types/academic"

import { Edit, PlusCircle, Trash2, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { SaralCard } from "../ui/common/SaralCard"
import { Badge } from "../ui/badge"
import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import { createClasses, createDivision, editDivision, useGetAcademicClassesQuery } from "@/services/AcademicService"
import { selectCurrentUser } from "@/redux/slices/authSlice"
import { Class } from "@/types/class"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"


const formSchemaForDivision = z.object({
  class_id: z.number({
    message: "Please enter a valid Class Id for division.",
  }).nullable(),
  class: z.number({
    message: "Please enter a valid Class for division.",
  }),
  division: z.string().min(1, {
    message: "Please enter valid division",
  }),
  aliases: z
    .string()
    .min(3, 'Alias should be at least 3 characters')
    .max(15, 'Alias should not be more than 15 characters')
    .regex(/^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/, {
      message: 'Alias should contain only letters, numbers, and single spaces',
    }).optional(),
  formType: z.enum(["create", "edit"])
})

export default function AcademicSettings() {

  const currentYear = new Date().getFullYear()

  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser)
  const { isLoading, isSuccess, data, error } = useGetAcademicClassesQuery(user!.schoolId)

  const [defaultStandards, setDefaultStandards] = useState<{ id: number, class: number }[]>([
    { id: 1, class: 1 },
    { id: 2, class: 2 },
    { id: 3, class: 3 },
    { id: 4, class: 4 },
    { id: 5, class: 5 },
    { id: 6, class: 6 },
    { id: 7, class: 7 },
    { id: 8, class: 8 },
    { id: 9, class: 9 },
    { id: 10, class: 10 },
    { id: 11, class: 11 },
    { id: 12, class: 12 },
  ])

  const [selectedClasses, setSelectedClasses] = useState<{ id: number, class: number }[]>([])
  const [academicClasses, setAcademicClasses] = useState<AcademicClasses[]>([])

  const [editingClass, setEditingClass] = useState<ClassData | null>(null)
  const [newDivision, setNewDivision] = useState<{ class: number; aliases: string, division: string } | null>(null)
  const [editingDivision, setEditingDivision] = useState<{ classId: number; division: Division } | null>(null)

  const [isEditDivisionDialogOpen, setIsEditDivisionDialogOpen] = useState(false)
  const [isConfirmSaveDialogOpen, setIsConfirmSaveDialogOpen] = useState(false)
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false)
  const [isDivisionForDialogOpen, setIsDivisionForDialogOpen] = useState(false)


  const formForDivsion = useForm<z.infer<typeof formSchemaForDivision>>({
    resolver: zodResolver(formSchemaForDivision),
    defaultValues: {
      class_id: null,
      class: newDivision?.class,
      division: newDivision?.division,
      aliases: newDivision?.aliases,
      formType: "create"
    },
  })

  const disabledClasses = useMemo(() => {
    return academicClasses.filter((c) => c.divisions.length > 0).map((c) => c.class)
  }, [academicClasses])

  const checkedClasses = useMemo(() => {

    const checkedAcademicClasses = academicClasses.filter((c) => c.divisions.length > 0).map((c) => c.class);

    const checkedClasses = selectedClasses.map((c) => c.class);

    return new Set([...checkedAcademicClasses, ...checkedClasses])
  }, [academicClasses, selectedClasses])


  const handleClassToggle = useCallback((clasObj: { id: number; class: number }) => {
    setSelectedClasses((prevSelectedClasses) => {
      const isAlreadySelected = prevSelectedClasses.some((c) => c.id === clasObj.id);

      if (isAlreadySelected) {
        return prevSelectedClasses.filter((c) => c.id !== clasObj.id); // Remove if already selected
      } else {
        return [...prevSelectedClasses, clasObj]; // Add if not selected
      }
    });
  }, []);

  const handleAddDivision = (classId: number) => {
    const cls = academicClasses.find((c) => c.class === classId)
    if (cls) {
      const lastDivision = cls.divisions[cls.divisions.length - 1]
      const nextLetter = String.fromCharCode(lastDivision.division.charCodeAt(0) + 1)
      setNewDivision({ division: nextLetter, aliases: `${nextLetter}`, class: cls.class });
      formForDivsion.reset({
        class: cls.class,
        aliases: nextLetter,
        division: nextLetter,
        formType: "create"
      });
    }
    // setAddingDivisionToClassId(classId)
    setIsDivisionForDialogOpen(true)
  }

  const handleEditDivision = (classId: number, division: string, aliases: string, id: number) => {
    formForDivsion.reset({
      class: classId,
      division: division,
      aliases: aliases,
      formType: "edit",
      class_id: id
    })
    setIsDivisionForDialogOpen(true);
  }

  const handleRemoveDivision = (classId: number, divisionName: string) => {
    // setSavedClasses((prevClasses) =>
    //   prevClasses.map((cls) => {
    //     if (cls.id === classId) {
    //       return { ...cls, divisions: cls.divisions.filter((d) => d.name !== divisionName) }
    //     }
    //     return cls
    //   }),
    // )
    // toast({
    //   title: "Division Removed",
    //   description: `Division has been removed successfully.`,
    // })
  }

  const handleEditClass = (cls: ClassData) => {
    setEditingClass(cls)
    setIsEditClassDialogOpen(true)
  }

  const handleSaveEditClass = () => {
    // if (editingClass) {
    //   setSavedClasses((prevClasses) => prevClasses.map((cls) => (cls.id === editingClass.id ? editingClass : cls)))
    //   setIsEditClassDialogOpen(false)
    //   setEditingClass(null)
    //   toast({
    //     title: "Class Updated",
    //     description: `${editingClass.name} has been updated successfully.`,
    //   })
    // }
  }

  const handleSaveEditDivision = () => {
    // if (editingDivision) {
    //   setSavedClasses((prevClasses) =>
    //     prevClasses.map((cls) =>
    //       cls.id === editingDivision.classId
    //         ? {
    //           ...cls,
    //           divisions: cls.divisions.map((div) =>
    //             div.name === editingDivision.division.name ? editingDivision.division : div,
    //           ),
    //         }
    //         : cls,
    //     ),
    //   )
    //   setIsEditDivisionDialogOpen(false)
    //   setEditingDivision(null)
    //   toast({
    //     title: "Division Updated",
    //     description: `Division has been updated successfully.`,
    //   })
    // }
  }

  const handleSaveButtonForSelectedClasses = () => {
    setSelectedClasses(selectedClasses);
    setIsConfirmSaveDialogOpen(true);
  }

  const confirmSaveSelectionOfClasses = async () => {

    if (selectedClasses.length > 0) {

      let payload: Omit<Class, 'id' | 'school_id'>[] = [];

      payload = selectedClasses.map((clas) => {
        return {
          class: clas.class,
          division: 'A',
          aliases: null
        }
      })

      const added_class = await dispatch(createClasses(payload));
      /**
       * Reloading page here . 
       * 
       * adding new class can be create many dependeancies to manage ,  
       * Reload page may reduce code , and set proper state accprdingly  
       */
      window.location.reload()
      /**
       * TODO : Handle failed api calls, by adding toast and other assentials    
       */
      if (added_class.meta.requestStatus === 'rejected') {
        alert("Check Console");
      }
    } else {
      /***
       * TODO : Add a toast here which shows please seleact a valid class in order to create one !
       */
    }
    setIsConfirmSaveDialogOpen(false);

  }


  const confirmDivisionChanges = async () => {

    let payload = formForDivsion.getValues();

    if (payload.formType === "edit" && payload.class_id) {

      let edited_division = await dispatch(editDivision({
        class_id: payload.class_id,
        aliases: payload.aliases || null
      }));

      if (edited_division.meta.requestStatus === 'rejected') {
        toast({
          variant : "destructive",
          title: "Division did not Edited !",
          // description: `${new_division.payload ? new_division.payload : " "}`
        })        
        return;
      } else {
        toast({
          title: " Division Edited Successfully !",
          // description: `${new_division.payload ? new_division.payload : " "}`
        })
        setIsDivisionForDialogOpen(false)
        setNewDivision(null)
      }

    } else {
      const new_division = await dispatch(createDivision({
        class: payload.class,
        division: payload.division,
        aliases: payload.aliases || null
      }));
      if (new_division.meta.requestStatus === 'rejected') {
        toast({
          variant : "destructive",
          title: "Creatioin of Division failed !",
          description: `${new_division.payload ? new_division.payload : " "}`
        })
        return;
      } else {
        toast({
          title: " Division created Successfully !",
          // description: `${new_division.payload ? new_division.payload : " "}`
        })
        setIsDivisionForDialogOpen(false)
        setNewDivision(null)
      }
    }

  }

  useEffect(() => {
    if (data && data.length > 0) {
      setAcademicClasses(data)
    }
  }, [data])

  return (
    <>
      {
        isLoading &&
        <div>
          Loading for classes ......
        </div>
      }
      {!isLoading && <div className="space-y-6 overflow-y-auto p-4">
        <SaralCard title="Academic Year Management" description="Current academic year information">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">2024-2025</h3>
            <Badge variant="secondary" className="text-lg">
              Current Session
            </Badge>
          </div>
        </SaralCard>

        <SaralCard title="Class Management" description="Manage classes for the current academic year">
          <div className="grid gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {defaultStandards.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between space-x-2 rounded-lg border p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`class-${cls.id}`}
                      disabled={disabledClasses.includes(cls.class)}
                      checked={checkedClasses.has(cls.class)}
                      onCheckedChange={() => handleClassToggle(cls)}
                    />
                    <label
                      htmlFor={`class-${cls.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      class {cls.class}
                    </label>
                  </div>
                  {/* <Button variant="ghost" size="sm" onClick={() => handleEditClass(cls)}>
                  <Edit className="h-4 w-4" />
                </Button>s */}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveButtonForSelectedClasses} disabled={selectedClasses.length === 0}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </SaralCard>

        {academicClasses.length > 0 && (
          <SaralCard title="Active Classes & Divisions" description="Manage divisions and aliases for selected classes">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Divisions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicClasses.map((std, index) => (
                  <>
                    {std.divisions.length > 0 && (<TableRow key={index}>
                      <TableCell className="font-medium">{std.class}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {std.divisions.map((division) => (
                            <Badge key={division.id} variant="secondary" className="flex items-center gap-1 p-3">
                              <p>({division.class}- {division.division})</p> 
                              <p>{division.aliases}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => handleEditDivision(std.class, division.division, division.aliases, division.id)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              {/* <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0"
                              // onClick={() => handleRemoveDivision(std.class, division.name)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button> */}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => handleAddDivision(std.class)}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Division
                        </Button>
                      </TableCell>
                    </TableRow>)}
                  </>
                ))}
              </TableBody>
            </Table>
          </SaralCard>
        )}

        <Dialog open={isEditClassDialogOpen} onOpenChange={setIsEditClassDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>Modify the class name or remove it.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="className" className="text-right">
                  Class Name
                </Label>
                <Input
                  id="className"
                  value={editingClass?.name || ""}
                  onChange={(e) => setEditingClass((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditClassDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditClass}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDivisionDialogOpen} onOpenChange={setIsEditDivisionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Division</DialogTitle>
              <DialogDescription>Modify the division alias.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="divisionName" className="text-right">
                  Division Name
                </Label>
                <Input id="divisionName" value={editingDivision?.division.name || ""} disabled className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="divisionAlias" className="text-right">
                  Division Alias
                </Label>
                <Input
                  id="divisionAlias"
                  value={editingDivision?.division.alias || ""}
                  onChange={(e) =>
                    setEditingDivision((prev) =>
                      prev ? { ...prev, division: { ...prev.division, alias: e.target.value } } : null,
                    )
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDivisionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditDivision}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isConfirmSaveDialogOpen} onOpenChange={setIsConfirmSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Changes</DialogTitle>
              <DialogDescription>Are you sure you want to save these changes to your class selection?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmSaveSelectionOfClasses}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDivisionForDialogOpen} onOpenChange={setIsDivisionForDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formForDivsion.getValues('formType') === 'create' ? "Add" : "Update"} Division</DialogTitle>
              <DialogDescription>Confirm or modify the division alias.</DialogDescription>
            </DialogHeader>
            {<div className="grid gap-4 py-4">

              <Form {...formForDivsion}>
                <form onSubmit={formForDivsion.handleSubmit(confirmDivisionChanges)} className="space-y-6">
                  <FormField
                    control={formForDivsion.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formForDivsion.control}
                    name="division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Division</FormLabel>
                        <FormControl>
                          <Input type="text" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formForDivsion.control}
                    name="aliases"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aliases</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter aliases name for class" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDivisionForDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={confirmDivisionChanges}>
                      {formForDivsion.getValues('formType') === 'create' ? "Add" : "Update"} Division
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>}

          </DialogContent>
        </Dialog>
      </div>}
    </>
  )
}

