"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import type { AcademicClasses, ClassData, Division } from "@/types/academic"
import { Edit, PlusCircle, Save, Calendar, Plus, AlertCircle, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { SaralCard } from "../../ui/common/SaralCard"
import { Badge } from "../../ui/badge"
import { Checkbox } from "../../ui/checkbox"
import { Button } from "../../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { useAppDispatch } from "@/redux/hooks/useAppDispatch"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import {
  createClasses,
  createDivision,
  editDivision,
  useGetAcademicClassesQuery,
  useGetAcademicSessionsQuery,
  useSetActiveSessionMutation,
} from "@/services/AcademicService"
import { selectCurrentUser } from "@/redux/slices/authSlice"
import type { Class } from "@/types/class"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AcademicSessionForm } from "./AcademicSessionForm"
import { AcademicSessionsList } from "./AcademicSessionList"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Define the form schema for division
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
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const currentAcademicSession = useAppSelector((state :any) => state.auth.currentActiveAcademicSession);
  const [activeTab, setActiveTab] = useState("sessions")

  // Fetch academic classes
  const {
    isLoading: isLoadingClasses,
    data: classesData,
    refetch: refetchClasses,
  } = useGetAcademicClassesQuery(user!.school_id)

  // Fetch academic sessions
  const {
    isLoading: isLoadingSessions,
    data: sessionsData,
    refetch: refetchSessions,
  } = useGetAcademicSessionsQuery(user!.school_id)

  // State for academic sessions
  const [activeSession, setActiveSession] = useState<any>(null)
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false)
  const [showNoActiveSessionAlert, setShowNoActiveSessionAlert] = useState(false)

  // State for classes and divisions
  const [selectedClasses, setSelectedClasses] = useState<{ id: number; class: number }[] | null>(null)
  const [academicClasses, setAcademicClasses] = useState<AcademicClasses[]>([])
  const [editingClass, setEditingClass] = useState<ClassData | null>(null)
  const [newDivision, setNewDivision] = useState<{ class: number; aliases: string; division: string } | null>(null)
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
      formType: "create" ,
    },
  })

  const [setActiveSessionMutation] = useSetActiveSessionMutation()

  // Format session name from dates
  const formatSessionName = (startDate: string, endDate: string) => {
    const startYear = new Date(startDate).getFullYear()
    const endYear = new Date(endDate).getFullYear()
    return `${startYear}-${endYear}`
  }

  const disabledClasses = useMemo(() => {
    return academicClasses.filter((c) => c.divisions.length > 0).map((c) => c.class)
  }, [academicClasses])

  const checkedClasses = useMemo(() => {
    const checkedAcademicClasses = academicClasses.filter((c) => c.divisions.length > 0).map((c) => c.class)
    const checkedClasses = selectedClasses ? selectedClasses.map((c) => c.class) : []
    return new Set([...checkedAcademicClasses, ...checkedClasses])
  }, [academicClasses, selectedClasses])

  const handleClassToggle = useCallback((clasObj: { id: number; class: number }) => {
    setSelectedClasses((prevSelectedClasses) => {
      if (!prevSelectedClasses) {
        return [clasObj]
      }

      const isAlreadySelected = prevSelectedClasses.some((c) => c.id === clasObj.id)

      if (isAlreadySelected) {
        const filtered = prevSelectedClasses.filter((c) => c.id !== clasObj.id)
        return filtered.length === 0 ? null : filtered
      }

      return [...prevSelectedClasses, clasObj]
    })
  }, [])

  const handleAddDivision = (classId: number) => {
    classId = Number.parseInt(classId.toString())
    const cls = academicClasses.find((c) => c.class === classId);
    console.log("classId", classId)
    console.log("cls", cls)
    if (cls) {
      const lastDivision = cls.divisions[cls.divisions.length - 1]
      const nextLetter = String.fromCharCode(lastDivision.division.charCodeAt(0) + 1)
      setNewDivision({ division: nextLetter, aliases: `${nextLetter}`, class: cls.class })
      formForDivsion.reset({
        class_id: null,
        class: cls.class,
        aliases: nextLetter,
        division: nextLetter,
        formType: "create",
      })
    }
    setIsDivisionForDialogOpen(true)
  }

  const handleEditDivision = (division: Division) => {
    formForDivsion.reset({
      class: Number.parseInt(division.class), // need to change class type for creation of class ,(API demands number format for create class)
      division: division.division,
      aliases: division.aliases || "",
      formType: "edit",
      class_id: division.id,
    })
    setIsDivisionForDialogOpen(true)
  }

  const handleEditClass = (cls: ClassData) => {
    setEditingClass(cls)
    setIsEditClassDialogOpen(true)
  }

  const handleSaveEditClass = () => {
    // Implementation remains the same
  }

  const handleSaveButtonForSelectedClasses = () => {
    setSelectedClasses(selectedClasses)
    setIsConfirmSaveDialogOpen(true)
  }

  const confirmSaveSelectionOfClasses = async () => {
    if (selectedClasses && selectedClasses.length > 0) {
      let payload: Omit<Class, "id" | "school_id">[] = []

      payload = selectedClasses.map((clas) => {
        return {
          class: clas.class,
          division: "A",
          aliases: null,
          academic_session_id: currentAcademicSession?.id ?? 0,
        }
      })

      try {
        const added_class: any = await dispatch(createClasses(payload))

        if (added_class.meta.requestStatus === "fulfilled") {
          // Update the academicClasses state with the new classes
          const newClasses = payload.map((clas, index) => ({
            class: clas.class,
            divisions: [
              {
                id: added_class.payload[0].id,
                school_id: user!.school_id,
                class: clas.class.toString(),
                division: clas.division,
                aliases: clas.aliases,
                academic_session_id: currentAcademicSession?.id ?? 0,
              },
            ],
          }))

          setAcademicClasses((prevClasses): any => [...prevClasses, ...newClasses])

          // Clear the selected classes
          setSelectedClasses([])

          toast({
            title: "Classes Added",
            description: `New classes have been added successfully.`,
          })

          refetchClasses()
        } else {
          toast({
            title: "Error",
            description: `Failed to add classes. Please try again.`,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `An error occurred while adding classes. Please try again.`,
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "No Classes Selected",
        description: `Please select at least one class to add.`,
        variant: "destructive",
      })
    }

    setIsConfirmSaveDialogOpen(false)
  }

  const confirmDivisionChanges = async () => {
    const payload = formForDivsion.getValues()
    console.log("payload", payload)
    console.log("paykokad", payload)
    if (payload.formType === "edit" && payload.class_id && payload.aliases) {
      try {
        // Edit division
        const edited_division = await dispatch(
          editDivision({
            class_id: payload.class_id,
            aliases: payload.aliases,
          }),
        ).unwrap()
        console.log("edited_division", edited_division)
        // Update the academicClasses state for the edited division
        setAcademicClasses((prevClasses) =>
          prevClasses.map((cls) => ({
            ...cls,
            divisions: cls.divisions.map((div) =>
              div.id === payload.class_id ? { ...div, aliases: payload.aliases || null } : div,
            ),
          })),
        )
        setIsDivisionForDialogOpen(false)
        setNewDivision(null)
        toast({
          title: "Division Updated",
          description: `Division has been updated successfully.`,
        })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: `${error[0].message}`,
        })
      }
    } else {
      // Create new division
      try {
        const new_division = await dispatch(
          createDivision({
            class: payload.class ?? 0,
            division: payload.division || "",
            aliases: payload.aliases || null,
            academic_session_id: currentAcademicSession?.id ?? 0,
          }),
        ).unwrap()
        console.log("new_division", new_division)
        setAcademicClasses((prevClasses): any =>
          prevClasses.map((cls) =>
            cls.class === payload.class
              ? {
                  ...cls,
                  divisions: [
                    ...cls.divisions,
                    {
                      id: new_division.id,
                      school_id: user!.school_id,
                      class: payload.class.toString(),
                      division: payload.division,
                      aliases: payload.aliases || null,
                    },
                  ],
                }
              : cls,
          ),
        )

        setIsDivisionForDialogOpen(false)
        setNewDivision(null)

        toast({
          title: "Division Added",
          description: `New division has been added successfully.`,
        })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: `${error[0].message}`,
        })
      }
    }
  }

  const handleSessionFormSuccess = () => {
    setIsNewSessionDialogOpen(false)
    refetchSessions()
  }

  const handleActivateSession = async (sessionId: number) => {
    try {
      await setActiveSessionMutation(sessionId).unwrap()
      toast({
        title: "Success",
        description: "Academic session activated successfully",
      })
      refetchSessions()
    } catch (error) {
      console.error("Failed to activate session:", error)
      toast({
        title: "Error",
        description: "Failed to activate academic session",
        variant: "destructive",
      })
    }
  }

  // Update state when data is loaded
  useEffect(() => {
    if (classesData && classesData.length > 0) {
      setAcademicClasses(classesData)
    }
  }, [classesData])

  useEffect(()=>{
    console.log("formForDivsion.formState.errors", formForDivsion.formState.errors)
  }, [formForDivsion.formState.errors])

  // Update the useEffect for setting the active session
  useEffect(() => {
    if (sessionsData && sessionsData.sessions && sessionsData.sessions.length > 0) {
      const session = sessionsData.sessions.find((session: any) => session.is_active)
      if (session.is_active) {
        setActiveSession(session)
        // If we have an active session and we're on the sessions tab, auto-switch to classes tab
        // if (activeTab === "sessions" && !isLoadingClasses) {
        //   setActiveTab("classes")
        // }
      } else {
        setActiveSession(null)
        setShowNoActiveSessionAlert(true)
      }
    } else {
      setActiveSession(null)
      setShowNoActiveSessionAlert(true)
    }
  }, [sessionsData, activeTab, isLoadingClasses])

  // Check if there's an active session
  const hasActiveSession = !!activeSession

  return (
    <>
      {isLoadingClasses || isLoadingSessions ? (
        <div className="space-y-6 p-4">
          <Skeleton className="h-[120px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      ) : (
        <div className="space-y-6 overflow-y-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="sessions">Academic Sessions</TabsTrigger>
              <TabsTrigger value="classes" disabled={!hasActiveSession}>
                Classes & Divisions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="space-y-6">
              <SaralCard title="Academic Session Management" description="Manage academic sessions for your school">
                <Dialog open={isNewSessionDialogOpen} onOpenChange={setIsNewSessionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Academic Session</DialogTitle>
                      <DialogDescription>Set the start and end dates for the new academic session.</DialogDescription>
                    </DialogHeader>
                    <AcademicSessionForm onSuccess={handleSessionFormSuccess} />
                  </DialogContent>
                </Dialog>
                {activeSession ? (
                  <div className="mb-6 mt-6 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">
                          {formatSessionName(activeSession.start_date, activeSession.end_date)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(activeSession.start_date).toLocaleDateString()} -{" "}
                          {new Date(activeSession.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-lg">
                        Current Session
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <AlertDialog open={showNoActiveSessionAlert} onOpenChange={setShowNoActiveSessionAlert}>
                    <AlertDialogContent className="bg-yellow-50 border-yellow-200">
                      <AlertDialogHeader>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
                            <AlertDialogTitle className="text-yellow-700">No Active Session</AlertDialogTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowNoActiveSessionAlert(false)}
                            className="h-6 w-6 rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <AlertDialogDescription className="text-yellow-600">
                          There is no active academic session. Please create a new session or activate an existing one.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowNoActiveSessionAlert(false)}>Close</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setIsNewSessionDialogOpen(true)}>
                          Create New Session
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">All Academic Sessions</h3>
                  <AcademicSessionsList onActivate={handleActivateSession} />
                </div>
              </SaralCard>
            </TabsContent>

            <TabsContent value="classes" className="space-y-6">
              {!hasActiveSession ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Active Academic Session</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Please create and activate an academic session before managing classes and divisions.
                  </p>
                  <Button className="mt-4" onClick={() => setActiveTab("sessions")}>
                    Go to Sessions
                  </Button>
                </div>
              ) : (
                <>
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
                                Class {cls.class}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleSaveButtonForSelectedClasses} disabled={!selectedClasses}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </SaralCard>

                  {academicClasses.length > 0 && (
                    <SaralCard
                      title="Active Classes & Divisions"
                      description="Manage divisions and aliases for selected classes"
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Class</TableHead>
                            <TableHead>Divisions</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {academicClasses.map(
                            (std, index) =>
                              std.divisions.length > 0 && (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{std.class}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-2 flex-wrap">
                                      {std.divisions.map((division) => (
                                        <Badge
                                          key={division.id}
                                          variant="secondary"
                                          className="flex items-center gap-1 p-3"
                                        >
                                          <p>
                                            ({division.class}- {division.division})
                                          </p>
                                          <p>{division.aliases}</p>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 p-0 ml-1"
                                            onClick={() => handleEditDivision(division)}
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
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
                                </TableRow>
                              ),
                          )}
                        </TableBody>
                      </Table>
                    </SaralCard>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>

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
                  <Input
                    id="divisionName"
                    value={editingDivision?.division.name || ""}
                    disabled
                    className="col-span-3"
                  />
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
                <Button onClick={() => {}}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isConfirmSaveDialogOpen} onOpenChange={setIsConfirmSaveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Changes</DialogTitle>
                <DialogDescription>
                  Are you sure you want to save these changes to your class selection?
                </DialogDescription>
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
                <DialogTitle>
                  {formForDivsion.getValues("formType") === "create" ? "Add" : "Update"} Division
                </DialogTitle>
                <DialogDescription>Confirm or modify the division alias.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Form {...formForDivsion}>
                  <form onSubmit={formForDivsion.handleSubmit(confirmDivisionChanges)} className="space-y-6">
                    <FormField
                      control={formForDivsion.control}
                      name="class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class</FormLabel>
                          <FormControl>
                            <Input type="text" {...field} value={field.value ?? ""} disabled />
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
                            <Input type="text" {...field} value={field.value ?? ""} disabled />
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
                            <Input
                              type="text"
                              placeholder="Enter aliases name for class"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDivisionForDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {formForDivsion.getValues("formType") === "create" ? "Add a new" : "Update"} Division
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  )
}

