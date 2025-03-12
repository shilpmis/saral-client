import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { User } from "@/types/user"
import { useAddUserMutation, useUpdateUserMutation } from "@/services/UserManagementService"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/redux/hooks/useTranslation"

const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  role_id: z.string().min(1, "Role is required"),
  is_active: z.boolean().optional(),
})

type Role = {
  id: number
  role: string
  permissions: Record<string, unknown>
}

type UserFormProps = {
  initialData: User | null
  roles: Role[]
  isEditing: boolean
  onSucssesfullChange: (user: User | null) => void
}

export const UserForm: React.FC<UserFormProps> = ({ initialData, roles, isEditing, onSucssesfullChange }) => {

  const [createUser, { isError, isLoading }] = useAddUserMutation();
  const [updateUser, { }] = useUpdateUserMutation()
  const {t} = useTranslation()

  const checkIsActive = (value: any): boolean => {
    return value == 1
  }

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name || "",
      role_id: initialData?.role_id ? initialData.role_id.toString() : "",
      is_active: checkIsActive(initialData?.is_active),
    },
  })

  const handleSubmit = async (data: z.infer<typeof userSchema>) => {

    if (isEditing) {
      if (initialData?.name.trim() != data.name || checkIsActive(initialData?.is_active) != data.is_active) {
        let payload: Partial<{ name: string, is_active: boolean }> = {}
        if (initialData?.name.trim() != data.name) payload.name = data.name
        if (checkIsActive(initialData?.is_active) != data.is_active) payload.is_active = data.is_active
        const updated_user = await updateUser({ payload, user_id: initialData!.id });
        if (updated_user.data) {
          onSucssesfullChange(updated_user.data)
          toast({
            variant: "default",
            title: "Updated user sucssesfuly !",
          })
        }
        if (updated_user.error) {
          console.log("Error updating user", updated_user.error)
          toast({
            variant: "destructive",
            title: "Error updating user",
          })
        }
      } else {
        toast({
          variant: "destructive",
          title: "No changes made",
          description: "No changes made to the user",
        })
      }
    } else {
      const new_user: any = await createUser({
        name: data.name,
        role_id: Number(data.role_id),
      })
      if (new_user.data) onSucssesfullChange(new_user.data)
      if (new_user.error) {
        console.log("Error creating user", new_user.error)
        if (new_user.error.data.message.code == 'ER_DUP_ENTRY') {
          toast({
            variant: "destructive",
            title: `User for this role already crated !`,
          })
        }
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isEditing && (
          <FormField
            control={form.control}
            name="role_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("role")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {initialData?.role_id !== 1 && isEditing && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value ?? false} onCheckedChange={(checked) => { field.onChange(checked) }} />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        <Button type="submit">{isEditing ? "Update User" : "Create User"}</Button>
      </form>
    </Form>
  )
}

