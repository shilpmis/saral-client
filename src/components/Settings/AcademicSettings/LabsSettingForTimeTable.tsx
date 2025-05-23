"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Info, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"
import {
  useCreateLabConfigMutation,
//   useUpdateLabConfigMutation,
//   useDeleteLabConfigMutation,
} from "@/services/timetableService"
import type { TimeTableConfigForSchool, labConfig } from "@/types/subjects"

// Define the schema for lab configuration
const labSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Lab name is required"),
  max_capacity: z.number().min(1, "Capacity must be at least 1"),
  availability_per_day: z.number().nullable(),
})

type LabSettingsProps = {
  existingConfig: TimeTableConfigForSchool | null
  onLabConfigSaved: () => void
}

export default function LabSettingsForTimeTable({ existingConfig, onLabConfigSaved }: LabSettingsProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentLabId, setCurrentLabId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [labToDelete, setLabToDelete] = useState<labConfig | null>(null)

  // RTK Query hooks
  const [createLabConfig, { isLoading: isCreating }] = useCreateLabConfigMutation()
//   const [updateLabConfig, { isLoading: isUpdating }] = useUpdateLabConfigMutation()
//   const [deleteLabConfig, { isLoading: isDeleting }] = useDeleteLabConfigMutation()

  // Set up lab form
  const form = useForm<z.infer<typeof labSchema>>({
    resolver: zodResolver(labSchema),
    defaultValues: {
      name: "",
      max_capacity: 1,
      availability_per_day: null,
    },
  })

  // Open dialog to add a new lab
  const openAddLabDialog = () => {
    form.reset({
      name: "",
      max_capacity: 1,
      availability_per_day: null,
    })
    setIsEditMode(false)
    setCurrentLabId(null)
    setIsDialogOpen(true)
  }

  // Open dialog to edit an existing lab
  const openEditLabDialog = (lab: labConfig) => {
    form.reset({
      id: lab.id,
      name: lab.name,
      max_capacity: lab.max_capacity,
      availability_per_day: lab.availability_per_day,
    })
    setIsEditMode(true)
    setCurrentLabId(lab.id)
    setIsDialogOpen(true)
  }

  // Open dialog to confirm lab deletion
  const openDeleteLabDialog = (lab: labConfig) => {
    setLabToDelete(lab)
    setIsDeleteDialogOpen(true)
  }

  // Handle lab form submission
  const onSubmit = async (data: z.infer<typeof labSchema>) => {
    try {
      if (!existingConfig) {
        toast({
          variant: "destructive",
          title: t("error"),
          description: t("general_settings_must_be_saved_first"),
        })
        return
      }

      if (isEditMode && currentLabId) {
        // Update existing lab
        // await updateLabConfig({
        //   id: currentLabId,
        //   payload: {
        //     name: data.name,
        //     max_capacity: data.max_capacity,
        //     availability_per_day: data.availability_per_day,
        //     school_timetable_config_id: existingConfig.id,
        //   },
        // })

        toast({
          title: t("success"),
          description: t("lab_updated_successfully"),
        })
      } else {
        // Create new lab
        await createLabConfig({
          payload: {
            school_timetable_config_id: existingConfig.id,
            labs: [
              {
                name: data.name,
                max_capacity: data.max_capacity,
                availability_per_day: data.availability_per_day,
              },
            ],
          },
        })

        toast({
          title: t("success"),
          description: t("lab_created_successfully"),
        })
      }

      // Close dialog and refresh data
      setIsDialogOpen(false)
      onLabConfigSaved()
    } catch (error) {
      console.error("Error saving lab:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: isEditMode ? t("failed_to_update_lab") : t("failed_to_create_lab"),
      })
    }
  }

  // Handle lab deletion
  const handleDeleteLab = async () => {
    try {
      if (!labToDelete) return

    //   await deleteLabConfig({
    //     id: labToDelete.id,
    //   })

      toast({
        title: t("success"),
        description: t("lab_deleted_successfully"),
      })

      // Close dialog and refresh data
      setIsDeleteDialogOpen(false)
      onLabConfigSaved()
    } catch (error) {
      console.error("Error deleting lab:", error)
      toast({
        variant: "destructive",
        title: t("error"),
        description: t("failed_to_delete_lab"),
      })
    }
  }

  // Check if labs are enabled
  if (!existingConfig?.lab_enabled) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>{t("labs_not_enabled")}</AlertTitle>
        <AlertDescription>{t("lab_periods_are_not_enabled_in_general_settings")}</AlertDescription>
      </Alert>
    )
  }

  // Get labs from config
  const labs = existingConfig?.lab_config || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t("lab_configurations")}</h3>
        <Button onClick={openAddLabDialog} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("add_lab")}
        </Button>
      </div>

      {labs.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Info className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">{t("no_labs_configured")}</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            {t("add_labs_to_configure_their_availability_for_timetable")}
          </p>
          <Button onClick={openAddLabDialog}>
            <Plus className="h-4 w-4 mr-2" />
            {t("add_your_first_lab")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labs.map((lab) => (
            <div key={lab.id} className="border rounded-md p-4 relative">
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => openEditLabDialog(lab)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => openDeleteLabDialog(lab)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <h4 className="font-medium text-lg mb-2">{lab.name}</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("maximum_capacity")}:</span>
                  <span className="font-medium">{lab.max_capacity}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("availability_per_day")}:</span>
                  <span className="font-medium">
                    {lab.availability_per_day === null ? t("unlimited") : lab.availability_per_day}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Lab Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? t("edit_lab") : t("add_new_lab")}</DialogTitle>
            <DialogDescription>
              {isEditMode ? t("update_the_lab_details_below") : t("fill_in_the_details_to_add_a_new_lab")}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">{t("lab_name")}</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormDescription>{t("name_of_the_laboratory")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="required">{t("maximum_capacity")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        required
                      />
                    </FormControl>
                    <FormDescription>{t("how_many_classes_can_use_this_lab_simultaneously")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availability_per_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("availability_per_day")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("unlimited")}
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>{t("maximum_periods_this_lab_can_be_used_per_day")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {(isCreating ) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? t("update_lab") : t("add_lab")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm_deletion")}</DialogTitle>
            <DialogDescription>
              {t("are_you_sure_you_want_to_delete_this_lab")}
              {labToDelete && <strong className="block mt-1">{labToDelete.name}</strong>}
              {t("this_action_cannot_be_undone")}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteLab} disabled={true}>
              {false && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("delete_lab")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
