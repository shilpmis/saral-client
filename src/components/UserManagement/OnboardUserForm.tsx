import  React from "react"
import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { User } from "../../types/user.js"

interface OnboardUserFormProps {
  onSubmit: (data: User) => void
  initialData?: User
}

const defaultUser: User = {
  id: "",
  image: "",
  name: "",
  mobileNumber: "",
  registrationDetails: "",
  email: "",
  password: "",
  currentStatus: "Active",
  delegateResponsibilities: {
    managementDepartment: false,
    studentDetails: false,
    timeTable: false,
    feeStructure: false,
    staffManagement: false,
    listOfComplaints: false,
    accounts: false,
    resultDetails: false,
    transportDepartment: false,
    hostelDepartment: false,
  },
}

export const OnboardUserForm: React.FC<OnboardUserFormProps> = ({ onSubmit, initialData = defaultUser }) => {
  const { register, handleSubmit, control, setValue, watch } = useForm<User>({
    defaultValues: initialData,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    if (typeof initialData.image === 'string') {
      return initialData.image; // If it's already a string, use it
    }
    if (initialData.image instanceof File) {
      return URL.createObjectURL(initialData.image); // Convert File to string URL
    }
    return null; // For other cases (e.g., FileList or null)
  });
  
  const watchedImage = watch("image")

  useEffect(() => {
    let objectUrl: string | null = null;
  
    if (initialData.image instanceof File) {
      objectUrl = URL.createObjectURL(initialData.image);
      setImagePreview(objectUrl);
    }
  
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [initialData.image]);
  

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue("image", file)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar className="w-24 h-24">
            {imagePreview ? (
              <AvatarImage src={imagePreview} alt="User avatar" />
            ) : (
              <AvatarFallback>
                <Camera className="w-8 h-8" />
              </AvatarFallback>
            )}
          </Avatar>
          <Input
            type="file"
            id="image"
            accept="image/jpeg,image/png"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImageUpload}
          />
        </div>
        <Label htmlFor="image" className="cursor-pointer">
          Upload Image
        </Label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name", { required: true })} />
        </div>
        <div>
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input id="mobileNumber" {...register("mobileNumber", { required: true })} />
        </div>
        <div>
          <Label htmlFor="registrationDetails">Registration Details</Label>
          <Input id="registrationDetails" {...register("registrationDetails", { required: true })} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email", { required: true })} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password", { required: true })} />
        </div>
        <div>
          <Label htmlFor="currentStatus">Current Status</Label>
          <Controller
            name="currentStatus"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Delegate Responsibilities</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(defaultUser.delegateResponsibilities).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Controller
                name={`delegateResponsibilities.${key as keyof User["delegateResponsibilities"]}`}
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id={`delegateResponsibilities.${key}`}
                  />
                )}
              />
              <Label htmlFor={`delegateResponsibilities.${key}`}>
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit">{initialData.id ? "Update User" : "Add User"}</Button>
    </form>
  )
}

