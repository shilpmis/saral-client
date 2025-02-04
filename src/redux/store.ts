import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import ApiService from "@/services/ApiService"
import { api } from "../services/Api"
import academicReducer from "./slices/academicSlice";
import roleReducer from "./slices/roleSlice";
import userManagementReducer from "./slices/userManagementSlice";
// Initialize the API service
ApiService.init()

const store = configureStore({
  reducer: {
    auth: authReducer,
    academic : academicReducer,
    role: roleReducer,
    userManagement: userManagementReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store

