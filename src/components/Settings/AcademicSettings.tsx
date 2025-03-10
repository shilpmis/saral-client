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
import { useTranslation } from "@/redux/hooks/useTranslation"


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


const defaultStandards = [
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
]

export default function AcademicSettings() {

  const currentYear = new Date().getFullYear()

  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser)
  const { isLoading, isSuccess, data, error } = useGetAcademicClassesQuery(user!.school_id)

  const [selectedClasses, setSelectedClasses] = useState<{ id: number, class: number }[] | null>(null)
  const [academicClasses, setAcademicClasses] = useState<AcademicClasses[]>([])

  const [editingClass, setEditingClass] = useState<ClassData | null>(null)
  const [newDivision, setNewDivision] = useState<{ class: number; aliases: string, division: string } | null>(null)
  const [editingDivision, setEditingDivision] = useState<{ classId: number; division: Division } | null>(null)

  const [isEditDivisionDialogOpen, setIsEditDivisionDialogOpen] = useState(false)
  const [isConfirmSaveDialogOpen, setIsConfirmSaveDialogOpen] = useState(false)
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false)
  const [isDivisionForDialogOpen, setIsDivisionForDialogOpen] = useState(false)
  const {t} = useTranslation()


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
    
    const checkedClasses = selectedClasses ? selectedClasses.map((c) => c.class) : [];

    return new Set([...checkedAcademicClasses, ...checkedClasses])
  }, [academicClasses, selectedClasses])


  const handleClassToggle = useCallback((clasObj: { id: number; class: number }) => {
    setSelectedClasses((prevSelectedClasses) => {
      if (!prevSelectedClasses) {
        return [clasObj];
      }
  
      const isAlreadySelected = prevSelectedClasses.some((c) => c.id === clasObj.id);
      
      if (isAlreadySelected) {
        const filtered = prevSelectedClasses.filter((c) => c.id !== clasObj.id);
        return filtered.length === 0 ? null : filtered;
      }
  
      return [...prevSelectedClasses, clasObj];
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

  // const handleEditDivision = (classId: number, division: string, aliases: string , id: number) => {
  const handleEditDivision = (division: Division) => {
    formForDivsion.reset({
      class: parseInt(division.class),  // need to change class type for creation of class ,(API demands number format for create class)
      division: division.division,
      aliases: division.aliases || "",
      formType: "edit",
      class_id: division.id
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
    if (selectedClasses && selectedClasses.length > 0) {
      let payload: Omit<Class, 'id' | 'school_id'>[] = [];

      payload = selectedClasses.map((clas) => {
        return {
          class: clas.class,
          division: 'A',
          aliases: null
        };
      });

      try {
        const added_class : any = await dispatch(createClasses(payload));

        if (added_class.meta.requestStatus === 'fulfilled') {
          console.log("Check this here" , added_class)
          // Update the academicClasses state with the new classes
          const newClasses = payload.map((clas, index) => ({
            class: clas.class,
            divisions: [{
              id: added_class.payload[0].id , // Assuming this is a temporary ID
              school_id: user!.school_id, // Add the school_id if required
              class: clas.class.toString(), // Ensure this matches the Division type
              division: clas.division,
              aliases: clas.aliases
            }]
          }));

          setAcademicClasses((prevClasses): any => [...prevClasses, ...newClasses]);

          // Clear the selected classes
          setSelectedClasses([]);

          toast({
            title: "Classes Added",
            description: `New classes have been added successfully.`,
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to add classes. Please try again.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `An error occurred while adding classes. Please try again.`,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Classes Selected",
        description: `Please select at least one class to add.`,
        variant: "destructive",
      });
    }

    setIsConfirmSaveDialogOpen(false);
  };


  const confirmDivisionChanges = async () => {

    let payload = formForDivsion.getValues();

    if (payload.formType === "edit" && payload.class_id && payload.aliases) {

      try {
        // Edit division
        const edited_division = await dispatch(editDivision({
          class_id: payload.class_id,
          aliases: payload.aliases,
        })).unwrap();

        // Update the academicClasses state for the edited division
        setAcademicClasses((prevClasses) =>
          prevClasses.map((cls) => ({
            ...cls,
            divisions: cls.divisions.map((div) =>
              div.id === payload.class_id
                ? { ...div, aliases: payload.aliases || null } // Update the division's aliases
                : div
            ),
          }))
        );
        setIsDivisionForDialogOpen(false);
        setNewDivision(null);
        toast({
          title: "Division Updated",
          description: `Division has been updated successfully.`,
        });

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: `${error[0].message}`,
          // description: `Failed to update division. Please try again.`,
        });
      }
    } else {
      // Create new division
      try {
        const new_division = await dispatch(createDivision({
          class: payload.class,
          division: payload.division,
          aliases: payload.aliases || null,
        })).unwrap();
        setAcademicClasses((prevClasses): any =>
          prevClasses.map((cls) =>
            cls.class === payload.class
              ? {
                ...cls,
                divisions: [
                  ...cls.divisions,
                  {
                    id: new_division.id, // Use the ID returned from the API
                    school_id: user!.school_id,
                    class: payload.class.toString(),
                    division: payload.division,
                    aliases: payload.aliases || null,
                  },
                ],
              }
              : cls
          )
        );

        setIsDivisionForDialogOpen(false);
        setNewDivision(null);

        toast({
          title: "Division Added",
          description: `New division has been added successfully.`,
        });

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: `${error[0].message}`,
        });
      }
    }
  };

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
        <SaralCard title={t("academic_year_management")} description={t("current_academic_year_information")}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">2024-2025</h3>
            <Badge variant="secondary" className="text-lg">
            {t("current_session")}
            </Badge>
          </div>
        </SaralCard>

        <SaralCard title={t("class_management")} description={t("manage_classes_for_the_current_academic_year")}>
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
              <Button onClick={handleSaveButtonForSelectedClasses} disabled={!selectedClasses}>
                <Save className="mr-2 h-4 w-4" />
                {t("save")}
              </Button>
            </div>
          </div>
        </SaralCard>

        {academicClasses.length > 0 && (
          <SaralCard title={t("active_classes_&_divisions")} description={t("manage_divisions_and_aliases_for_selected_classes")}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("class")}</TableHead>
                  <TableHead>{t("division")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
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
                                onClick={() => handleEditDivision(division)}
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
                          {t("add_division")} 
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
              <DialogTitle>{t("edit_class")}</DialogTitle>
              <DialogDescription>{t("modify_the_class_name_or_remove_it")}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="className" className="text-right">
                {t("class_name")}
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
                {t("cancel")}
              </Button>
              <Button onClick={handleSaveEditClass}>{t("save_changes")}</Button>
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
                  {t("division_alias")}
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
              <DialogTitle>{t("confirm_changes")}</DialogTitle>
              <DialogDescription>{t("are_you_sure_you_want_to_save_these_changes_to_your_class_selection?")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmSaveDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={confirmSaveSelectionOfClasses}>{t("confirm")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDivisionForDialogOpen} onOpenChange={setIsDivisionForDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formForDivsion.getValues('formType') === 'create' ? "Add" : "Update"} Division</DialogTitle>
              <DialogDescription>{t("confirm_or_modify_the_division_alias.")}</DialogDescription>
            </DialogHeader>
            {<div className="grid gap-4 py-4">

              <Form {...formForDivsion}>
                <form onSubmit={formForDivsion.handleSubmit(confirmDivisionChanges)} className="space-y-6">
                  <FormField
                    control={formForDivsion.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("class")}</FormLabel>
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
                        <FormLabel>{t("division")}</FormLabel>
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
                        <FormLabel>{t("aliases")}</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter aliases name for class" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDivisionForDialogOpen(false)}>
                    {t("cancel")}
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

