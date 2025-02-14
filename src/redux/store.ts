import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import schoolReducer from './slices/schoolSlice'
import academicReducer from "./slices/academicSlice";
import roleReducer from "./slices/roleSlice";
import userManagementReducer from "./slices/userManagementSlice";
import { Authapi } from "@/services/AuthService";
import { SchoolApi } from "@/services/SchoolServices";
import { AcademicApi } from "@/services/AcademicService";


const store = configureStore({
  reducer: {
    auth: authReducer,
    school : schoolReducer,
    academic : academicReducer,
    role: roleReducer,
    userManagement: userManagementReducer,
    // leaveManagement : leaveManagementReducer,
    [Authapi.reducerPath]: Authapi.reducer,
    [SchoolApi.reducerPath] : SchoolApi.reducer, 
    [AcademicApi.reducerPath] : AcademicApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    Authapi.middleware ,
    SchoolApi.middleware,
    AcademicApi.middleware
  ),
})

export type RootState = ReturnType<typeof store.getState>
export type SchoolState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store

