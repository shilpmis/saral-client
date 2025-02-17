import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import schoolReducer from './slices/schoolSlice'
import academicReducer from "./slices/academicSlice";
import staffReducer from "./slices/staffSlice";
import userManagementReducer from "./slices/userManagementSlice";
import { Authapi } from "@/services/AuthService";
import { SchoolApi } from "@/services/SchoolServices";
import { AcademicApi } from "@/services/AcademicService";
import { StaffApi } from "@/services/StaffService";
import { StudentApi } from "@/services/StundetServices";


const store = configureStore({
  reducer: {
    auth: authReducer,
    school : schoolReducer,
    academic : academicReducer,
    staff : staffReducer,
    userManagement: userManagementReducer,
    [Authapi.reducerPath]: Authapi.reducer,
    [SchoolApi.reducerPath] : SchoolApi.reducer, 
    [AcademicApi.reducerPath] : AcademicApi.reducer,
    [StaffApi.reducerPath] : StaffApi.reducer,
    [StudentApi.reducerPath] : StudentApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    Authapi.middleware ,
    SchoolApi.middleware,
    AcademicApi.middleware,
    StaffApi.middleware,
    StudentApi.middleware
  ),
})

export type RootState = ReturnType<typeof store.getState>
export type SchoolState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store

