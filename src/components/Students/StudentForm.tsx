import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  aadhar_dise_no: z.string().min(12, { message: "Aadhar/DISE number must be at least 12 characters." }),
  birth_place: z.string().min(2, { message: "Birth place must be at least 2 characters." }),
  birth_place_in_guj: z.string().min(2, { message: "Birth place in Gujarati must be at least 2 characters." }),
  religiion: z.string().min(2, { message: "Religion must be at least 2 characters." }),
  religiion_in_guj: z.string().min(2, { message: "Religion in Gujarati must be at least 2 characters." }),
  cast: z.string().min(2, { message: "Cast must be at least 2 characters." }),
  cast_in_guj: z.string().min(2, { message: "Cast in Gujarati must be at least 2 characters." }),
  category: z.enum(["ST", "SC", "OBC", "OPEN"]),
  admission_date: z.string(),
  admission_std: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]),
  division: z.enum(["A", "B", "C", "D", "E", "F", "G", "H"]),
  mobile_number_2: z.string().regex(/^[6-9]\d{9}$/, { message: "Invalid mobile number" }),
  privious_school: z.string().nullable(),
  privious_school_in_guj: z.string().nullable(),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  district: z.string().min(2, { message: "District must be at least 2 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  state: z.string().min(2, { message: "State must be at least 2 characters." }),
  postal_code: z.string().min(6, { message: "Postal code must be at least 6 characters." }),
  bank_name: z.string().min(2, { message: "Bank name must be at least 2 characters." }),
  account_no: z.string().min(9, { message: "Account number must be at least 9 characters." }),
  IFSC_code: z.string().min(11, { message: "IFSC code must be 11 characters." }).max(11),
})

export type StudentFormData = z.infer<typeof formSchema>

interface StudentFormProps {
  onSubmit: (data: StudentFormData) => void
  initialData?: Partial<StudentFormData>
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit, initialData }) => {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      aadhar_dise_no: "",
      birth_place: "",
      birth_place_in_guj: "",
      religiion: "",
      religiion_in_guj: "",
      cast: "",
      cast_in_guj: "",
      category: "OPEN",
      admission_date: "",
      admission_std: "1",
      division: "A",
      mobile_number_2: "",
      privious_school: null,
      privious_school_in_guj: null,
      address: "",
      district: "",
      city: "",
      state: "",
      postal_code: "",
      bank_name: "",
      account_no: "",
      IFSC_code: "",
      ...initialData,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList>
            <TabsTrigger value="personal">Personal Details</TabsTrigger>
            <TabsTrigger value="admission">Admission Details</TabsTrigger>
            <TabsTrigger value="address">Address Details</TabsTrigger>
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
          </TabsList>
          <TabsContent value="personal" className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aadhar_dise_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhar/DISE Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birth_place"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Place</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_place_in_guj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Place (in Gujarati)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="religiion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Religion</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="religiion_in_guj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Religion (in Gujarati)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cast"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cast</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cast_in_guj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cast (in Gujarati)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ST">ST</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                      <SelectItem value="OPEN">OPEN</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="admission" className="space-y-4">
            <FormField
              control={form.control}
              name="admission_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admission Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="admission_std"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Standard</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select standard" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Standard {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["A", "B", "C", "D", "E", "F", "G", "H"].map((division) => (
                          <SelectItem key={division} value={division}>
                            Division {division}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="mobile_number_2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alternate Mobile Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="privious_school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous School</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="privious_school_in_guj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous School (in Gujarati)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          <TabsContent value="address" className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          <TabsContent value="bank" className="space-y-4">
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="IFSC_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        <Button type="submit" className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Student
        </Button>
      </form>
    </Form>
  )
}

export default StudentForm

