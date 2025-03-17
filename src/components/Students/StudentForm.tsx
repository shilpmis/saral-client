"use client"

import type React from "react"
import { useRef } from "react";
import { useState, useCallback, useMemo, useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type StudentFormData, studentSchema } from "@/utils/student.validation"
import { selectAcademicClasses } from "@/redux/slices/academicSlice"
import { useAppSelector } from "@/redux/hooks/useAppSelector"
import type { AcademicClasses, Division } from "@/types/academic"
import { selectAuthState } from "@/redux/slices/authSlice"
import { toast } from "@/hooks/use-toast"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import {
  useAddSingleStudentMutation,
  useLazyFetchStudentForClassQuery,
  useUpdateStudentMutation,
} from "@/services/StudentServices"
import type { z } from "zod"
import type { Student, StudentEntry, UpdateStudent } from "@/types/student"
import { Loader2 } from "lucide-react"

interface StudentFormProps {
  onClose: () => void
  form_type: "create" | "update" | "view"
  initial_data?: Student | null
  setListedStudentForSelectedClass?: (data: any) => void
  setPaginationDataForSelectedClass?: (data: any) => void
}

const StudentForm: React.FC<StudentFormProps> = ({
  onClose,
  initial_data,
  form_type,
  setListedStudentForSelectedClass,
  setPaginationDataForSelectedClass,
}) => {
  const formatData = (value: any): string => {
    return new Date(value).toISOString().split("T")[0]
  }

  const AcademicClasses = useAppSelector(selectAcademicClasses)
  const authState = useAppSelector(selectAuthState)
  const isLoading = useAppSelector((state) => state.academic.loading)


  const customStudentSchema = studentSchema.refine((data) => {
    if (data.admission_class && data.class) {
      return parseInt(data.admission_class) <= parseInt(data.class);
    }
    return true;
  }, {
    message: "Admission class should not be greater than the current class",
    path: ["admission_class"], // Specify the path to the field that should show the error
  });

  const form = useForm<StudentFormData>({
    resolver: zodResolver(customStudentSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      first_name_in_guj: "",
      middle_name_in_guj: "",
      last_name_in_guj: "",
      gender: "Male", // Default to "Male"
      birth_date: "",
      birth_place: "",
      birth_place_in_guj: "",
      aadhar_no: undefined,
      aadhar_dise_no: undefined,

      father_name: "",
      father_name_in_guj: "",
      mother_name: "",
      mother_name_in_guj: "",
      primary_mobile: undefined,
      secondary_mobile: undefined,

      gr_no: undefined,
      roll_number: undefined,
      admission_date: "",
      admission_class: undefined,
      admission_division: undefined,
      class: "",
      division: "",
      privious_school: "",
      privious_school_in_guj: "",

      religiion: "",
      religiion_in_guj: "",
      caste: "",
      caste_in_guj: "",
      category: "OPEN", // Default to "OPEN"

      address: "",
      district: "",
      city: "",
      state: "",
      postal_code: undefined,

    bank_name: "",
    account_no: undefined,
    IFSC_code: "",
  },
});

  const tabMapping: { [key: string]: string } = {
    first_name: "personal",
    middle_name: "personal",
    last_name: "personal",
    first_name_in_guj: "personal",
    middle_name_in_guj: "personal",
    last_name_in_guj: "personal",
    gender: "personal",
    birth_date: "personal",
    birth_place: "personal",
    birth_place_in_guj: "personal",
    aadhar_no: "personal",
    aadhar_dise_no: "personal",
    father_name: "family",
    father_name_in_guj: "family",
    mother_name: "family",
    mother_name_in_guj: "family",
    primary_mobile: "family",
    secondary_mobile: "family",
    gr_no: "academic",
    roll_number: "academic",
    admission_date: "academic",
    admission_class: "academic",
    admission_division: "academic",
    class: "academic",
    division: "academic",
    privious_school: "academic",
    privious_school_in_guj: "academic",
    religiion: "other",
    religiion_in_guj: "other",
    caste: "other",
    caste_in_guj: "other",
    category: "other",
    address: "address",
    district: "address",
    city: "address",
    state: "address",
    postal_code: "address",
    bank_name: "bank",
    account_no: "bank",
    IFSC_code: "bank",
  };
     
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [
    getAcademicClasses,
    { isLoading: isLoadingForAcademicClasses, isError: isErrorWhileFetchingClass, error: errorWhiwlFetchingClass },
  ] = useLazyGetAcademicClassesQuery()

  const [updateStudent, { isLoading: isStundetGetingUpdate, isError: errorWhileUpdateStudent }] =
    useUpdateStudentMutation()
  const [createStudent, { isLoading: isStundetGetingCreate, isError: errorWhileCreateStudent }] =
    useAddSingleStudentMutation()

  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  const [selectedAdmissionClass, setselectedAdmissionClass] = useState<string>("")
  const [selectedAdmissionDivision, setselectedAdmissionDivision] = useState<Division | null>(null)
  const [activeTab, setActiveTab] = useState("personal")
  const [getStudentForClass, { data: studentDataForSelectedClass }] = useLazyFetchStudentForClassQuery()

  const availableDivisions = useMemo<AcademicClasses | null>(() => {
    if (AcademicClasses && selectedClass) {
      return AcademicClasses!.filter((cls) => {
        if (cls.class.toString() === selectedClass) {
          return cls
        }
      })[0]
    } else {
      return null
    }
  }, [AcademicClasses, selectedClass])

  const available_classes = useMemo<Division[] | null>(() => {
    if (AcademicClasses) {
      const cls: Division[] = []
      for (let i = 0; i < AcademicClasses!.length; i++) {
        AcademicClasses[i].divisions.map((div) => {
          cls.push(div)
        })
      }
      return cls
    } else {
      return null
    }
  }, [AcademicClasses])

  const availableDivisionsForAdmissionClass = useMemo<AcademicClasses | null>(() => {
    if (AcademicClasses && selectedAdmissionClass) {
      return AcademicClasses!.filter((cls) => {
        if (cls.class.toString() === selectedAdmissionClass) {
          return cls
        }
      })[0]
    } else {
      return null
    }
  }, [AcademicClasses, selectedAdmissionClass])

  const handleClassChange = useCallback(
    (value: string, type: "admission_Class" | "class") => {
      if (type === "admission_Class") {
        setselectedAdmissionClass(value)
        setselectedAdmissionDivision(null)
        form.setValue("admission_division", "") // Reset division when class changes
      } else {
        setSelectedClass(value)
        setSelectedDivision(null)
        form.setValue("division", "") // Reset division when class changes
      }
    },
    [setSelectedClass, setSelectedDivision, form.setValue],
  )

  const handleDivisionChange = useCallback(
    (division_id: string, type: "admission_Class" | "class") => {
      if (type === "admission_Class") {
        const selectedDiv = availableDivisions?.divisions.find((div) => div.id.toString() === division_id)
        setSelectedDivision(selectedDiv || null)
      } else {
        const selectedDiv = availableDivisionsForAdmissionClass?.divisions.find(
          (div) => div.id.toString() === division_id,
        )
        setselectedAdmissionDivision(selectedDiv || null)
      }
    },
    [availableDivisions, availableDivisionsForAdmissionClass, setSelectedDivision, setselectedAdmissionDivision],
  )

  const handleSubmit: SubmitHandler<StudentFormData> = async (values: z.infer<typeof customStudentSchema>) => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const tabToActivate = tabMapping[firstErrorField];
      setActiveTab(tabToActivate);
      return;
    }
  
    const firstErrorField = Object.keys(errors)[0];
    setTimeout(() => {
      inputRefs.current[firstErrorField]?.focus();
    }, 0);
  
    if (form_type === "create") {
      const CurrentClass = available_classes?.filter(
        (cls) => cls.class == values?.class && cls.division == values.division,
      )[0];
      const AdmissionClass = available_classes?.filter(
        (cls) => cls.class == values?.admission_class && cls.division == values.admission_division,
      )[0];

     
      const payload: StudentEntry = {
        students_data: {
          class_id: CurrentClass!.id,
          first_name: values.first_name,
          middle_name: values.middle_name,
          last_name: values.last_name,
          first_name_in_guj: values.first_name_in_guj,
          middle_name_in_guj: values.middle_name_in_guj,
          last_name_in_guj: values.last_name_in_guj,
          gender: values.gender,
          birth_date: values.birth_date,
          gr_no: values.gr_no,
          primary_mobile: values.primary_mobile,
          father_name: values.father_name,
          father_name_in_guj: values.father_name_in_guj,
          mother_name: values.mother_name,
          mother_name_in_guj: values.mother_name_in_guj,
          roll_number: values.roll_number,
          aadhar_no: values.aadhar_no,
          is_active: true,
        },
        student_meta_data: {
          aadhar_dise_no: values.aadhar_dise_no,
          birth_place: values.birth_place,
          birth_place_in_guj: values.birth_place_in_guj,
          religiion: values.religiion,
          religiion_in_guj: values.religiion_in_guj,
          caste: values.caste,
          caste_in_guj: values.caste_in_guj,
          category: values.category,
          admission_date: values.admission_date,
          admission_class_id: AdmissionClass!.id,
          secondary_mobile: values.secondary_mobile,
          privious_school: values.privious_school,
          privious_school_in_guj: values.privious_school_in_guj,
          address: values.address,
          district: values.district,
          city: values.city,
          state: values.state,
          postal_code: values.postal_code,
          bank_name: values.bank_name,
          account_no: values.account_no,
          IFSC_code: values.IFSC_code,
        },
      }

      const new_student: any = await createStudent({ payload: payload })

      if (new_student.data) {
        toast({
          variant: "default",
          title: "Success",
          description: "Student Created Successfully",
        });
        onClose();
      }

      if (new_student.error) {
        new_student.error.data.errors.map((error: any) => {
          toast({
            variant: "destructive",
            title: error,
          })
        })
      }
    } else if (form_type === "update") {
      const payload: UpdateStudent = {
        student_meta_data: {},
        students_data: {},
      }

      // Compare form values with initial data for student_meta_data fields
      if (values.aadhar_dise_no !== initial_data!.student_meta!.aadhar_dise_no) {
        payload.student_meta_data.aadhar_dise_no = values.aadhar_dise_no
      }
      if (values.birth_place !== initial_data?.student_meta?.birth_place) {
        payload.student_meta_data.birth_place = values.birth_place
      }
      if (values.birth_place_in_guj !== initial_data?.student_meta?.birth_place_in_guj) {
        payload.student_meta_data.birth_place_in_guj = values.birth_place_in_guj
      }
      if (values.religiion !== initial_data?.student_meta?.religiion) {
        payload.student_meta_data.religiion = values.religiion
      }
      if (values.religiion_in_guj !== initial_data?.student_meta?.religiion_in_guj) {
        payload.student_meta_data.religiion_in_guj = values.religiion_in_guj
      }
      if (values.caste !== initial_data?.student_meta?.caste) {
        payload.student_meta_data.caste = values.caste
      }
      if (values.caste_in_guj !== initial_data?.student_meta?.caste_in_guj) {
        payload.student_meta_data.caste_in_guj = values.caste_in_guj
      }
      if (values.category !== initial_data?.student_meta?.category) {
        payload.student_meta_data.category = values.category
      }
      if (formatData(values.admission_date) !== formatData(initial_data!.student_meta!.admission_date)) {
        payload.student_meta_data.admission_date = formatData(values.admission_date)
      }
      if (values.admission_division !== initial_data?.student_meta?.admission_class_id?.toString()) {
        payload.student_meta_data.admission_class_id = Number(values.admission_division)
      }
      if (values.secondary_mobile !== initial_data?.student_meta?.secondary_mobile) {
        payload.student_meta_data.secondary_mobile = values.secondary_mobile
      }
      if (values.privious_school !== initial_data?.student_meta?.privious_school) {
        payload.student_meta_data.privious_school = values.privious_school
      }
      if (values.privious_school_in_guj !== initial_data?.student_meta?.privious_school_in_guj) {
        payload.student_meta_data.privious_school_in_guj = values.privious_school_in_guj
      }
      if (values.address !== initial_data?.student_meta?.address) {
        payload.student_meta_data.address = values.address
      }
      if (values.district !== initial_data?.student_meta?.district) {
        payload.student_meta_data.district = values.district
      }
      if (values.city !== initial_data?.student_meta?.city) {
        payload.student_meta_data.city = values.city
      }
      if (values.state !== initial_data?.student_meta?.state) {
        payload.student_meta_data.state = values.state
      }
      if (values.postal_code === initial_data?.student_meta?.postal_code) {
        payload.student_meta_data.postal_code = values.postal_code
      }
      if (values.bank_name !== initial_data?.student_meta?.bank_name) {
        payload.student_meta_data.bank_name = values.bank_name
      }
      if (values.account_no !== initial_data?.student_meta?.account_no) {
        payload.student_meta_data.account_no = values.account_no
      }
      if (values.IFSC_code !== initial_data?.student_meta?.IFSC_code) {
        payload.student_meta_data.IFSC_code = values.IFSC_code
      }

      onClose();

      // Compare form values with initial data for students_data fields
      if (values.first_name !== initial_data?.first_name) {
        payload.students_data.first_name = values.first_name
      }
      if (values.middle_name !== initial_data?.middle_name) {
        payload.students_data.middle_name = values.middle_name
      }
      if (values.last_name !== initial_data?.last_name) {
        payload.students_data.last_name = values.last_name
      }
      if (values.first_name_in_guj !== initial_data?.first_name_in_guj) {
        payload.students_data.first_name_in_guj = values.first_name_in_guj
      }
      if (values.middle_name_in_guj !== initial_data?.middle_name_in_guj) {
        payload.students_data.middle_name_in_guj = values.middle_name_in_guj
      }
      if (values.last_name_in_guj !== initial_data?.last_name_in_guj) {
        payload.students_data.last_name_in_guj = values.last_name_in_guj
      }
      if (values.gender !== initial_data?.gender) {
        payload.students_data.gender = values.gender
      }
      if (values.birth_date !== initial_data?.birth_date) {
        payload.students_data.birth_date = values.birth_date
      }
      if (values.gr_no !== initial_data?.gr_no) {
        payload.students_data.gr_no = values.gr_no
      }
      if (values.primary_mobile !== initial_data?.primary_mobile) {
        payload.students_data.primary_mobile = values.primary_mobile
      }
      
      if (values.father_name !== initial_data?.father_name) {
        payload.students_data.father_name = values.father_name
      }
      if (values.father_name_in_guj !== initial_data?.father_name_in_guj) {
        payload.students_data.father_name_in_guj = values.father_name_in_guj
      }
      if (values.mother_name !== initial_data?.mother_name) {
        payload.students_data.mother_name = values.mother_name
      }
      if (values.mother_name_in_guj !== initial_data?.mother_name_in_guj) {
        payload.students_data.mother_name_in_guj = values.mother_name_in_guj
      }
      if (values.roll_number !== initial_data?.roll_number) {
        payload.students_data.roll_number = values.roll_number
      }
      if (values.aadhar_no !== initial_data?.aadhar_no) {
        payload.students_data.aadhar_no = values.aadhar_no
      }

      const updated_student: any = await updateStudent({ student_id: initial_data!.id, payload: payload })

      if (updated_student.data) {
        toast({
          variant: "default",
          title: "Student has been updated !",
        })

        // Fetch the updated student list for the current class
        const response = await getStudentForClass({
          class_id: initial_data!.class_id,
          page: 1,
          student_meta: true,
        })

        // Update the parent component's state with the new data
        if (response.data && setListedStudentForSelectedClass) {
          setListedStudentForSelectedClass(response.data.data)
        }

        if (response.data && setPaginationDataForSelectedClass) {
          setPaginationDataForSelectedClass(response.data.meta)
        }

        onClose()
      }

      if (updated_student.error) {
        console.log("Check this", updated_student.error)
        updated_student.error.data.errors.map((error: any) => {
          toast({
            variant: "destructive",
            title: error,
          })
        })
      }
    } else {
      toast({
        variant: "destructive",
        title: "Internal Error !",
      })
    }
  }

  const handleNextTab = useCallback(async () => {
    if (activeTab === "personal") setActiveTab("family")
    else if (activeTab === "family") setActiveTab("academic")
    else if (activeTab === "academic") setActiveTab("other")
    else if (activeTab === "other") setActiveTab("address")
    else if (activeTab === "address") setActiveTab("bank")
  }, [activeTab, setActiveTab, form.getValues])

  const handlePreviousTab = useCallback(() => {
    if (activeTab === "family") setActiveTab("personal")
    else if (activeTab === "academic") setActiveTab("family")
    else if (activeTab === "other") setActiveTab("academic")
    else if (activeTab === "address") setActiveTab("other")
    else if (activeTab === "bank") setActiveTab("address")
  }, [activeTab])

  useEffect(() => {
    if (form_type === "update") {
      const CurrentClass = available_classes?.filter((cls) => cls.id === initial_data?.class_id)[0]
      if (CurrentClass) handleClassChange(CurrentClass.class, "class")
      if (CurrentClass) handleDivisionChange(CurrentClass.id.toString(), "class")

      const CurrentDivision = available_classes?.filter((cls) => cls.id === initial_data?.class_id)[0]

      const AdmissionClass = available_classes?.filter(
        (cls) => cls.id === initial_data?.student_meta?.admission_class_id,
      )[0]
      if (AdmissionClass) handleClassChange(AdmissionClass.class, "admission_Class")
      if (AdmissionClass) handleClassChange(AdmissionClass.id.toString(), "admission_Class")

      const AdmissionDivision = available_classes?.filter(
        (cls) => cls.id === initial_data?.student_meta?.admission_class_id,
      )[0]

      form.reset({
        first_name: initial_data?.first_name,
        last_name: initial_data?.last_name,
        middle_name: initial_data?.middle_name,
        first_name_in_guj: initial_data?.first_name_in_guj,
        middle_name_in_guj: initial_data?.middle_name_in_guj,
        gender: initial_data?.gender,
        birth_date: formatData(initial_data!.birth_date),
        gr_no: initial_data?.gr_no,
        primary_mobile: initial_data?.primary_mobile,
        father_name: initial_data?.father_name,
        father_name_in_guj: initial_data?.father_name_in_guj,
        mother_name: initial_data?.mother_name,
        mother_name_in_guj: initial_data?.mother_name_in_guj,
        roll_number: initial_data?.roll_number,
        aadhar_no: Number(initial_data?.aadhar_no),
        aadhar_dise_no: Number(initial_data?.student_meta?.aadhar_dise_no),
        birth_place: initial_data?.student_meta?.birth_place,
        birth_place_in_guj: initial_data?.student_meta?.birth_place_in_guj,
        religiion: initial_data?.student_meta?.religiion,
        religiion_in_guj: initial_data?.student_meta?.religiion_in_guj,
        caste: initial_data?.student_meta?.caste,
        caste_in_guj: initial_data?.student_meta?.caste_in_guj,
        category: initial_data?.student_meta?.category,
        privious_school: initial_data?.student_meta?.privious_school,
        privious_school_in_guj: initial_data?.student_meta?.privious_school_in_guj,
        address: initial_data?.student_meta?.address,
        district: initial_data?.student_meta?.district,
        city: initial_data?.student_meta?.city,
        state: initial_data?.student_meta?.state,
        postal_code: initial_data?.student_meta?.postal_code
          ? initial_data.student_meta.postal_code.toString()
          : undefined,
        bank_name: initial_data?.student_meta?.bank_name,
        account_no: Number(initial_data?.student_meta?.account_no),
        admission_date: formatData(initial_data!.student_meta!.admission_date),
        IFSC_code: initial_data?.student_meta?.IFSC_code,
        last_name_in_guj: initial_data?.last_name_in_guj,
        secondary_mobile: initial_data!.student_meta!.secondary_mobile,
        admission_class: AdmissionDivision?.class,
        admission_division: AdmissionDivision?.division,
        class: CurrentDivision?.class,
        division: CurrentDivision?.division,
      })
    }
  }, [AcademicClasses])

  useEffect(() => {
    if (!AcademicClasses && authState.user) {
      getAcademicClasses(authState.user!.school_id)
    }
  }, [setSelectedClass, setSelectedDivision])

  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const tabToActivate = tabMapping[firstErrorField];
      setActiveTab(tabToActivate);
  
      // Focus on the input field with the error
      setTimeout(() => {
        inputRefs.current[firstErrorField]?.focus();
      }, 0);
    }
  }, [form.formState.errors]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!AcademicClasses || AcademicClasses.length === 0) {
    return <div>No classes available. Please add classes first.</div>
  }

  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="bank">Bank</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                        <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                        <Input {...field}  />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                        <Input {...field}  />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middle_name_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <FormLabel>Birth Place (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control}
                                      name="aadhar_no"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Aadhar Number</FormLabel>
                                          <FormControl>
                                            <Input type="number" {...field} onChange={(e) => field.onChange(Number.parseInt(e.target.value))} />
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
                        <FormLabel>Aadhar DISE Number</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(+e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="family">
            <Card>
              <CardHeader>
                <CardTitle>Family Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="father_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="father_name_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Name (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mother_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mother_name_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primary_mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Mobile</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(+e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondary_mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Mobile</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(+e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Academic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gr_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GR Number</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(+e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="roll_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(+e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
  control={form.control}
  name="admission_class"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Admission Class</FormLabel>
      <Select
        value={field.value}
        onValueChange={(value) => {
          field.onChange(value);
          handleClassChange(value, "admission_Class");
        }}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value=" " disabled>
            Classes
          </SelectItem>
                            
          {AcademicClasses.map(
            (cls, index) =>
              cls.divisions.length > 0 && (
                <SelectItem key={index} value={cls.class.toString()}>
                  Class {cls.class}
                </SelectItem>
              ),
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
                  <FormField
                    control={form.control}
                    name="admission_division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Division</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleDivisionChange(value, "admission_Class")
                          }}
                          disabled={!selectedAdmissionClass}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Division" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value=" " disabled>
                              Divisions
                            </SelectItem>
                            {availableDivisionsForAdmissionClass &&
                              availableDivisionsForAdmissionClass.divisions.map((division, index) => (
                                <SelectItem key={index} value={division.division}>
                                  {`${division.division} ${division.aliases ? "- " + division.aliases : ""}`}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Class</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleClassChange(value, "class")
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value=" " disabled>
                              Classes
                            </SelectItem>
                            {AcademicClasses.map(
                              (cls, index) =>
                                cls.divisions.length > 0 && (
                                  <SelectItem key={index} value={cls.class.toString()}>
                                    Class {cls.class}
                                  </SelectItem>
                                ),
                            )}
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
                        <FormLabel>Current Division</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleDivisionChange(value, "class")
                          }}
                          disabled={!selectedClass}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Division" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value=" " disabled>
                              Divisions
                            </SelectItem>
                            {availableDivisions &&
                              availableDivisions.divisions.map((division, index) => (
                                <SelectItem key={index} value={division.division}>
                                  {`${division.division} ${division.aliases ? "- " + division.aliases : ""}`}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="privious_school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous School</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Previous School (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="other">
            <Card>
              <CardHeader>
                <CardTitle>Other Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <FormLabel>Religion (Gujarati)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="caste"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caste</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="caste_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caste (Gujarati)</FormLabel>
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
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle>Address Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                           <Input  type="number" {...field} />
                                         </FormControl>
                                         <FormMessage />
                                       </FormItem>
                                     )}
                                   />
                                 </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousTab}>
                  Previous
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="bank">
            <Card>
              <CardHeader>
                <CardTitle>Bank Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <Input type="number" {...field} onChange={(e) => field.onChange(+e.target.value)} />
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
              </CardContent>
               <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handlePreviousTab}>
                Previous
              </Button>
              <Button type="submit">
                {!isStundetGetingUpdate && (form_type === "create" ? "Submit" : "Update")}
                {isStundetGetingUpdate && <Loader2 className="animate-spin" />}
              </Button>
            </CardFooter>
                  
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}

export default StudentForm

