"use client"

import type React from "react"
import { useRef } from "react"
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
import { selectActiveAccademicSessionsForSchool, selectAuthState } from "@/redux/slices/authSlice"
import { toast } from "@/hooks/use-toast"
import { useLazyGetAcademicClassesQuery } from "@/services/AcademicService"
import {
  useAddSingleStudentMutation,
  useLazyFetchStudentForClassQuery,
  useUpdateStudentMutation,
} from "@/services/StudentServices"
import { useConvertQueryToStudentMutation } from "@/services/InquiryServices"
import type { z } from "zod"
import type { Student, StudentEntry, UpdateStudent } from "@/types/student"
import { Loader2 } from 'lucide-react'
import { useTranslation } from "@/redux/hooks/useTranslation"
import { NumberInput } from "../ui/NumberInput"

interface StudentFormProps {
  onClose: () => void
  form_type: "create" | "update" | "view"
  is_use_for_onBoarding?: boolean
  inquiry_id?: number
  initial_data?: Student | null
  setListedStudentForSelectedClass?: (data: any) => void
  setPaginationDataForSelectedClass?: (data: any) => void
  onSubmitSuccess?: (studentData: Student) => void
  onSubmitError?: (error: any) => void
}

const StudentForm: React.FC<StudentFormProps> = ({
  onClose,
  initial_data,
  form_type,
  setListedStudentForSelectedClass,
  setPaginationDataForSelectedClass,
  onSubmitSuccess,
  is_use_for_onBoarding,
  inquiry_id,
  onSubmitError
}) => {
  const formatData = (value: any): string => {
    return value ? new Date(value).toISOString().split("T")[0] : " "
  }

  const AcademicClasses = useAppSelector(selectAcademicClasses)
  const authState = useAppSelector(selectAuthState)
  const isLoading = useAppSelector((state) => state.academic.loading)
  const { t } = useTranslation()

  const CurrentAcademicSessionForSchool = useAppSelector(selectActiveAccademicSessionsForSchool)

  const customStudentSchema = studentSchema
    .refine(
      (data) => {
        if (data.class) {
          return data.division !== undefined && data.division !== null && data.division !== ""
        }
        return true
      },
      {
        message: "Division cannot be null if class is selected",
        path: ["division"],
      },
    )
    .refine(
      (data) => {
        if (data.admission_date && data.birth_date) {
          const admissionDate = new Date(data.admission_date)
          const birthDate = new Date(data.birth_date)
          return admissionDate > birthDate
        }
        return true
      },
      {
        message: "Admission date must be greater than birth date",
        path: ["admission_date"],
      },
    )

  // Add this function after the customStudentSchema definition
  const validateDates = (birthDate: string, admissionDate: string) => {
    if (birthDate && admissionDate) {
      const birth = new Date(birthDate)
      const admission = new Date(admissionDate)
      return admission > birth
    }
    return true
  }

  const form = useForm<StudentFormData>({
    resolver: zodResolver(customStudentSchema),
    defaultValues: {
      first_name: "",
      middle_name: null,
      last_name: "",
      first_name_in_guj: null,
      middle_name_in_guj: null,
      last_name_in_guj: null,
      gender: undefined,
      birth_date: "",
      birth_place: null,
      birth_place_in_guj: null,
      aadhar_no: null,
      aadhar_dise_no: null,

      father_name: null,
      father_name_in_guj: null,
      mother_name: null,
      mother_name_in_guj: null,
      primary_mobile: undefined,
      secondary_mobile: null,

      gr_no: undefined,
      roll_number: null,
      admission_date: "",
      admission_class: null,
      admission_division: null,
      class: undefined,
      division: undefined,
      privious_school: null,
      privious_school_in_guj: null,

      religion: null,
      religion_in_guj: null,
      caste: null,
      caste_in_guj: null,
      category: null, // Default to "OPEN"

      address: null,
      district: null,
      city: null,
      state: null,
      postal_code: null,

      bank_name: null,
      account_no: null,
      IFSC_code: null,
    },
  })

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
    religion: "other",
    religion_in_guj: "other",
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
  }

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const [
    getAcademicClasses,
    { isLoading: isLoadingForAcademicClasses, isError: isErrorWhileFetchingClass, error: errorWhiwlFetchingClass },
  ] = useLazyGetAcademicClassesQuery()

  const [updateStudent, { isLoading: isStundetGetingUpdate, isError: errorWhileUpdateStudent }] =
    useUpdateStudentMutation()

  const [createStudent, { isLoading: isStundetGetingCreate, isError: errorWhileCreateStudent }] =
    useAddSingleStudentMutation()

  const [convertInquiryToStudent, { isLoading: isOnBoardingStudent, isError: errorWhileOnBoardingStudent }] =
    useConvertQueryToStudentMutation()

  const [selectedClass, setSelectedClass] = useState<string>("")
  // const [selectedDivision, setSelectedDivision] = useState<Division | null>(null)
  // const [selectedAdmissionDivision, setselectedAdmissionDivision] = useState<Division | null>(null)
  const [selectedAdmissionClass, setselectedAdmissionClass] = useState<string>("")
  const [activeTab, setActiveTab] = useState("personal")
  const [getStudentForClass, { data: studentDataForSelectedClass }] = useLazyFetchStudentForClassQuery()

  const availableDivisions = useMemo<AcademicClasses | null>(() => {
    if (AcademicClasses && selectedClass) {
      return AcademicClasses!.filter((cls) => {
        if (cls.id.toString() === selectedClass) {
          return cls
        }
      })[0]
    } else {
      return null
    }
  }, [AcademicClasses, selectedClass])

  const available_division = useMemo<Division[] | null>(() => {
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
        if (cls.id.toString() === selectedAdmissionClass) {
          return cls
        }
      })[0]
    } else {
      return null
    }
  }, [AcademicClasses, selectedAdmissionClass])

  const handleClassChange = useCallback(
    (class_id: string, type: "admission_Class" | "class") => {
      if (type === "admission_Class") {
        setselectedAdmissionClass(class_id)
        // setselectedAdmissionDivision(null)
        form.setValue("admission_division", "") // Reset division when class changes
      } else {
        setSelectedClass(class_id)
        // setSelectedDivision(null)
        form.setValue("division", "") // Reset division when class changes
      }
    },
    [setSelectedClass, form.setValue],
  )

  const handleDivisionChange = useCallback(
    (division_id: string, type: "admission_Class" | "class") => {
      if (type === "admission_Class") {
        const selectedDiv = availableDivisions?.divisions.find((div) => div.id.toString() === division_id)
        // setSelectedDivision(selectedDiv || null)
      } else {
        const selectedDiv = availableDivisionsForAdmissionClass?.divisions.find(
          (div) => div.id.toString() === division_id,
        )
        // setselectedAdmissionDivision(selectedDiv || null)
      }
    },
    [availableDivisions, availableDivisionsForAdmissionClass],
  )

  const handleSubmit: SubmitHandler<StudentFormData> = async (values: z.infer<typeof customStudentSchema>) => {
    const errors = form.formState.errors
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]
      const tabToActivate = tabMapping[firstErrorField]
      setActiveTab(tabToActivate)
      return
    }

    const firstErrorField = Object.keys(errors)[0]
    setTimeout(() => {
      inputRefs.current[firstErrorField]?.focus()
    }, 0)

    if (form_type === "create") {

      const CurrentClass = available_division?.filter(
        (division) => division.class_id == Number(values?.class) && division.id == Number(values.division),
      )[0]
      // const AdmissionClass = available_division?.filter(
      //   (division) => division.class_id == Number(values?.admission_class) && division.id == Number(values.admission_division),
      // )[0]


      const payload: StudentEntry = {
        students_data: {
          class_id: CurrentClass!.id,
          first_name: values.first_name,
          middle_name: values.middle_name ?? null,
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
          religion: values.religion,
          religion_in_guj: values.religion_in_guj,
          caste: values.caste,
          caste_in_guj: values.caste_in_guj,
          category: values.category,
          admission_date: values.admission_date,
          admission_class_id: null,
          secondary_mobile: values.secondary_mobile,
          privious_school: values.privious_school,
          privious_school_in_guj: values.privious_school_in_guj,
          address: values.address,
          district: values.district,
          city: values.city,
          state: values.state,
          postal_code: values.postal_code ?? null,
          bank_name: values.bank_name,
          account_no: values.account_no,
          IFSC_code: values.IFSC_code,
        },
      }

      if (is_use_for_onBoarding) {
        if (!inquiry_id) {
          toast({
            variant: "destructive",
            title: "Internal Error ! Inquiry Id not found",
          })
          return
        }
        try {
          // const res = await convertInquiryToStudent({
          //   inquiry_id: inquiry_id,
          //   payload: payload,
          // }).unwrap()

          // if (onSubmitSuccess) {
          //   onSubmitSuccess({...res , class_id :payload.students_data.class_id})
          // } else {
          //   onClose()
          // }

        } catch (error) {
          console.log("Error while converting inquiry to student:", error)
          onSubmitError && onSubmitError(error);
        }
      }
      else {
        try {
          const response = await createStudent({
            payload: payload,
            academic_session: CurrentAcademicSessionForSchool!.id,
          }).unwrap()

          toast({
            variant: "default",
            title: "Success",
            description: "Student Created Successfully",
          })
          if (onSubmitSuccess) {
            onSubmitSuccess({ ...response.data, class_id: payload.students_data.class_id })
          } else {
            onClose()
          }
        } catch (error: any) {
          console.log("Error while Update Student :", error)
          if (error?.data?.errors?.code === "E_VALIDATION_ERROR") {
            error.data.errors.messages.map((msg: any) => {
              toast({
                variant: "destructive",
                title: "Validation Error",
                description: msg.message,
              })
            })
          } else {
            console.log("Error while Update Student :", error)
            toast({
              variant: "destructive",
              title: "Internal Error ! Please Check Developer Mode",
            })
          }
        }
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
      if (values.religion !== initial_data?.student_meta?.religion) {
        payload.student_meta_data.religion = values.religion
      }
      if (values.religion_in_guj !== initial_data?.student_meta?.religion_in_guj) {
        payload.student_meta_data.religion_in_guj = values.religion_in_guj
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
        payload.student_meta_data.admission_date = values.admission_date ? formatData(values.admission_date) : null
      }
      if (values.admission_division !== initial_data?.student_meta?.admission_class_id?.toString()) {
        payload.student_meta_data.admission_class_id = values.admission_division
          ? Number(values.admission_division)
          : null
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
      // if (values.address !== initial_data?.student_meta?.address) {
      //   payload.student_meta_data.address = values.address
      // }
      if (values.district !== initial_data?.student_meta?.district) {
        payload.student_meta_data.district = values.district
      }
      if (values.city !== initial_data?.student_meta?.city) {
        payload.student_meta_data.city = values.city
      }
      if (values.state !== initial_data?.student_meta?.state) {
        payload.student_meta_data.state = values.state
      }
      if (values.postal_code !== initial_data?.student_meta?.postal_code) {
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
        payload.students_data.birth_date = values.birth_date ?? null
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

      try {
        const updated_student: any = await updateStudent({ student_id: initial_data!.id, payload: payload }).unwrap()
        toast({
          variant: "default",
          title: "Student has been updated !",
        })
        // Fetch the updated student list for the current class
        const response = await getStudentForClass({
          class_id: initial_data!.class_id,
          page: 1,
          student_meta: true,
          academic_session: CurrentAcademicSessionForSchool!.id,
        })

        // Update the parent component's state with the new data
        if (response.data) {
          if (setListedStudentForSelectedClass) setListedStudentForSelectedClass(response.data.data)
          if (setPaginationDataForSelectedClass) setPaginationDataForSelectedClass(response.data.meta)
          if (onSubmitSuccess) {
            onSubmitSuccess({ ...response.data, class_id: payload.students_data.class_id })
          } else {
            onClose()
          }
        }
      } catch (error: any) {
        console.log("Erro while adding student :", error)
        if (error?.data?.errors?.code === "E_VALIDATION_ERROR") {
          error.data.errors.messages.map((msg: any) => {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: msg.message,
            })
          })
        } else {
          console.log("Erro while Update Student :", error)
          toast({
            variant: "destructive",
            title: "Internal Error ! Please Check Developer Mode",
          })
        }
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
      const CurrentClass = available_division?.filter((cls) => cls.id === initial_data?.class_id)[0]
      if (CurrentClass) handleClassChange(CurrentClass.id.toString(), "class")
      if (CurrentClass) handleDivisionChange(CurrentClass.id.toString(), "class")

      const CurrentDivision = available_division?.filter((cls) => cls.id === initial_data?.class_id)[0]

      const AdmissionClass = available_division?.filter(
        (cls) => cls.id === initial_data?.student_meta?.admission_class_id,
      )[0]

      if (AdmissionClass) handleClassChange(AdmissionClass.id.toString(), "admission_Class")
      // if (AdmissionClass) handleClassChange(AdmissionClass.id.toString(), "admission_Class")

      const AdmissionDivision = available_division?.filter(
        (cls) => cls.id === initial_data?.student_meta?.admission_class_id,
      )[0];


      form.reset({
        first_name: initial_data?.first_name,
        last_name: initial_data?.last_name,
        middle_name: initial_data?.middle_name ? initial_data?.middle_name : null,
        first_name_in_guj: initial_data?.first_name_in_guj,
        middle_name_in_guj: initial_data?.middle_name_in_guj,
        gender: initial_data?.gender,
        birth_date: initial_data?.birth_date ? formatData(initial_data.birth_date) : "",
        gr_no: initial_data?.gr_no,
        primary_mobile: initial_data?.primary_mobile,
        father_name: initial_data?.father_name,
        father_name_in_guj: initial_data?.father_name_in_guj,
        mother_name: initial_data?.mother_name,
        mother_name_in_guj: initial_data?.mother_name_in_guj,
        roll_number: initial_data?.roll_number,
        aadhar_no: initial_data?.aadhar_no ? Number(initial_data?.aadhar_no) : undefined,
        aadhar_dise_no: initial_data?.student_meta?.aadhar_dise_no
          ? Number(initial_data?.student_meta?.aadhar_dise_no)
          : undefined,
        birth_place: initial_data?.student_meta?.birth_place,
        birth_place_in_guj: initial_data?.student_meta?.birth_place_in_guj,
        religion: initial_data?.student_meta?.religion,
        religion_in_guj: initial_data?.student_meta?.religion_in_guj,
        caste: initial_data?.student_meta?.caste,
        caste_in_guj: initial_data?.student_meta?.caste_in_guj,
        category: initial_data?.student_meta?.category,
        privious_school: initial_data?.student_meta?.privious_school,
        privious_school_in_guj: initial_data?.student_meta?.privious_school_in_guj,
        address: initial_data?.student_meta?.address,
        district: initial_data?.student_meta?.district,
        city: initial_data?.student_meta?.city,
        state: initial_data?.student_meta?.state,
        postal_code: initial_data?.student_meta?.postal_code ? initial_data.student_meta.postal_code.toString() : null,
        bank_name: initial_data?.student_meta?.bank_name,
        account_no: initial_data?.student_meta?.account_no ? Number(initial_data?.student_meta?.account_no) : null,
        admission_date: initial_data!.student_meta!.admission_date
          ? formatData(initial_data!.student_meta!.admission_date)
          : null,
        IFSC_code: initial_data?.student_meta?.IFSC_code || null,
        last_name_in_guj: initial_data?.last_name_in_guj,
        secondary_mobile: initial_data!.student_meta!.secondary_mobile,
        admission_class: null,
        admission_division: null,
        class: CurrentDivision?.class_id.toString(),
        division: CurrentDivision?.id.toString(),
      })

    } else if (form_type === "create" && initial_data && is_use_for_onBoarding) {

      /**
       * While Onbarding, we need to set the class and division based on the initial data
       * where intial_data has class_id as a id of a class not division . so need to find the class according to this and 
       * set class and admission class , also call method to fetch division for this class   
       */

      if (initial_data?.class_id && AcademicClasses) {

        const CurrentClass = AcademicClasses?.filter((cls) => cls.id === initial_data.class_id)[0];
        if (CurrentClass) handleClassChange(CurrentClass.id.toString(), "class")
        if (CurrentClass) handleDivisionChange(CurrentClass.id.toString(), "class")

        const AdmissionClass = AcademicClasses?.filter(
          (cls) => cls.id === initial_data?.class_id,
        )[0]

        if (AdmissionClass) handleClassChange(AdmissionClass.id.toString(), "admission_Class")
        if (AdmissionClass) handleClassChange(AdmissionClass.id.toString(), "admission_Class")

      }

      // Set initial form values from the inquiry data
      form.reset({
        first_name: initial_data.first_name || "",
        middle_name: initial_data.middle_name || null,
        last_name: initial_data.last_name || "",
        first_name_in_guj: initial_data.first_name_in_guj || null,
        middle_name_in_guj: initial_data.middle_name_in_guj || null,
        last_name_in_guj: initial_data.last_name_in_guj || null,
        gender: initial_data.gender,
        birth_date: initial_data.birth_date ? formatData(initial_data.birth_date) : "",
        gr_no: initial_data.gr_no,
        primary_mobile: initial_data.primary_mobile,
        father_name: initial_data.father_name || null,
        father_name_in_guj: initial_data.father_name_in_guj || null,
        mother_name: initial_data.mother_name || null,
        mother_name_in_guj: initial_data.mother_name_in_guj || null,
        class: initial_data?.class_id ? initial_data?.class_id.toString() : undefined,

        roll_number: initial_data?.roll_number || null,
        aadhar_no: initial_data?.aadhar_no ? Number(initial_data?.aadhar_no) : null,
        aadhar_dise_no: initial_data?.student_meta?.aadhar_dise_no
          ? Number(initial_data?.student_meta?.aadhar_dise_no)
          : null,
        birth_place: initial_data?.student_meta?.birth_place || null,
        birth_place_in_guj: initial_data?.student_meta?.birth_place_in_guj || null,
        religion: initial_data?.student_meta?.religion || null,
        religion_in_guj: initial_data?.student_meta?.religion_in_guj || null,
        caste: initial_data?.student_meta?.caste || null,
        caste_in_guj: initial_data?.student_meta?.caste_in_guj || null,
        category: initial_data?.student_meta?.category || null,
        privious_school: initial_data?.student_meta?.privious_school || null,
        privious_school_in_guj: initial_data?.student_meta?.privious_school_in_guj || null,
        address: initial_data?.student_meta?.address || null,
        district: initial_data?.student_meta?.district || null,
        city: initial_data?.student_meta?.city || null,
        state: initial_data?.student_meta?.state || null,
        postal_code: initial_data?.student_meta?.postal_code ? initial_data.student_meta.postal_code.toString() : null,
        bank_name: initial_data?.student_meta?.bank_name || null,
        account_no: initial_data?.student_meta?.account_no ? Number(initial_data?.student_meta?.account_no) : null,
        // admission_date: initial_data!.student_meta!.admission_date
        //   ? formatData(initial_data!.student_meta!.admission_date)
        //   : null,
        IFSC_code: initial_data?.student_meta?.IFSC_code || null,
        secondary_mobile: initial_data?.student_meta?.secondary_mobile || null,
        admission_class: null,
        admission_division: null,
      })
    }
    else {
    }
  }, [AcademicClasses, initial_data, form_type, form.reset])

  useEffect(() => {
    if (!AcademicClasses && authState.user) {
      getAcademicClasses(authState.user!.school_id)
    }
  }, [setSelectedClass])

  useEffect(() => {
    const errors = form.formState.errors;
    console.log("errors", errors)
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0]
      const tabToActivate = tabMapping[firstErrorField]
      setActiveTab(tabToActivate)

      // Focus on the input field with the error
      setTimeout(() => {
        inputRefs.current[firstErrorField]?.focus()
      }, 0)
    }
  }, [form.formState.errors])


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
            <TabsTrigger value="personal">{t("personal")}</TabsTrigger>
            <TabsTrigger value="family">{t("family")}</TabsTrigger>
            <TabsTrigger value="academic">{t("academic")}</TabsTrigger>
            <TabsTrigger value="other">{t("other")}</TabsTrigger>
            <TabsTrigger value="address">{t("address")}</TabsTrigger>
            <TabsTrigger value="bank">{t("bank")}</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>{t("personal_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t("first_name")}</FormLabel>
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
                        <FormLabel>{t("middle_name")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel required>{t("last_name")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>{t("first_name")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel>{t("middle_name")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel>{t("last_name")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel required>{t("gender")}</FormLabel>
                        <Select
                          // onValueChange={field.onChange}]
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">{t("male")}</SelectItem>
                            <SelectItem value="Female">
                              {t("female")}
                            </SelectItem>
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
                        <FormLabel required>{t("date_of_birth")}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e.target.value || null)
                              // Trigger validation when birth date changes
                              const admissionDate = form.getValues('admission_date')
                              if (admissionDate && e.target.value) {
                                if (!validateDates(e.target.value, admissionDate)) {
                                  form.setError('admission_date', {
                                    type: 'manual',
                                    message: 'Admission date must be greater than birth date'
                                  })
                                } else {
                                  form.clearErrors('admission_date')
                                }
                              }
                            }}
                          />
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
                        <FormLabel>{t("birth_place")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel>{t("birth_place")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="aadhar_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("aadhar_no")}</FormLabel>
                        <FormControl>
                          <NumberInput
                            {...field}
                            value={field.value ? String(field.value) : ""}
                            onChange={(value) =>
                              field.onChange(value ? Number(value) : undefined)
                            }
                          />
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
                        <FormLabel>{t("aadhar_DISE_number")}</FormLabel>
                        <FormControl>
                          <NumberInput
                            {...field}
                            value={field.value ? String(field.value) : ""}
                            onChange={(value) =>
                              field.onChange(value ? Number(value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="button" onClick={handleNextTab}>
                  {t("next")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="family">
            <Card>
              <CardHeader>
                <CardTitle>{t("family_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="father_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("father's_name")}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} />
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
                        <FormLabel>{t("father's_name")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel>{t("mother's_name")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel>{t("mother's_name")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel required>{t("mobile_no")}</FormLabel>
                        <FormControl>
                          <NumberInput
                            {...field}
                            value={(field.value === undefined || field.value === null) ? "" : String(field.value)}
                            onChange={(value) => {
                              field.onChange(value === "" ? undefined : Number(value))
                            }}
                          />
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
                        <FormLabel>{t("other_mobile_no")}</FormLabel>
                        <FormControl>
                          <NumberInput
                            {...field}
                            value={field.value == null ? "" : String(field.value)}
                            onChange={(value) => {
                              field.onChange((value === "" || isNaN(Number(value))) ? null : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousTab}
                >
                  {t("previous")}
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  {t("next")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>{t("academic_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gr_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t("gr_no")}</FormLabel>
                        <FormControl>
                          <NumberInput
                            {...field}
                            value={field.value ? String(field.value) : ""}
                            onChange={(value) =>
                              field.onChange(value ? Number(value) : undefined)
                            }
                          />
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
                        <FormLabel>{t("roll_number")}</FormLabel>
                        <FormControl>
                          <NumberInput
                            {...field}
                            value={field.value ? String(field.value) : ""}
                            onChange={(value) =>
                              field.onChange(value ? Number(value) : undefined)
                            }
                          />
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
                        <FormLabel required>{t("admission_date")}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e.target.value || null)
                              // Trigger validation when admission date changes
                              const birthDate = form.getValues('birth_date')
                              if (birthDate && e.target.value) {
                                if (!validateDates(birthDate, e.target.value)) {
                                  form.setError('admission_date', {
                                    type: 'manual',
                                    message: 'Admission date must be greater than birth date'
                                  })
                                } else {
                                  form.clearErrors('admission_date')
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="admission_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("admission_class")}</FormLabel>
                        <Select
                          value={field.value ||  ""}
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleClassChange(value, "admission_Class")
                          }}
                          disabled={is_use_for_onBoarding}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("select_class")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value=" " disabled>
                              {t("classes")}
                            </SelectItem>

                            {AcademicClasses.map(
                              (cls, index) =>
                                cls.divisions.length > 0 && (
                                  <SelectItem key={index} value={cls.id.toString()}>
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
                        <FormLabel>{t("admission_division")}</FormLabel>
                        <Select
                          value={field.value ||  ""}
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleDivisionChange(value, "admission_Class")
                          }}
                          disabled={!selectedAdmissionClass}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("select_division")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value=" " disabled>
                              {t("divisions")}
                            </SelectItem>
                            {availableDivisionsForAdmissionClass &&
                              availableDivisionsForAdmissionClass.divisions.map((division, index) => (
                                <SelectItem key={index} value={division.id.toString()}>
                                  {`${division.division} ${division.aliases ? "- " + division.aliases : ""}`}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>   */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t("current_class")}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleClassChange(value, "class");
                          }}
                          disabled={
                            form_type === "update" || is_use_for_onBoarding
                          } // Disable selection in edit mode
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("select_class")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value=" " disabled>
                              {t("classes")}
                            </SelectItem>
                            {AcademicClasses.map(
                              (cls, index) =>
                                cls.divisions.length > 0 && (
                                  <SelectItem
                                    key={index}
                                    value={cls.id.toString()}
                                  >
                                    Class {cls.class}
                                  </SelectItem>
                                )
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
                        <FormLabel required>{t("current_division")}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleDivisionChange(value, "class");
                          }}
                          disabled={form_type === "update"} // Disable selection in edit mode
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("select_division")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value=" " disabled>
                              {t("divisions")}
                            </SelectItem>
                            {availableDivisions &&
                              availableDivisions.divisions.map(
                                (division, index) => (
                                  <SelectItem
                                    key={index}
                                    value={division.id.toString()}
                                  >
                                    {`${division.division} ${division.aliases
                                        ? "- " + division.aliases
                                        : ""
                                      }`}
                                  </SelectItem>
                                )
                              )}
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
                        <FormLabel>{t("previous_school")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel>{t("previous_school")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousTab}
                >
                  {t("previous")}
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  {t("next")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="other">
            <Card>
              <CardHeader>
                <CardTitle>{t("other_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("religion")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="religion_in_guj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("religion")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel>{t("caste")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel>{t("caste")} (Gujarati)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                      <FormLabel>{t("category")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("select_category")} />
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousTab}
                >
                  {t("previous")}
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  {t("next")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle>{t("address_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("address")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
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
                        <FormLabel>{t("district")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel>{t("city")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel>{t("state")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
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
                        <FormLabel>{t("postal_code")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousTab}
                >
                  {t("previous")}
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  {t("next")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="bank">
            <Card>
              <CardHeader>
                <CardTitle>{t("bank_details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("bank_name")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
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
                      <FormLabel>{t("account_number")}</FormLabel>
                      <FormControl>
                        <NumberInput
                          {...field}
                          value={field.value ? String(field.value) : ""}
                          onChange={(value) =>
                            field.onChange(value ? Number(value) : undefined)
                          }
                        />
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
                      <FormLabel>{t("ifsc_code")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousTab}
                >
                  {t("previous")}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isStundetGetingUpdate ||
                    isStundetGetingCreate ||
                    isOnBoardingStudent
                  }
                >
                  {(!isStundetGetingUpdate || !isStundetGetingCreate) &&
                    (form_type === "create"
                      ? is_use_for_onBoarding
                        ? t("onboard_student")
                        : t("submit")
                      : "Update")}
                  {(isStundetGetingUpdate ||
                    isStundetGetingCreate ||
                    isOnBoardingStudent) && (
                      <Loader2 className="animate-spin" />
                    )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}

export default StudentForm