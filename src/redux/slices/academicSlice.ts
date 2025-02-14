import { createClasses } from "@/services/AcademicService"
import { AcademicClasses } from "@/types/academic"
import { Class } from "@/types/class"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface AcademicState {
  academicClasses: AcademicClasses | null
  classes: Class[]
  loading: boolean
  error: string | null
}

const initialState: AcademicState = {
  academicClasses: null,
  classes: [],
  loading: false,
  error: null,
}

const academicSlice = createSlice({
  name: "academic",
  initialState,
  reducers: {
    // setAcademicYear: (state, action: PayloadAction<AcademicYear>) => {
    //   state.academicClasses = action.payload
    // },
    // setClasses: (state, action: PayloadAction<Class[]>) => {
    //   state.classes = action.payload
    // },
    // addClass: (state, action: PayloadAction<Class>) => {
    //   state.classes.push(action.payload)
    // },
    // updateClass: (state, action: PayloadAction<Class>) => {
    //   const index = state.classes.findIndex(
    //     (c: { school_id: any; class: any }) => c.school_id === action.payload.school_id && c.class === action.payload.class,
    //   )
    //   if (index !== -1) {
    //     state.classes[index] = action.payload
    //   }
    // },
    // // removeClass: (state, action: PayloadAction<{ school_id: number; class: string }>) => {
    // //   state.classes = state.classes.filter(
    // //     (c) => !(c.school_id === action.payload.school_id && c.class === action.payload.class),
    // //   )
    // // },
    // setLoading: (state, action: PayloadAction<boolean>) => {
    //   state.loading = action.payload
    // },
    // setError: (state, action: PayloadAction<string | null>) => {
    //   state.error = action.payload
    // },
  },
  extraReducers : (builder) => {
    builder
    .addCase(createClasses.fulfilled , (state) => {
      // window.location.reload()
    })
  }
})

export const {  } =
  academicSlice.actions

export default academicSlice.reducer

